import { createSlice } from '@reduxjs/toolkit';

export const FilterStatus = {
   title: 'status',
   fieldName: 'status',
   options: ['pending', 'rejected', 'approved', 'withdrawn'],
}

export const FilterModified = {
   title: 'inactive',
   fieldName: 'modifiedTimestamp',
   options: [2,3],
}

export const FilterAssignedTo = {
   title: 'assignedTo',
   fieldName: 'currentApproversUPN',
   options: ['currentApprover'],
}

const initialState = [
   {
      field: 'status',
      value: []
   },
   {
      field: 'modifiedTimestamp',
      value: []
   },
   {
      field: 'currentApproversUPN',
      value: []
   },
] as {field: string, value: string[]}[];

const filtersSlice = createSlice({
   name: 'filters',
   initialState,
   reducers: {
      filterChanged: {
         reducer(state, action) {
            let { fieldName, fieldValue, changeType } = action.payload
            const filtersState = state;
            const filterType = state.find(x => x.field === fieldName) as {field: string, value: string[]};
            switch (changeType) {
               case 'add': {
                  if (!filterType.value.includes(fieldValue)) {
                     filterType.value.push(fieldValue)
                  }
                  break;
               }
               case 'remove': {
                  //@ts-ignore
                  filterType.value = filterType?.value.filter((x) => x !== fieldValue );
                  break;
               }
               case 'clear': {
                  state = initialState;
                  break;
               }
               default:
                  return
            }
            return state;
         },
         prepare(fieldName, fieldValue, changeType): any {
            return {
               payload: { fieldName, fieldValue, changeType },
            }
         },
      },
   },
})

export const { filterChanged } = filtersSlice.actions;
export default filtersSlice.reducer
