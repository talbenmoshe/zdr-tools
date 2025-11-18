# Fake Creator Examples

This file contains complete examples of generated fake classes.

## File Organization

**IMPORTANT**: All examples assume fakes are created in the `/fakes` folder at package root (sibling to `/src`):

```
packages/
  my-package/
    src/
      IReport.ts
      IUserService.ts
    fakes/                   # Sibling to src/, NOT inside src/
      index.ts               # Exports all fakes
      FakeReport.ts
      FakeUserService.ts
```

**Example `fakes/index.ts`:**
```typescript
// fakes/index.ts (at package root level)
export * from './FakeReport';
export * from './FakeUserService';
```

## Example 1: Simple Interface (No IEntity)

### Original Interface

```typescript
// src/IUserService.ts
export interface IUserService {
  userName: string;
  isActive: boolean;
  loginCount: number;

  login(password: string): Promise<boolean>;
  logout(): void;
  resetPassword(oldPassword: string, newPassword: string): Promise<void>;
}
```

### Generated Fake

```typescript
// fakes/FakeUserService.ts (at package root, sibling to src/)
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';

export interface FakeUserServiceInitializer {
  userName: string;
  isActive: boolean;
  loginCount: number;
  loginReturnValue: Promise<boolean>;
  logoutReturnValue: void;
  resetPasswordReturnValue: Promise<void>;
}

export class FakeUserService implements IUserService {
  public userName: string;
  public isActive: boolean;
  public loginCount: number;

  constructor(private fakeUserServiceInitialData: FakeUserServiceInitializer) {
    this.userName = fakeUserServiceInitialData.userName;
    this.isActive = fakeUserServiceInitialData.isActive;
    this.loginCount = fakeUserServiceInitialData.loginCount;
  }

  login = getMockingFunction<(password: string) => Promise<boolean>>(() => {
    return this.fakeUserServiceInitialData.loginReturnValue;
  });

  logout = getMockingFunction<() => void>(() => {
    return this.fakeUserServiceInitialData.logoutReturnValue;
  });

  resetPassword = getMockingFunction<(oldPassword: string, newPassword: string) => Promise<void>>(() => {
    return this.fakeUserServiceInitialData.resetPasswordReturnValue;
  });
}

export class FakeUserServiceBuilder {
  private userName: string = '';
  private isActive: boolean = false;
  private loginCount: number = 0;
  private loginReturnValue: Promise<boolean> = Promise.resolve(false);
  private logoutReturnValue: void = undefined;
  private resetPasswordReturnValue: Promise<void> = Promise.resolve();

  withUserName(value: string): this {
    this.userName = value;
    return this;
  }

  withIsActive(value: boolean): this {
    this.isActive = value;
    return this;
  }

  withLoginCount(value: number): this {
    this.loginCount = value;
    return this;
  }

  withLoginReturnValue(value: Promise<boolean>): this {
    this.loginReturnValue = value;
    return this;
  }

  withLogoutReturnValue(value: void): this {
    this.logoutReturnValue = value;
    return this;
  }

  withResetPasswordReturnValue(value: Promise<void>): this {
    this.resetPasswordReturnValue = value;
    return this;
  }

  protected getFakeUserServiceInitializer(): FakeUserServiceInitializer {
    return {
      userName: this.userName,
      isActive: this.isActive,
      loginCount: this.loginCount,
      loginReturnValue: this.loginReturnValue,
      logoutReturnValue: this.logoutReturnValue,
      resetPasswordReturnValue: this.resetPasswordReturnValue,
    };
  }

  build(): FakeUserService {
    return new FakeUserService(this.getFakeUserServiceInitializer());
  }
}
```

### Usage in Tests

```typescript
// Create with defaults
const userService = new FakeUserServiceBuilder().build();

// Create with specific values
const activeUser = new FakeUserServiceBuilder()
  .withUserName('john.doe')
  .withIsActive(true)
  .withLoginCount(5)
  .withLoginReturnValue(Promise.resolve(true))
  .build();

// Test the mock
await activeUser.login('password123');
expect(activeUser.login).toHaveBeenCalledWith('password123');
expect(await activeUser.login('password123')).toBe(true);
```

## Example 2: Entity Interface (Extends IEntity)

### Original Interface

```typescript
// src/IReport.ts
import type { IEntity } from '@zdr-tools/zdr-entities';

export interface IReport extends IEntity {
  title: string;
  status: string;
  createdBy: string;

  publish(): Promise<void>;
  archive(): void;
}
```

### Generated Fake

```typescript
// fakes/FakeReport.ts (at package root, sibling to src/)
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import { FakeEntity, FakeEntityBuilder, type IFakeEntityInitialData } from '@zdr-tools/zdr-entities/fakes';
import type { IReport } from '../IReport';

export interface FakeReportInitializer extends IFakeEntityInitialData {
  title: string;
  status: string;
  createdBy: string;
  publishReturnValue: Promise<void>;
  archiveReturnValue: void;
}

export class FakeReport extends FakeEntity implements IReport {
  public title: string;
  public status: string;
  public createdBy: string;

  constructor(private fakeReportInitialData: FakeReportInitializer) {
    super(fakeReportInitialData);

    this.title = fakeReportInitialData.title;
    this.status = fakeReportInitialData.status;
    this.createdBy = fakeReportInitialData.createdBy;
  }

  publish = getMockingFunction<() => Promise<void>>(() => {
    return this.fakeReportInitialData.publishReturnValue;
  });

  archive = getMockingFunction<() => void>(() => {
    return this.fakeReportInitialData.archiveReturnValue;
  });
}

export class FakeReportBuilder extends FakeEntityBuilder {
  private title: string = '';
  private status: string = '';
  private createdBy: string = '';
  private publishReturnValue: Promise<void> = Promise.resolve();
  private archiveReturnValue: void = undefined;

  withTitle(value: string): this {
    this.title = value;
    return this;
  }

  withStatus(value: string): this {
    this.status = value;
    return this;
  }

  withCreatedBy(value: string): this {
    this.createdBy = value;
    return this;
  }

  withPublishReturnValue(value: Promise<void>): this {
    this.publishReturnValue = value;
    return this;
  }

  withArchiveReturnValue(value: void): this {
    this.archiveReturnValue = value;
    return this;
  }

  protected getFakeReportInitializer(): FakeReportInitializer {
    return {
      ...this.getInitialData(), // From FakeEntityBuilder - includes id, creationTime, etc.
      title: this.title,
      status: this.status,
      createdBy: this.createdBy,
      publishReturnValue: this.publishReturnValue,
      archiveReturnValue: this.archiveReturnValue,
    };
  }

  build(): FakeReport {
    return new FakeReport(this.getFakeReportInitializer());
  }
}
```

### Usage in Tests

```typescript
// Create with defaults (includes entity fields from FakeEntityBuilder)
const report = new FakeReportBuilder().build();
console.log(report.id); // Has id from FakeEntity
console.log(report.creationTime); // Has creationTime from FakeEntity

// Create with specific values
const publishedReport = new FakeReportBuilder()
  .withId('report-123') // From FakeEntityBuilder
  .withTitle('Q4 Sales ReportTemplate')
  .withStatus('published')
  .withCreatedBy('john.doe')
  .build();
```

## Example 3: Complex Interface with EventBrokers and Collections

### Original Interface

```typescript
// src/IWorkspace.ts
import type { IEntity, IPropEventBroker, IReadablePropEventBroker, IEntityCollection } from '@zdr-tools/zdr-entities';
import type { IProject } from './IProject';

export interface IWorkspace extends IEntity {
  name: IPropEventBroker<string>;
  description: IReadablePropEventBroker<string>;
  isActive: IPropEventBroker<boolean>;
  projects: IEntityCollection<IProject>;
  owner: IProject;

  addProject(project: IProject): void;
  removeProject(projectId: string): boolean;
}
```

### Generated Fake

```typescript
// fakes/FakeWorkspace.ts (at package root, sibling to src/)
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import { FakeEntity, FakeEntityBuilder, FakesFactory, type IFakeEntityInitialData } from '@zdr-tools/zdr-entities/fakes';
import type { IPropEventBroker, IReadablePropEventBroker, IEntityCollection } from '@zdr-tools/zdr-entities';
import type { IWorkspace } from '../IWorkspace';
import type { IProject } from '../IProject';
import { FakeProjectBuilder } from './FakeProject';

export interface FakeWorkspaceInitializer extends IFakeEntityInitialData {
  name: IPropEventBroker<string>;
  description: IReadablePropEventBroker<string>;
  isActive: IPropEventBroker<boolean>;
  projects: IEntityCollection<IProject>;
  owner: IProject;
  addProjectReturnValue: void;
  removeProjectReturnValue: boolean;
}

export class FakeWorkspace extends FakeEntity implements IWorkspace {
  public name: IPropEventBroker<string>;
  public description: IReadablePropEventBroker<string>;
  public isActive: IPropEventBroker<boolean>;
  public projects: IEntityCollection<IProject>;
  public owner: IProject;

  constructor(private fakeWorkspaceInitialData: FakeWorkspaceInitializer) {
    super(fakeWorkspaceInitialData);

    this.name = fakeWorkspaceInitialData.name;
    this.description = fakeWorkspaceInitialData.description;
    this.isActive = fakeWorkspaceInitialData.isActive;
    this.projects = fakeWorkspaceInitialData.projects;
    this.owner = fakeWorkspaceInitialData.owner;
  }

  addProject = getMockingFunction<(project: IProject) => void>(() => {
    return this.fakeWorkspaceInitialData.addProjectReturnValue;
  });

  removeProject = getMockingFunction<(projectId: string) => boolean>(() => {
    return this.fakeWorkspaceInitialData.removeProjectReturnValue;
  });
}

export class FakeWorkspaceBuilder extends FakeEntityBuilder {
  private name: IPropEventBroker<string> = FakesFactory.createPropEventBroker<string>('');
  private description: IReadablePropEventBroker<string> = FakesFactory.createReadablePropEventBroker<string>('');
  private isActive: IPropEventBroker<boolean> = FakesFactory.createPropEventBroker<boolean>(false);
  private projects: IEntityCollection<IProject> = FakesFactory.createEntityCollection<IProject>([]);
  private owner: IProject = new FakeProjectBuilder().build();
  private addProjectReturnValue: void = undefined;
  private removeProjectReturnValue: boolean = false;

  // EventBroker fields get TWO methods each
  withName(value: IPropEventBroker<string>): this {
    this.name = value;
    return this;
  }

  withNameValue(value: string): this {
    return this.withName(FakesFactory.createPropEventBroker<string>(value));
  }

  withDescription(value: IReadablePropEventBroker<string>): this {
    this.description = value;
    return this;
  }

  withDescriptionValue(value: string): this {
    return this.withDescription(FakesFactory.createReadablePropEventBroker<string>(value));
  }

  withIsActive(value: IPropEventBroker<boolean>): this {
    this.isActive = value;
    return this;
  }

  withIsActiveValue(value: boolean): this {
    return this.withIsActive(FakesFactory.createPropEventBroker<boolean>(value));
  }

  // Collections and entities get single methods
  withProjects(value: IEntityCollection<IProject>): this {
    this.projects = value;
    return this;
  }

  withOwner(value: IProject): this {
    this.owner = value;
    return this;
  }

  withAddProjectReturnValue(value: void): this {
    this.addProjectReturnValue = value;
    return this;
  }

  withRemoveProjectReturnValue(value: boolean): this {
    this.removeProjectReturnValue = value;
    return this;
  }

  protected getFakeWorkspaceInitializer(): FakeWorkspaceInitializer {
    return {
      ...this.getInitialData(),
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      projects: this.projects,
      owner: this.owner,
      addProjectReturnValue: this.addProjectReturnValue,
      removeProjectReturnValue: this.removeProjectReturnValue,
    };
  }

  build(): FakeWorkspace {
    return new FakeWorkspace(this.getFakeWorkspaceInitializer());
  }
}
```

### Usage in Tests

```typescript
// Using convenience methods for EventBrokers
const workspace = new FakeWorkspaceBuilder()
  .withNameValue('My Workspace') // Convenience method
  .withDescriptionValue('A test workspace')
  .withIsActiveValue(true)
  .build();

console.log(workspace.name.get()); // 'My Workspace'
console.log(workspace.isActive.get()); // true

// Using full EventBroker methods
const customBroker = FakesFactory.createPropEventBroker<string>('Custom');
const workspace2 = new FakeWorkspaceBuilder()
  .withName(customBroker) // Full EventBroker
  .build();

// With collections
const projects = FakesFactory.createEntityCollection<IProject>([
  new FakeProjectBuilder().withNameValue('Project 1').build(),
  new FakeProjectBuilder().withNameValue('Project 2').build(),
]);

const workspaceWithProjects = new FakeWorkspaceBuilder()
  .withProjects(projects)
  .build();
```

## Example 4: Interface with Optional Fields

### Original Interface

```typescript
// src/IConfiguration.ts
export interface IConfiguration {
  apiUrl: string;
  apiKey?: string;
  timeout: number;
  retryCount?: number;
}
```

### Generated Fake (Note: Initializer has NO optional fields)

```typescript
// fakes/FakeConfiguration.ts (at package root, sibling to src/)
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import type { IConfiguration } from '../IConfiguration';

export interface FakeConfigurationInitializer {
  apiUrl: string;
  apiKey: string | undefined; // NOT optional with ?, but can be undefined
  timeout: number;
  retryCount: number | undefined; // NOT optional with ?, but can be undefined
}

export class FakeConfiguration implements IConfiguration {
  public apiUrl: string;
  public apiKey?: string;
  public timeout: number;
  public retryCount?: number;

  constructor(private fakeConfigurationInitialData: FakeConfigurationInitializer) {
    this.apiUrl = fakeConfigurationInitialData.apiUrl;
    this.apiKey = fakeConfigurationInitialData.apiKey;
    this.timeout = fakeConfigurationInitialData.timeout;
    this.retryCount = fakeConfigurationInitialData.retryCount;
  }
}

export class FakeConfigurationBuilder {
  private apiUrl: string = '';
  private apiKey: string | undefined = undefined;
  private timeout: number = 0;
  private retryCount: number | undefined = undefined;

  withApiUrl(value: string): this {
    this.apiUrl = value;
    return this;
  }

  withApiKey(value: string | undefined): this {
    this.apiKey = value;
    return this;
  }

  withTimeout(value: number): this {
    this.timeout = value;
    return this;
  }

  withRetryCount(value: number | undefined): this {
    this.retryCount = value;
    return this;
  }

  protected getFakeConfigurationInitializer(): FakeConfigurationInitializer {
    return {
      apiUrl: this.apiUrl,
      apiKey: this.apiKey,
      timeout: this.timeout,
      retryCount: this.retryCount,
    };
  }

  build(): FakeConfiguration {
    return new FakeConfiguration(this.getFakeConfigurationInitializer());
  }
}
```

## Example 5: Updating an Existing Fake

### Original Interface and Fake

**Interface before changes:**
```typescript
// src/IReport.ts
import type { IEntity } from '@zdr-tools/zdr-entities';

export interface IReport extends IEntity {
  title: string;
  status: string;

  publish(): Promise<void>;
}
```

**Existing Fake (abbreviated):**
```typescript
// fakes/FakeReport.ts (at package root, sibling to src/)
export interface FakeReportInitializer extends IFakeEntityInitialData {
  title: string;
  status: string;
  publishReturnValue: Promise<void>;
}

export class FakeReport extends FakeEntity implements IReport {
  public title: string;
  public status: string;

  constructor(private fakeReportInitialData: FakeReportInitializer) {
    super(fakeReportInitialData);
    this.title = fakeReportInitialData.title;
    this.status = fakeReportInitialData.status;
  }

  publish = getMockingFunction<() => Promise<void>>(() => {
    return this.fakeReportInitialData.publishReturnValue;
  });
}

export class FakeReportBuilder extends FakeEntityBuilder {
  private title: string = '';
  private status: string = '';
  private publishReturnValue: Promise<void> = Promise.resolve();

  // ... with methods ...

  protected getFakeReportInitializer(): FakeReportInitializer {
    return {
      ...this.getInitialData(),
      title: this.title,
      status: this.status,
      publishReturnValue: this.publishReturnValue,
    };
  }

  build(): FakeReport {
    return new FakeReport(this.getFakeReportInitializer());
  }
}
```

### Interface Changes

**Updated interface:**
```typescript
// src/IReport.ts
import type { IEntity } from '@zdr-tools/zdr-entities';

export interface IReport extends IEntity {
  title: string;
  status: string;
  description: string; // ADDED
  createdBy: string;   // ADDED

  publish(): Promise<void>;
  archive(): void;     // ADDED
}
```

### Required Updates

**1. Update FakeReportInitializer:**
```typescript
export interface FakeReportInitializer extends IFakeEntityInitialData {
  title: string;
  status: string;
  description: string;        // ADDED
  createdBy: string;          // ADDED
  publishReturnValue: Promise<void>;
  archiveReturnValue: void;   // ADDED
}
```

**2. Update FakeReport class:**
```typescript
export class FakeReport extends FakeEntity implements IReport {
  public title: string;
  public status: string;
  public description: string;  // ADDED
  public createdBy: string;    // ADDED

  constructor(private fakeReportInitialData: FakeReportInitializer) {
    super(fakeReportInitialData);
    this.title = fakeReportInitialData.title;
    this.status = fakeReportInitialData.status;
    this.description = fakeReportInitialData.description;  // ADDED
    this.createdBy = fakeReportInitialData.createdBy;      // ADDED
  }

  publish = getMockingFunction<() => Promise<void>>(() => {
    return this.fakeReportInitialData.publishReturnValue;
  });

  // ADDED
  archive = getMockingFunction<() => void>(() => {
    return this.fakeReportInitialData.archiveReturnValue;
  });
}
```

**3. Update FakeReportBuilder:**
```typescript
export class FakeReportBuilder extends FakeEntityBuilder {
  private title: string = '';
  private status: string = '';
  private description: string = '';                       // ADDED
  private createdBy: string = '';                         // ADDED
  private publishReturnValue: Promise<void> = Promise.resolve();
  private archiveReturnValue: void = undefined;           // ADDED

  withTitle(value: string): this {
    this.title = value;
    return this;
  }

  withStatus(value: string): this {
    this.status = value;
    return this;
  }

  // ADDED
  withDescription(value: string): this {
    this.description = value;
    return this;
  }

  // ADDED
  withCreatedBy(value: string): this {
    this.createdBy = value;
    return this;
  }

  withPublishReturnValue(value: Promise<void>): this {
    this.publishReturnValue = value;
    return this;
  }

  // ADDED
  withArchiveReturnValue(value: void): this {
    this.archiveReturnValue = value;
    return this;
  }

  protected getFakeReportInitializer(): FakeReportInitializer {
    return {
      ...this.getInitialData(),
      title: this.title,
      status: this.status,
      description: this.description,              // ADDED
      createdBy: this.createdBy,                  // ADDED
      publishReturnValue: this.publishReturnValue,
      archiveReturnValue: this.archiveReturnValue, // ADDED
    };
  }

  build(): FakeReport {
    return new FakeReport(this.getFakeReportInitializer());
  }
}
```

### Update Summary

Changes made:
- ✅ Added 2 new fields (`description`, `createdBy`)
- ✅ Added 1 new method (`archive`)
- ✅ Updated Initializer interface with 3 new entries
- ✅ Updated Fake class with 2 new field declarations, 2 constructor assignments, and 1 new method
- ✅ Updated Builder with 2 new private fields, 3 new `with*` methods, and 3 new entries in getter

## Key Patterns Summary

1. **Initializer**: All fields MANDATORY (no `?`), but can be `T | undefined`
2. **Fake Class**: Assigns all fields in constructor, wraps methods with `getMockingFunction`
3. **Builder**: Private fields with defaults, `with*` methods return `this`, protected getter for initializer, public `build()` method
4. **EventBrokers**: Get two methods - `withField()` and `withFieldValue()`
5. **IEntity Extension**: Initializer extends `IFakeEntityInitialData`, class extends `FakeEntity`, builder extends `FakeEntityBuilder` and calls `this.getInitialData()` in getter
6. **Methods**: Only store return values in initializer, not arguments
7. **Updating**: Use Edit tool for targeted changes, update all three components consistently
