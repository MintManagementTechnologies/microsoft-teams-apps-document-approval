export const arraysAreDifferent = (
   arr1: any[],
   arr2: any[],
   fieldToCompare: string = 'id'
): boolean => {
   const areDifferent = arr2.some(function (obj) {
      return !arr1.some(function (obj2) {
         return obj[fieldToCompare] === obj2[fieldToCompare];
      });
   });
   return areDifferent;
};

export const distinct = (value: string, index: number, self: any) => {
   return self.indexOf(value) === index;
};

export const checkForDuplicates = (array: any[]) => {
   return new Set(array).size !== array.length
}