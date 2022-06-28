const redDot = "https://documentapprovalapp.blob.core.windows.net/media/redDot.png?sv=2020-10-02&st=2022-05-19T21%3A20%3A50Z&se=2024-05-20T21%3A20%3A00Z&sr=b&sp=r&sig=53ICJW7sR6LG%2FSy7jZJXGjMYFBy6opcV8h%2BIBwx2zPs%3D";
const greenDot = "https://documentapprovalapp.blob.core.windows.net/media/greenDot.png?sv=2020-10-02&st=2022-05-19T21%3A21%3A04Z&se=2024-05-20T21%3A21%3A00Z&sr=b&sp=r&sig=%2FTqtgjflWbDXi0RQYIrtc1WoQtSuHv6Iz1MyGUG%2BxmE%3D";
const yellowDot = "https://documentapprovalapp.blob.core.windows.net/media/yellowDot.png?sv=2020-10-02&st=2022-05-19T21%3A20%3A33Z&se=2024-05-20T21%3A20%3A00Z&sr=b&sp=r&sig=%2FSq3v59tpgqI8X2vTw%2F2LxMU2ng2dmwDvnab4w0Q%2B7o%3D";

export interface IOutcomeStatusProps {
   type: string;
   width: string;
   items: {
       type: string;
       columns: ({
           type: string;
           width: string;
           items: {
               type: string;
               url: string;
               width: string;
               height: string;
           }[];
           spacing: string;
           verticalContentAlignment: string;
       } | {
         type: string;
         width: string;
         items: {
             type: string;
             wrap: boolean;
             text: string;
             size: string;
             isSubtle: boolean;
             horizontalAlignment: string;
             spacing: string;
         }[];
         spacing: string;
         verticalContentAlignment: string;
     })[];
   }[];
}


export const outcomeStatusComp = (_value: string) => {
   let imgURL = yellowDot;
   let outcome = _value;

   switch (outcome) {
      case 'recommended':
      case 'supported':
      case 'approved':
         outcome = 'Approved';
         imgURL = greenDot;
         break;
      case 'rejected':
         outcome = 'Rejected';
         imgURL = redDot;
         break;
      default:
         outcome = 'Under review';
         break;
   }

   return {
      type: "Column",
      width: "auto",
      items: [
         {
            type: "ColumnSet",
            columns: [
               {
                  type: "Column",
                  width: "auto",
                  items: [
                     {
                        type: "Image",
                        url: imgURL,
                        width: "12px",
                        height: "12px"
                     }
                  ],
                  spacing: "None",
                  verticalContentAlignment: "Center"
               },
               {
                  type: "Column",
                  width: "auto",
                  items: [
                     {
                        type: "TextBlock",
                        wrap: true,
                        text: outcome,
                        size: "Small",
                        isSubtle: true,
                        horizontalAlignment: "Right",
                        spacing: "None"
                     }
                  ],
                  spacing: "Small",
                  verticalContentAlignment: "Center"
               }
            ]
         }
      ]
   }
}