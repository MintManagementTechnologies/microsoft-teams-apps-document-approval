import { baseApi } from '../../services';
import { ICommentModel } from '../../common/types/comment';

export const commentService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      createComment: build.mutation<ICommentModel, Partial<ICommentModel>>({
         query(body) {
            return {
               url: `comments`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<ICommentModel>, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               commentService.util.updateQueryData('getManyComments', _arg.requestId || '', draftItems => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItems.push(_arg as ICommentModel);
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      getManyComments: build.query<ICommentModel[], string>({
         query: (requestId) => `comments/request/${requestId}`,
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: commentEndpoints,
   useCreateCommentMutation,
   useGetManyCommentsQuery,
} = commentService;
