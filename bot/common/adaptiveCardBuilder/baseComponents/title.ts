export interface ITitleProps {
   type: string,
   text: string,
   size: string,
   weight: string,
   wrap: boolean,
}

export const titleComp = (_value: string) => {
   return {
      type: "TextBlock",
      text: `${_value}`,
      size: "Large",
      weight: "Default",
      wrap: true
   }
}