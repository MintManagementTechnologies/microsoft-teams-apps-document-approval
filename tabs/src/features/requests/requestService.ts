
// import { IRequestModel } from '@common/types/request';

import { baseApi } from '../../services';
import { IRequestModel } from './request';

export const requestService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getRequest: build.query<IRequestModel, string>({
         query: (requestId) => `requests/${requestId}`,
      }),
      getAllRequests: build.query<IRequestModel[], void>({
         query: () => `requests`,
      }),
      getAllApprovedRequests: build.query<IRequestModel[], void>({
         query: () => `requests/outcome/approved`,
      }),
      getMyRequests: build.query<IRequestModel[], string>({
         query: (upn) => `requests/requestor/${upn}`,
      }),
      getRequestsByActor: build.query<IRequestModel[], string>({
         query: (upn) => `requests/user/${upn}`,
      }),
      // getRequestsByUser: build.query<IRequestModel[], {personaType: string, upn: string}>({
      //    query: (arg) => `requests/${arg.personaType}/${arg.upn}`,
      // }),
      createRequest: build.mutation<IRequestModel, Partial<IRequestModel> & {id: string}>({
         query(body) {
            return {
               url: `requests`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IRequestModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               requestService.util.updateQueryData('getRequest', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IRequestModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      updateRequest: build.mutation<IRequestModel, Partial<IRequestModel> & {id: string}>({
         query(body) {
            const { id } = body;
            return {
               url: `requests/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IRequestModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               requestService.util.updateQueryData('getRequest', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IRequestModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      deleteRequest: build.mutation<void, string>({
         query(id) {
            return {
               url: `requests/${id}`,
               method: 'DELETE',
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: requestEndpoints,
   useGetRequestQuery,
   useGetAllRequestsQuery,
   useLazyGetAllRequestsQuery,
   useGetAllApprovedRequestsQuery,
   useLazyGetAllApprovedRequestsQuery,
   useGetMyRequestsQuery,
   useLazyGetMyRequestsQuery,
   useGetRequestsByActorQuery,
   useLazyGetRequestsByActorQuery,
   useCreateRequestMutation,
   useUpdateRequestMutation,
   useDeleteRequestMutation,
} = requestService;
