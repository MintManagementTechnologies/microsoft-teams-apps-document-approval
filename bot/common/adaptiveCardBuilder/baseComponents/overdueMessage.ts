import { differenceInDays } from 'date-fns';

export interface IOverdueMessageProps {
   type: string;
   style: string;
   spacing: string;
   verticalContentAlignment: string;
   items: {
       type: string;
       text: string;
       wrap: boolean;
       isSubtle: boolean;
       size: string;
   }[];
}

export const overdueMessageComp = (_value: number) => {
   let nowDate = new Date().toDateString();
   let createdDate = new Date(_value).toDateString();
   const createdDays = differenceInDays(new Date(nowDate), new Date(createdDate));

   return {
      "type": "Container",
      "style": "warning",
      "spacing": "Small",
      "verticalContentAlignment": "Center",
      "items": [
         {
            "type": "TextBlock",
            "text": `_The memo is due for approval for ${createdDays} working days_`,
            "wrap": true,
            "isSubtle": true,
            "size": "Default"
         }
      ]
   }
}