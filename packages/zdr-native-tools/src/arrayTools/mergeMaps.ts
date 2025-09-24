export function mergeMaps<K, V>(...maps: Map<K, V>[]): Map<K, V> {
  return new Map<K, V>(maps.flatMap(map => Array.from(map.entries())));
}
