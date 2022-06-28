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

export const primitiveArraysAreEqual = (a: string[] | number[] | any[], b: string[] | number[] | any[]) => {
   if (a === b) return true;
   if (a == null || b == null) return false;
   if (a.length !== b.length) return false;

   const aSorted = [...a].sort();
   const bSorted = [...b].sort();
   for (var i = 0; i < aSorted.length; ++i) {
      if (aSorted[i] !== bSorted[i]) return false;
   }
   return true;
}

export const sortBy = (a: string | number | Date, b: string | number | Date, _orderBy: string = 'asc') => {
   let orderByValue = _orderBy === 'asc' ? 1 : -1;
   const fieldA = a.toString().toUpperCase(); // ignore upper and lowercase
   const fieldB = b.toString().toUpperCase(); // ignore upper and lowercase
   // const fieldA = a[fieldToCompare].toString().toUpperCase(); // ignore upper and lowercase
   // const fieldB = b[fieldToCompare].toString().toUpperCase(); // ignore upper and lowercase
   if (fieldA < fieldB) {
      return -1 * orderByValue;
   }
   if (fieldA > fieldB) {
      return 1 * orderByValue;
   }
   return 0;
}

export const distinct = (value: string, index: number, self: any) => {
   return self.indexOf(value) === index;
};

export const groupBy = (itemArray: any[], key: string) => {
   return itemArray.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
   }, {});
};

export const checkForDuplicates = (array: any[]) => {
   return new Set(array).size !== array.length
}