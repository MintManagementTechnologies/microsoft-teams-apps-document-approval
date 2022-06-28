import { IProgressRow } from "../types/adaptiveCard";

export interface IProgressTableProps {
   type: string;
   items: ({
      type: string;
      columns: {
         type: string;
         width: string;
         items: {
            type: string;
            text: string;
            wrap: boolean;
            weight: string;
         }[];
      }[];
      style: string;
   } | {
      type: string;
      columns: any[];
   })[];
   id: string;
   isVisible: boolean;
}

export const progressTableComp = (_progressTable: IProgressRow[]) => {
   const tableHeaders = getTableHeaders();
   const tableRows = getTableRows(_progressTable);

   return {
      "type": "Container",
      "items": [tableHeaders, ...tableRows],
      "id": "progressToggle",
      "isVisible": false
   }
}

const getTableRows = (_progressTable: IProgressRow[]) => {
   // {
   //    "pending": "{{outcome}} pending from {{displayName}}",
   //    "approved": "{{outcome}} by {{displayName}}",
   //    "rejected": "{{outcome}} rejected by {{displayName}}"
   // }
   //approved | rejected | pending | skipped
   const items = _progressTable.map(x => {
      let statusColor = 'Warning';
      let shortDateCompleted = '--';
      let statusContent = `${x.statusContent}`;

      switch (x.outcome) {
         case 'approved':
            statusColor = 'Good';
            shortDateCompleted = getShortDate(x.completedTimestamp);
            break;
         case 'rejected':
            statusColor = 'Attention';
            shortDateCompleted = getShortDate(x.completedTimestamp);
            break;
         case 'skipped':
            statusColor = 'Accent';
            break;
         default:
            break;
      }

      return {
         "type": "ColumnSet",
         "columns": [
            {
               "type": "Column",
               "width": "18px"
            },
            {
               "type": "Column",
               "width": "30px",
               "items": [
                  {
                     "type": "TextBlock",
                     "text": `${x.level}`,
                     "weight": "Default",
                     "wrap": true
                  }
               ]
            },
            {
               "type": "Column",
               "width": "stretch",
               "items": [
                  {
                     "type": "TextBlock",
                     "text": statusContent,
                     "wrap": true,
                     "weight": "Default",
                     "color": statusColor,
                     "horizontalAlignment": "Left"
                  }
               ],
               "spacing": "None"
            },
            {
               "type": "Column",
               "width": "45px",
               "items": [
                  {
                     "type": "TextBlock",
                     "text": shortDateCompleted,
                     "wrap": true,
                     "weight": "Default"
                  }
               ],
               "spacing": "None"
            }
         ]
      }
   })

   return items;
}

const getTableHeaders = () => {
   return {
      "type": "ColumnSet",
      "columns": [
         {
            "type": "Column",
            "width": "auto",
            "items": [
               {
                  "type": "TextBlock",
                  "text": "Level",
                  "wrap": true,
                  "weight": "Bolder"
               }
            ]
         },
         {
            "type": "Column",
            "width": "stretch",
            "items": [
               {
                  "type": "TextBlock",
                  "text": "Status",
                  "wrap": true,
                  "weight": "Bolder"
               }
            ]
         },
         {
            "type": "Column",
            "width": "auto",
            "items": [
               {
                  "type": "TextBlock",
                  "text": "Date",
                  "wrap": true,
                  "weight": "Bolder"
               }
            ]
         }
      ],
      "style": "emphasis"
   }
}

const getShortDate = (_timestamp: number): string => {
   const dateCompleted = new Date(_timestamp);
   const month = dateCompleted.getMonth()+1;
   const day = dateCompleted.getDate();

   return `${day}/${month}`;
}