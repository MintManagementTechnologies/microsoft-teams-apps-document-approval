// import { distinct } from '~helpers/arrayHelpers';

import { domainFilter } from 'common/utils/envVariables';
import { distinct } from 'common/utils/helpers/arrayHelpers';

// import { distinct } from 'helpers/arrayHelpers';
import { Client } from '@microsoft/microsoft-graph-client';

import {
    IGraphBatchResult, IGraphError, IGraphUserModel, IGraphUserResult
} from '../common/types/graphApiResult';
import { IDetailedUserModel } from '../common/types/user';
import { rtkDefaultError } from '../common/utils/commonVariables';
import { cacher } from '../common/utils/rtkQueryCacheUtils';
import { RootState } from '../store';
import { baseGraphApi } from './';
import { GraphClient } from './graphClientService';

const getBatchUserPresenceAndPhotos =
   async (users: IGraphUserResult[], graph: Client)
      : Promise<IGraphUserModel[]> => {
      let batchRequest = {
         requests: users.filter((x: IGraphUserResult) => !x.userPrincipalName.includes('#')).map((x: IGraphUserResult, index: number) => (
            {
               id: x.id,
               method: "GET",
               url: `/users/${x.id}/photos/48x48/$value`,
               headers: {
                  "Content-Type": "image/jpg"
               }
            })) as any[]
      }
      let presencerequestBody = { ids: users.filter((x: IGraphUserResult) => !x.userPrincipalName.includes('#')).map((x: IGraphUserResult) => x.id) };
      batchRequest.requests.push({
         id: 'presenceRequest',
         method: "POST",
         url: `/communications/getPresencesByUserId`,
         body: presencerequestBody,
         headers: {
            "Content-Type": "application/json"
         }
      });

      let batchResults: IGraphBatchResult = await graph.api('/$batch').post(batchRequest).catch((error: any) => {
         console.error('GraphClient - getBatchUsersPhotoAndPresence - Batch Request');
         console.error(error.statusCode);
      });

      return users.map((x: IGraphUserResult) => {
         if (x.userPrincipalName.includes('#'))
            return x;
         const imageBatchResponse = batchResults.responses.find((y: any) => y.id === x.id);
         let hasImage = false;
         if (imageBatchResponse) hasImage = imageBatchResponse.status === 200;

         const blobUrl = imageBatchResponse && hasImage ? `data:image/jpg;base64,${imageBatchResponse.body}` : undefined;

         const presenceBatchResponse = batchResults.responses.find((y: any) => y.id === 'presenceRequest');
         const availability = presenceBatchResponse ?
            presenceBatchResponse.body.value.find((y: any) => y.id === x.id).availability
            : 'PresenceUnknown';

         return {
            activity: availability,
            availability: availability,
            image: blobUrl,
            ...x
         }
      })
   }

const transformUserBatchResult = (rawData: IGraphUserModel[]): IDetailedUserModel[] => {
   //TODO: Hardcoding user filter
   return rawData.map((x: IGraphUserModel) => ({
      upn: x.userPrincipalName.toLowerCase(),
      firstName: x.givenName,
      lastName: x.surname,
      jobTitle: x.jobTitle,
      department: x.department,
      active: true,
      id: x.id,
      title: x.displayName,
      createdTimestamp: new Date().getTime(),
      modifiedTimestamp: new Date().getTime(),
      image: x.image,
      availability: x.availability,
      activity: x.activity
   })) as IDetailedUserModel[];
}

const transformBasicUsersResult = (rawData: IGraphUserResult[]): IDetailedUserModel[] => {
   return rawData.map((x: IGraphUserResult) => ({
      upn: x.userPrincipalName.toLowerCase(),
      firstName: x.givenName,
      lastName: x.surname,
      jobTitle: x.jobTitle,
      department: x.department,
      active: true,
      id: x.id,
      title: x.displayName,
      createdTimestamp: new Date().getTime(),
      modifiedTimestamp: new Date().getTime()
   }));
}

export const graphApiService = baseGraphApi.injectEndpoints({
   endpoints: (build) => ({
      searchUsers: build.query<IDetailedUserModel[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const selectedFields = `department,jobTitle,id,userPrincipalName,displayName,surname,givenName`;
               const searchQuery = `"displayName:${_arg}" OR "mail:${_arg}"`;
               const searchPath = `/users?$search=${searchQuery}&${domainFilter}$select=${selectedFields}`;
               let searchResult = await graph.api(searchPath).header("ConsistencyLevel", "eventual").get();
               let usersResult = await getBatchUserPresenceAndPhotos(searchResult.value as IGraphUserResult[], graph);
               const result = transformUserBatchResult(usersResult);
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
         },
      }),
      getUser: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult = await graph.api(`/users/${_arg}?$select=department,jobTitle,id,userPrincipalName,displayName,surname,givenName`).get();
               return searchResult
                  ? { data: transformBasicUsersResult([searchResult])[0] }
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
      getUserWithPhoto: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult = await graph.api(`/users/${_arg}?$select=department,jobTitle,id,userPrincipalName,displayName,surname,givenName`).get();
               let photoResult = await graph.api(`/users/${_arg}/photos/48x48/$value`).header("Content-Type", "image/jpg").get();
               let imgURL = URL.createObjectURL(photoResult);
               return searchResult
                  ? { data: transformUserBatchResult([{
                     ...searchResult,
                     image: imgURL
                  }])[0] }
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
      getManyUsers: build.query<IDetailedUserModel[], string[]>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const distinctUsers = _arg.filter(distinct);
               const batchRequest = {
                  requests: distinctUsers.map((x, index) => (
                     {
                        id: (index + 1).toString(),
                        method: "GET",
                        url: '/users/' + x
                     }))
               }
               let usersBatchResult = await graph.api('/$batch').post(batchRequest).catch((error: IGraphError) => {
                  console.error('graphApiService - getUsers - Batch Request');
                  console.error(error.statusCode);
               });
               let newBatch = usersBatchResult.responses.map((x: any) => x.body);
               let usersResult = await getBatchUserPresenceAndPhotos(newBatch as IGraphUserResult[], graph);
               return usersResult
                  ? { data: transformUserBatchResult(usersResult).sort((x: any) => x.title) }
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
      getUserManager: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let result: IGraphUserResult = await graph.api(`/users/${_arg}/manager`).get() as IGraphUserResult;

               return result
                  ? { data: transformBasicUsersResult([result]) }
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
      getBatchUserPresenceAndPhotos: build.query<any[], void>({
         query: () => `/`,
      })
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: graphApiEndpoints,
   useSearchUsersQuery,
   useGetUserQuery,
   useLazyGetUserQuery,
   useGetUserWithPhotoQuery,
   useGetManyUsersQuery,
   useLazyGetManyUsersQuery,
   useGetUserManagerQuery,
   useGetBatchUserPresenceAndPhotosQuery,
} = graphApiService
