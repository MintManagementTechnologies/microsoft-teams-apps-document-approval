declare global {
   interface String {
      upperFirstLetter(): string;
   }
}

String.prototype.upperFirstLetter = function () {
   return this.charAt(0).toUpperCase() + this.slice(1);
};

export const upperFirstLetter = (text: string) => {
   return text.charAt(0).toUpperCase() + text.slice(1);
}

export const convertToBase64 = (file: File) => new Promise((resolve, reject) => {
   const reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = () => resolve(reader.result);
   reader.onerror = error => reject(error);
});