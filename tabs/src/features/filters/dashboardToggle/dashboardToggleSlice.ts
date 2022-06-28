import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = '';

const dashboardToggleSlice = createSlice({
	name: 'dashboardToggle',
	initialState,
	reducers: {
		dashboardChanged(state, action) {
			state = action.payload;
         return state;
		}
	},
})

export const { dashboardChanged } = dashboardToggleSlice.actions;
export default dashboardToggleSlice.reducer

export const selectDashboard = createSelector(
   [(state: any) => state.dashboard],
   (dashboard: string) => dashboard
);