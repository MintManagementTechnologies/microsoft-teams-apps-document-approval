// import { sortBy } from '~helpers/arrayHelpers';

import { sortBy } from 'common/utils/helpers/arrayHelpers';

import { createSelector, createSlice } from '@reduxjs/toolkit';

import { ICommentModel } from '../../common/types/comment';

let defaultComment: ICommentModel = {
   requestId: "",
   upn: "",
   comment: "",
   version: 0,
   id: "",
   title: "",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: false
}

// const commentsAdapter = createEntityAdapter({
//    sortComparer: (a: IComment, b: IComment) => b.level - a.level,
// })

// const initialState = commentsAdapter.getInitialState();
//(a, b) => b.date.localeCompare(a.date)
// export const addNewLevel = createAsyncThunk(
//    'comments/addNewLevel',
//    async (initialLevel) => {
//       return initialLevel
//    }
// )

const initialState: ICommentModel[] = [];

const commentsSlice = createSlice({
   name: 'comments',
   initialState,
   reducers: {
      commentAdded(state, action) {
         const { id, comment } = action.payload
         const existingComment = state.find(x => x.id === id);
         if (existingComment) {
            existingComment.comment = comment;
         } else {
            state.push(action.payload);
         }
      },
      commentUpdated(state, action) {
         const { id, comment } = action.payload
         const existingComment = state.find(x => x.id === id);
         if (existingComment) {
            existingComment.comment = comment;
         }
      },
      commentDeleted(state, action) {
         const { level, id } = action.payload
         return state.filter(x => x.id !== id);
      },
   },
   // extraReducers(builder) {
   //   builder
   //     .addCase(addNewLevel.fulfilled, (state, action) => {
   //       // Add any fetched posts to the array
   //       commentsAdapter.addOne(state, action.payload)
   //     })
   // },
})

export const { commentAdded, commentUpdated, commentDeleted } = commentsSlice.actions;
export default commentsSlice.reducer;

export const selectComment = createSelector(
   [(state: any) => state.comments, (state, id) => id],
   (comments, id) => comments.find((x: ICommentModel) => x.id === id)
);

export const selectLatestComment = createSelector(
   [(state: any) => state.comments],
   (comments) => comments.sort((a:ICommentModel, b:ICommentModel) => sortBy(b.createdTimestamp, a.createdTimestamp))[0]
);