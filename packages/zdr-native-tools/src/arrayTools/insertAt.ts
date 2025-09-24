// https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript
export function insertAt (array: any[], startIndex: number, ...itemsToInsert: any[]) {
  const copyArray = [...array];
  copyArray.splice(startIndex, 0, ...itemsToInsert);

  return copyArray;
}
