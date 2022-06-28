import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { IBaseFile } from './types';

interface ISliceState {
   list: IBaseFile[],
   item?: IBaseFile,
   formState: string,
}

const initialState: ISliceState = {
   formState: '',
   list: [],
   item: undefined
}

const fileSlice = createSlice({
   name: 'file',
   initialState,
   reducers: {
      formStateChanged(state, action) {
         state.formState = action.payload;
         return state;
      },
      itemChanged(state, action) {
         state.item = action.payload;
         return state;
      },
      // itemUploading(state, action) {
      //    const filePending = action.payload as File;
      //    const fileItem: IBaseFile = {
      //       id: filePending.name,
      //       title: filePending.name,
      //       viewUrl: '',
      //       contentType: filePending.type,
      //       size: filePending.size,
      //       uploaded: false,
      //       progress: 0,
      //    }
      //    state.item = fileItem;
      //    return state;
      // },
		itemUploading: {
			reducer(state, action) {
            state.item = action.payload;
            return state;
			},
			prepare(fileUploading): any {
            const filePending = fileUploading as File;
            const fileItem: IBaseFile = {
               id: filePending.name,
               title: filePending.name,
               viewUrl: '',
               contentType: filePending.type,
               size: filePending.size,
               uploaded: false,
               progress: 0,
            }
				return {
					payload: fileItem,
				}
			},
		},
      listChanged(state, action) {
         state.list = action.payload;
         return state;
      },
      itemAdded(state, action) {
         state.list.push(action.payload);
         return state;
      },
      itemUpdated(state, action) {
         const updatedItem = action.payload;
         const list = state.list;
         state.list = list.map(x => {
            if (x.id === updatedItem.id) return updatedItem;
            return x;
         });
         return state;
      },
      itemDeleted(state, action) {
         const item = action.payload;
         const list = state.list;
         state.list = list.filter(x => x.id !== item.id);
         return state;
      },
   },
   // extraReducers(builder) {
   //   builder
   //     .addCase(addNewLevel.fulfilled, (state, action) => {
   //       // Add any fetched posts to the array
   //       actorLevelsAdapter.addOne(state, action.payload)
   //     })
   // },
})

export const { formStateChanged, itemChanged, itemUploading, listChanged, itemAdded, itemUpdated, itemDeleted } = fileSlice.actions;
export default fileSlice.reducer;

export const selectAllFiles = createSelector(
   [
      (state: RootState) => state.file.item,
      (state: RootState) => state.file.list,
   ],
   (
      currentFile,
      allFiles,
   ) => {
      let tmpAllFiles: IBaseFile[] = [];
      if (Array.isArray(allFiles)) {
         tmpAllFiles = allFiles;
      }
      if(!currentFile){
         return tmpAllFiles;
      }
      return [currentFile, ...tmpAllFiles];
   }
);

export const selectAttachmentIsValid = createSelector(
   [(state: RootState) => state.file],
   (file) => file.formState === 'isValid',
);