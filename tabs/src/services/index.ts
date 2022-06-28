// import { getApiBaseUrl } from '~helpers/urlHelpers';

import { getApiBaseUrl } from 'common/utils/helpers/urlHelpers';

import { createMicrosoftGraphClient, TeamsUserCredential } from '@microsoft/teamsfx';
import {
    BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';

import { cacher } from '../common/utils/rtkQueryCacheUtils';
import { GraphClient } from './graphClientService';

export interface IApiResponse {
   status: 'success' | 'error' | '',
   statusCode: number,
   message: string,
   data: any
}

const baseQuery = fetchBaseQuery({ baseUrl: getApiBaseUrl(true), });
const apiBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
   try {
      let result = await baseQuery(args, api, extraOptions);
      const responseData:IApiResponse = result.data as any;
      if(responseData.status === 'error'){
         throw new Error(responseData.message);
      }
      return { data: responseData.data };
   } catch (error: any) {
      return {
         error: {
            status: 'FETCH_ERROR',
            error: error.message
         }
      }
   }
}

export const baseApi = createApi({
   baseQuery: apiBaseQuery,
   endpoints: () => ({}),
});

export const baseGraphApi = createApi({
   reducerPath: "graphapi",
   baseQuery: fetchBaseQuery({ baseUrl: `` }),
   tagTypes: [...cacher.defaultTags, "Attachment", "Attachments"],
   endpoints: () => ({}),
});

const msGraphBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
   try {
      const { graph } = GraphClient.getInstance();
      if (!graph)
         throw new Error("No graph client defined");
      const searchPath = args as string;
      let result = await graph.api(searchPath).get();
      return { data: result };
   } catch (error: any) {
      return {
         error: {
            status: error.statusCode,
            error: error.message
         }
      }
   }
}

export const msGraphBaseApi = createApi({
   reducerPath: "msGraphApi",
   baseQuery: msGraphBaseQuery,
   endpoints: () => ({}),
});