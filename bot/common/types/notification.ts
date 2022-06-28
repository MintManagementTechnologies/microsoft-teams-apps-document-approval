import { ICardData } from './adaptiveCard';

export interface IRecipient {
   personaType: string,
   id: string,
   upn?: string,
   displayName?: string,
}

export interface ITeamNotificationModel {
   docType: string;
   title: string;
   refNumber: number;
   requestedBy: string;
   requestedByUPN: string;
   usersInvolved?: {
      id: string,
      upn: string,
      displayName: string
   }[]
}

export interface INotificationModel {
   item: {
      id: string,
      createdByDisplayName: string,
      createdByUPN: string,
   } & any | ITeamNotificationModel,
   recipients: IRecipient[],
   cardData: ICardData,
   card?: any
}