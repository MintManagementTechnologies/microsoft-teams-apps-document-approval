import { IGraphDriveResult, IGraphSPSiteResult } from 'common/types/graphApiResult';
import { rtkDefaultError } from 'common/utils/commonVariables';
import { baseApi } from 'services';
import { GraphClient } from 'services/graphClientService';

import {
    IConfigModel, IDocTypeConfigModel, ISiteConfigModel, ISiteFolderModel, ISiteModel,
    ITeamConfigModel
} from './types';

export const configService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getAllConfig: build.query<IDocTypeConfigModel[], void>({
         query: (docType) => `config`,
      }),
      getSiteConfig: build.query<ISiteConfigModel, string>({
         query: (docType) => `config/spConfig/${docType}`,
      }),
      getTeamConfig: build.query<ITeamConfigModel, string>({
         query: (docType) => `config/team/${docType}`,
      }),
      searchMySites: build.query<ISiteModel[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const searchResults: IGraphSPSiteResult[] = await GraphClient.searchManySiteCollections(_arg);
               const result = searchResults.map(x => ({
                  title: x.displayName,
                  siteId: x.id,
                  domainName: x.siteCollection.hostname,
                  url: x.webUrl,
               }));
               return result
                  ? { data: result.sort((x: any) => x.title) }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         }
      }),
      getAllMySites: build.query<ISiteModel[], void>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const searchResults: IGraphSPSiteResult[] = await GraphClient.getManySiteCollections();
               const result = searchResults.map(x => ({
                  title: x.displayName,
                  siteId: x.id,
                  domainName: x.siteCollection.hostname,
                  url: x.webUrl,
               }));
               return result
                  ? { data: result.sort((x: any) => x.title) }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         }
      }),
      getSiteDrives: build.query<IGraphDriveResult[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const searchResults: IGraphDriveResult[] = await GraphClient.getAllSiteDrives(_arg);
               const result = searchResults;
               return result
                  ? { data: result }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         }
      }),
      getDriveFolders: build.query<IGraphDriveResult[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const searchResults: {name: string, id: string}[] = await GraphClient.getAllDriveFolders(_arg);
               const result = searchResults;
               return result
                  ? { data: result }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         }
      }),
      createTemplateFolder: build.mutation<ISiteFolderModel, { siteId: string, docLibName: string }>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const { siteId, docLibName } = _arg;
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const driveAndDocLibDetails = await GraphClient.getDriveAndDocLibDetails(siteId, docLibName);
               if (driveAndDocLibDetails.docLibId !== 'notFound' && driveAndDocLibDetails.driveId !== 'notFound') {
                  const folderId = await GraphClient.createFolder(driveAndDocLibDetails.driveId, driveAndDocLibDetails.docLibId, "Templates");
               } else {
                  throw new Error('Could not create Templates Folder');
               }
               const result = {
                  ...driveAndDocLibDetails,
                  docLibName: docLibName,
                  templateFolderName: 'Templates'
               }
               return result
                  ? { data: result }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      scaffoldDocTypeFolders: build.mutation<ISiteFolderModel, { siteId: string, docLibName: string }>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const { siteId, docLibName } = _arg;
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const wasCreated = await GraphClient.createDocLib(siteId, docLibName);
               let driveAndDocLibDetails: { driveId: string, docLibId: string };
               if (wasCreated) {
                  driveAndDocLibDetails = await GraphClient.getDriveAndDocLibDetails(siteId, docLibName);
                  if (driveAndDocLibDetails.docLibId !== 'notFound' && driveAndDocLibDetails.driveId !== 'notFound') {
                     driveAndDocLibDetails = await GraphClient.getDriveAndDocLibDetails(siteId, docLibName);
                     const folderId = await GraphClient.createFolder(driveAndDocLibDetails.driveId, driveAndDocLibDetails.docLibId, "Templates");
                  } else {
                     throw new Error('Could not create Templates Folder');
                  }
               } else {
                  throw new Error('Could not create Document Library');
               }
               const result = {
                  ...driveAndDocLibDetails,
                  docLibName: docLibName,
                  templateFolderName: 'Templates'
               }
               return result
                  ? { data: result }
                  : rtkDefaultError
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      createSiteConfig: build.mutation<void, ISiteConfigModel>({
         query(body) {
            return {
               url: `config/spConfig`,
               method: 'POST',
               body,
            };
         },
      }),
      updateSiteConfig: build.mutation<void, ISiteConfigModel>({
         query(body) {
            return {
               url: `config/spConfig`,
               method: 'PUT',
               body,
            };
         },
      }),
      createTeamConfig: build.mutation<void, ITeamConfigModel>({
         query(body) {
            return {
               url: `config/team`,
               method: 'POST',
               body,
            };
         },
      }),
      updateTeamConfig: build.mutation<void, ITeamConfigModel>({
         query(body) {
            return {
               url: `config/team`,
               method: 'PUT',
               body,
            };
         },
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: configEndpoints,
   useGetAllConfigQuery,
   useGetSiteConfigQuery,
   useGetTeamConfigQuery,
   useSearchMySitesQuery,
   useLazyGetTeamConfigQuery,
   useGetAllMySitesQuery,
   useLazyGetSiteDrivesQuery,
   useLazyGetDriveFoldersQuery,
   useScaffoldDocTypeFoldersMutation,
   useCreateTemplateFolderMutation,
   useCreateSiteConfigMutation,
   useUpdateSiteConfigMutation,
   useCreateTeamConfigMutation,
   useUpdateTeamConfigMutation,
} = configService


// const ttt = {
//    //id -> rowKey -> docType -> memo
//    //value -> siteId -> ...
//    siteId: `string`,
//    domainName: `string`,
//    url: `string`,
//    driveId: `string`,
//    docLibId: `string`,
//    docLibName: `string`,
//    templateFolderName: `string`,
// }