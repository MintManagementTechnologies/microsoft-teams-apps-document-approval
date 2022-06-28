export interface IHeaderProps {
   type: string,
   width: string,
   items: {
      type: string,
      style: string,
      color: string,
      size: string,
      weight: string,
      text: string,
   }[];
   verticalContentAlignment: string,
}

export const headerComp = (_value: string, _cardType: string = 'default') => {
   const color = _cardType === 'reminder' ? 'warning' : 'default';
   const size = _cardType === 'reminder' ? 'Large' : 'Medium';
   const txtPrefix = _cardType === 'reminder' ? 'Reminder for ' : '';
   return {
      type: "Column",
      width: "stretch",
      items: [
         {
            type: "TextBlock",
            style: "heading",
            color: color,
            size: size,
            weight: "Bolder",
            text: `${txtPrefix}Memo reference - ${_value}`
         }
      ],
      verticalContentAlignment: "Center"
   }
}