import { IDropdownOption } from 'common/types';
import { IGraphChannelResult, IGraphTeamResult } from 'common/types/graphApiResult';

import { msGraphBaseApi } from './';

export const msGraphApiService = msGraphBaseApi.injectEndpoints({
   endpoints: (build) => ({
      getTeamDropdownOptions: build.query<IDropdownOption[], void>({
         query: () => `/me/joinedTeams`,
         transformResponse: (rawResult: IGraphTeamResult, meta) => {
            try {
               return rawResult.value.map(x => ({
                  key: x.id,
                  header: x.displayName,
                  content: x.description,
               }));
            } catch (error: any) {
               throw new Error('Could not find any teams you have joined.');
            }
         },
      }),
      getChannelDropdownOptions: build.query<IDropdownOption[], string>({
         query: (teamId) => `/teams/${teamId}/channels`,
         transformResponse: (rawResult: IGraphChannelResult, meta) => {
            try {
               return rawResult.value.map(x => ({
                  key: x.id,
                  header: x.displayName,
                  content: x.description,
               }));
            } catch (error: any) {
               throw new Error('Could not find any channels in the team.');
            }
         },
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: msGraphApiEndpoints,
   useGetTeamDropdownOptionsQuery,
   useLazyGetChannelDropdownOptionsQuery,
} = msGraphApiService;