export interface IGraphUserResult {
   businessPhones: any[];
   displayName: string;
   givenName: string;
   jobTitle: string;
   mail: string;
   mobilePhone: string;
   officeLocation: string;
   preferredLanguage: string;
   surname: string;
   userPrincipalName: string;
   id: string;
   department: string;
}

export interface IGraphPresenceResult {
   id: string;
   status: number;
   body: {
      value: {
         id: string;
         availability: string;
         activity: string;
      }[];
   };
}

export interface IGraphUserPhotoResult {
   id: string;
   status: number;
   body: string;
}

export interface IGraphBatchResult {
   responses: {
      id: string;
      status: number;
      body: any;
   }[]
}

export interface IGraphUserModel extends IGraphUserResult {
   image?: string,
   availability?: string,
   activity?: string,
}

export interface IGraphError {
   statusCode: number
}

export interface IGraphSPSiteResult {
   createdDateTime: string;
   id: string;
   lastModifiedDateTime: string;
   name: string;
   webUrl: string;
   displayName: string;
   root: {};
   siteCollection: {
      hostname: string;
   };
}

export interface IGraphDriveResult {
   createdDateTime: string;
   description: string;
   id: string;
   lastModifiedDateTime: string;
   name: string;
   webUrl: string;
   driveType: string;
}

export interface IGraphTeamResult {
   "@odata.context": string;
   "@odata.count": number;
   value: {
       id: string;
       displayName: string;
       description: string;
   }[];
}

export interface IGraphChannelResult {
   "@odata.context": string;
   "@odata.count": number;
   value: {
       id: string;
       createdDateTime: string;
       displayName: string;
       description: string;
       isFavoriteByDefault: null;
       email: string;
       webUrl: string;
       membershipType: string;
   }[];
}