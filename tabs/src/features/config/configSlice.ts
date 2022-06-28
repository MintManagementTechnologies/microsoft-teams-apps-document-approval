import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { IDocTypeConfigModel, ISiteConfigModel, ITeamConfigModel } from './types';

interface ISliceState {
   list: IDocTypeConfigModel[],
   listItem?: IDocTypeConfigModel,
   item?: ISiteConfigModel | ITeamConfigModel,
   formState: string,
}

const initialState: ISliceState = {
   formState: '',
   list: [],
   listItem: undefined,
   item: undefined
}

const configSlice = createSlice({
   name: 'config',
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
      listChanged(state, action) {
         state.list = action.payload;
         return state;
      },
      listItemAdded(state, action) {
         state.list.push(action.payload);
         return state;
      },
      listItemUpdated(state, action) {
         const updatedItem = action.payload;
         const list = state.list;
         state.list = list.map(x => {
            if (x.docType === updatedItem.docType) return updatedItem;
            return x;
         });
         return state;
      },
      listItemDeleted(state, action) {
         const item = action.payload;
         const list = state.list;
         state.list = list.filter(x => x.docType !== item.docType);
         return state;
      },
   },
})

export const { formStateChanged,
   listChanged, listItemAdded, listItemUpdated, listItemDeleted,
   itemChanged
} = configSlice.actions;
export default configSlice.reducer;
