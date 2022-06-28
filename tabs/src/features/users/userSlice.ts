

import { getLocale } from 'common/utils/helpers/localeHelpers';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   title: '',
   upn: '',
   id: '',
   locale: getLocale(),
   personaTypes: [] as string[],
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		userDetailsChanged(state, action) {
         const { title, upn, id, locale } = action.payload;
         state.title = title || state.title;
         state.upn = upn || state.upn;
         state.id = id || state.id;
         state.locale = locale || state.locale;
         return state;
		},
		userPersonaTypesChanged(state, action) {
         const { personaTypes } = action.payload;
         state.personaTypes = personaTypes || state.personaTypes;
         return state;
		}
	},
})

export const { userDetailsChanged, userPersonaTypesChanged } = userSlice.actions;
export default userSlice.reducer

// export const selectCurrentUser = createSelector(
//    [(state: any) => state.user],
//    (user) => user
// );