/* eslint-disable no-console */
import { DepGraph } from 'dependency-graph';
import { readPackageSync } from 'read-pkg';
import fs from 'fs';
import path from 'path';
import concurrently from 'concurrently';
import waitOn from 'wait-on';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { union } from 'es-toolkit/compat';

interface StartOptions {
  entries: string;
  timeout: string;
}

interface IDependency {
  name: string;
  path: string;
}

interface IDependencyResult extends IDependency {
  unsavedDependencies: any;
}

function createGraph(dependencies: IDependency[]): DepGraph<string> {
  const graph = new DepGraph<string>();
  dependencies.forEach(dependency => {
    graph.addNode(dependency.name, dependency.path);
  });

  dependencies.forEach(dependency => {
    const pkgJson = readPackageSync({ cwd: dependency.path });
    const deps = [...Object.keys(pkgJson.dependencies || {}), ...Object.keys(pkgJson.devDependencies || {})];
    deps
      .filter(dep => !!dependencies.find(existingDependency => existingDependency.name === dep))
      .forEach(dep => {
        graph.addDependency(dependency.name, dep);
      });
  });

  return graph;
}

function createDependencyOrder(name: string, graph: DepGraph<string>, order: string[][]) {
  const dependencies = graph.dependenciesOf(name, true);

  if (dependencies.length > 0) {
    order.push(dependencies.map(dep => graph.getNodeData(dep)));
    dependencies.forEach(dep => {
      graph.removeNode(dep);
    });
    createDependencyOrder(name, graph, order);
  } else {
    order.push([graph.getNodeData(name)]);
  }
}

async function handleSequence(sequence: string[], timeout: number, entries: string[]) {
  console.log(
    chalk.blue.bold('Handling sequence:'),
    chalk.blue(JSON.stringify(sequence))
  );

  const files = sequence.filter(file => {
    return !entries.includes(file);
  }).map(pkg => path.join(pkg, '/dist/src/index.js'));

  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(chalk.red(`Deleted File: ${file}`));
    }
  });

  concurrently(sequence.map(file => {
    return `pnpm --prefix "${file}" start`;
  }), { cwd: process.cwd() });

  if (files.length > 0) {
    await waitOn({ resources: files, timeout });
  }
  console.log(
    chalk.green.bold('All files are ready: '),
    chalk.green(JSON.stringify(sequence))
  );
}

export async function start({ entries, timeout: timeoutString }: StartOptions) {
  const entriesArray = entries.trim().split(' ');
  console.log(chalk.blue.bold(`Starting ${entriesArray} with dependencies`));
  const timeout = parseInt(timeoutString);
  const dependencyResults = JSON.parse(execSync('pnpm list --recursive --depth Infinity --json --long --only-projects', { cwd: process.cwd() })
    .toString()) as IDependencyResult[];

  const dependencies = dependencyResults.map(dependency => {
    return {
      name: dependency.name,
      path: dependency.path
    };
  });

  const leaves = entriesArray.map((entry: string) => {
    const leaf = dependencies.find(dep => dep.name === entry)!;

    return leaf.path;
  });

  let maxLength = 0;
  const finalOrder: string[][] = [];

  const result = entriesArray.map(name => {
    const graph = createGraph(dependencies);
    const order: string[][] = [];

    createDependencyOrder(name, graph, order);

    maxLength = Math.max(maxLength, order.length);

    return order;
  });

  for (let i = 0; i < maxLength; i++) {
    const levelDependencies = union(...result.map(sequence => sequence[i] ?? []));
    finalOrder.push(levelDependencies);
  }

  console.log(
    chalk.blue.bold('This is the entry point: '),
    chalk.green.bold(entriesArray.join(', ')),
    '\n',
    chalk.yellow.bold(JSON.stringify({ dependencies, result }, null, 2)));

  for (let i = 0; i < finalOrder.length; i++) {
    await handleSequence(finalOrder[i], timeout, leaves);
  }
}