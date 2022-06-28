import { getRouteParams } from 'common/utils/helpers/urlHelpers';

// import { IActorModel } from '@common/types/actor';
// import { getRouteParams } from '~helpers/urlHelpers';
import { createEntityAdapter, createSelector, EntityId } from '@reduxjs/toolkit';

import { baseApi } from '../../services';
import { IActorModel } from './actor';

const actorsAdapter = createEntityAdapter();

const initialState = actorsAdapter.getInitialState()

export const actorService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      createActor: build.mutation<IActorModel, Partial<IActorModel>>({
         query(body) {
            return {
               url: `actors`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IActorModel>, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               actorService.util.updateQueryData('getRequestActors', _arg.requestId || '', draftItems => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItems.push(_arg as IActorModel);
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      createManyActors: build.mutation<IActorModel[], Partial<IActorModel[]>>({
         query(body) {
            return {
               url: `actors`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IActorModel[]>, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            if (!_arg[0])
               throw new Error("actorService.createManyActors -> No ActorModels in the array!");
            const { requestId } = _arg[0] as IActorModel;
            const patchResult = dispatch(
               actorService.util.updateQueryData('getRequestActors', requestId, draftItems => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItems.push(...(_arg as IActorModel[]));
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      getManyActors: build.query({
         query() {
            const { id } = getRouteParams(window.location.hash);
            const requestId = id || 'notFound';
            return {
               url: `actors/request/${requestId}`,
               method: 'GET'
            };
         },
         transformResponse: responseData => {
            return actorsAdapter.setAll(initialState, responseData as { payload: readonly unknown[] | Record<EntityId, unknown>; type: string; })
         }
      }),
      getRequestActors: build.query<IActorModel[], string>({
         query: (requestId) => `actors/request/${requestId}`,
      }),
      updateActor: build.mutation<IActorModel, Partial<IActorModel> & { id: string }>({
         query(body) {
            const { id } = body;
            return {
               url: `actors/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IActorModel> & { id: string }, { dispatch, queryFulfilled }) {
            const { requestId, id } = _arg;

            const patchResult = dispatch(
               actorService.util.updateQueryData('getRequestActors', requestId!, draftItems => {
                  const draftIndex = draftItems.findIndex((x: IActorModel) => x.id === id);
                  if (draftIndex > 0) {
                     draftItems[draftIndex] = { ..._arg } as IActorModel;
                  }
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      updateManyActors: build.mutation<IActorModel[], Partial<IActorModel[]>>({
         query(body) {
            return {
               url: `actors`,
               method: 'PUT',
               body,
            };
         }
      }),
      deleteActor: build.mutation<void, { requestId: string, actorId: string }>({
         query(args) {
            const { requestId, actorId } = args;
            return {
               url: `actors/${actorId}/request/${requestId}`,
               method: 'DELETE',
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: actorEndpoints,
   useCreateActorMutation,
   useCreateManyActorsMutation,
   useGetManyActorsQuery,
   useGetRequestActorsQuery,
   useUpdateActorMutation,
   useUpdateManyActorsMutation,
   useDeleteActorMutation,
   // useDeleteManyActorsMutation,
} = actorService;

export const selectActorsResult = actorService.endpoints.getManyActors.select(undefined);

const selectActorsData = createSelector(
   selectActorsResult,
   actorsResult => actorsResult.data
)

export const { selectAll: selectAllActors, selectById: selectActorById } =
   actorsAdapter.getSelectors(state => selectActorsData(state as any) ?? initialState)