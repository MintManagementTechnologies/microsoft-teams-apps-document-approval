import { createSelector, createSlice } from '@reduxjs/toolkit';

export interface IFormSection {
   title: string,
   isValid: boolean,
}

export interface IFormState {
   title: string,
   status: string,
   isValid: boolean,
   sections: IFormSection[]
}

const initialState:IFormState = {
   title: '',
   status: '',
   isValid: false,
   sections: []
};

const formsSlice = createSlice({
	name: 'activeForm',
	initialState,
	reducers: {
		formChanged(state, action) {
			state = action.payload;
         return state;
		}
	},
})

export const { formChanged } = formsSlice.actions;
export default formsSlice.reducer

export const selectForm = createSelector(
   [(state: any) => state.activeForm],
   (activeForm: IFormState) => activeForm
);