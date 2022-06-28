
export interface ISiteConfig {
   siteId: string;
   docLibRootQuery: string;
   newItemBaseQuery: string;
   newRequestFolderQuery: string;
}

export interface IConfig {
   appId: string;
   tabBaseUrl: string;
   spSite: ISiteConfig;
}

// export const docLibUrl = `https:~2F~2Fajacsrsa1.sharepoint.com~2Fsites~2FEcoBank~2FBasicApprovals~2F1cfcf8a4-425a-41f7-878d-5c64ab0c4759`;

export const getAppConfig = (): IConfig => {
   const _siteConfigTMP = {
      siteId: 'notFound',
      driveId: 'notFound',
      docLibId: 'notFound',
   };
   const docLibRootQuery = `/drives/${_siteConfigTMP.driveId}/root:`
   const newItemBaseQuery = `/drives/${_siteConfigTMP.driveId}/items`;
   const newRequestFolderQuery = `${newItemBaseQuery}/${_siteConfigTMP.docLibId}/children`;
   
   const tmpSiteConfig = {
      ..._siteConfigTMP,
      queries: {
         docLibRootQuery: docLibRootQuery,
         newItemBaseQuery: newItemBaseQuery,
         newRequestFolderQuery: newRequestFolderQuery
      }
   };;
   console.log("siteConfigTMP set");
   const appId = '';

   return {
      appId: appId,
      tabBaseUrl: window.location.origin,
      spSite: {
         siteId: tmpSiteConfig?.siteId || '',
         docLibRootQuery: tmpSiteConfig?.queries?.docLibRootQuery || '',
         newItemBaseQuery: tmpSiteConfig?.queries?.newItemBaseQuery || '',
         newRequestFolderQuery: tmpSiteConfig?.queries?.newRequestFolderQuery || '',
      }
   };
}