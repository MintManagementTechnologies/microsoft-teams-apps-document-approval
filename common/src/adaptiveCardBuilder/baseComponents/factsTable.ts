import { IFact } from '../types/adaptiveCard';

export interface IFactsTableProps {
   type: string;
   columns: {
      type: string;
      width: string;
      items: any[];
      spacing: string;
   }[];
   minHeight: string;
}

export const factsTableComp = (_facts: IFact[], _outcome: string) => {
   const factLabelsColumn = getFactLabels(_outcome);
   const factValuesColumn = getFactValues(_facts);

   return {
      "type": "ColumnSet",
      "columns": [factLabelsColumn, factValuesColumn],
      "minHeight": "0px"
   }
}

const getFactValues = (_facts: IFact[]) => {
   let items:any[] = [];
   _facts.forEach(x => {
      switch (x.key) {
         case 'createdBy':
            items.push({
               "type": "TextBlock",
               "text": `${x.value}`,
               "wrap": true,
               "spacing": "None"
            });
            break;
         case 'created':
            items.push({
               "type": "TextBlock",
               "text": `${x.value}`,
               "wrap": true,
               "spacing": "Small"
            });
            break;
         case 'classificationType':
            items.push({
               "type": "TextBlock",
               "text": `${x.value}`,
               "wrap": true,
               "spacing": "Small"
            });
            break;
         case 'currentApproversUPN':
            // THE SECOND IMAGE HAD DIFFERENT PROPS!!! (widthSTRETCH, spacingSMALL)   
            // "width": "stretch"
            // "spacing": "Small"
            const approverImages = (x.value as string[]).map(y => ({
               "type": "Column",
               "width": "auto",
               "items": [
                  {
                     "type": "Image",
                     "url": `${y}`,
                     "width": "24x",
                     "style": "person",
                     "height": "24px",
                     "spacing": "None"
                  }
               ],
               "spacing": "Small",
               "verticalContentAlignment": "Center"
            }))


            items.push({
               "type": "ColumnSet",
               "spacing": "Small",
               "columns": approverImages
            });
            break;
         default:
            break;
      }
   });

   return {
      "type": "Column",
      "width": "auto",
      "items": items,
      "spacing": "Small"
   }
}

const getFactLabels = (_outcome: string) => {
   let actorLabel = 'Current Actor & PA';
   if(_outcome === 'approved') actorLabel = 'Final approval by';
   if(_outcome === 'rejected') actorLabel = 'Rejected by';

   return {
      "type": "Column",
      "width": "auto",
      "items": [
         {
            "type": "TextBlock",
            "text": "Submitted by",
            "wrap": true,
            "spacing": "Small",
            "weight": "Bolder"
         },
         {
            "type": "TextBlock",
            "text": "Submitted on",
            "wrap": true,
            "weight": "Bolder",
            "spacing": "Small"
         },
         {
            "type": "TextBlock",
            "text": "Classification",
            "wrap": true,
            "weight": "Bolder",
            "spacing": "Small"
         },
         {
            "type": "TextBlock",
            "text": actorLabel,
            "wrap": true,
            "weight": "Bolder"
         }
      ],
      "spacing": "None"
   }
}