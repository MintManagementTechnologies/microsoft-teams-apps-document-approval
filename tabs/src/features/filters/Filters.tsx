import * as React from 'react';
import {
   Flex, Button, Divider, Checkbox, FilterIcon, Text, Popup, FlexItem
} from "@fluentui/react-northstar";
import { useAppDispatch, useTypedSelector, RootState } from '../../store';
import { filterChanged, FilterStatus, FilterModified, FilterAssignedTo, } from './filtersSlice';

import "./Filters.scss";
import { useTranslation } from 'react-i18next';
const Filters = (props: { disabled?: boolean }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const filterTypes = [FilterStatus, FilterModified, FilterAssignedTo];


   let filters = Object.values(FilterStatus.options);
   filters.push(Object.values(FilterModified.options).toString());
   filters.push(Object.values(FilterAssignedTo.options).toString());
   const dispatch = useAppDispatch();
   let selectedFilters = useTypedSelector((state: RootState) => state.filters);
   let totalFilters = 0; //selectedFilters.map(x => x.value).length === 0 ? '' : `(${selectedFilters.length})`;
   selectedFilters.map(x => x.value).forEach(x => totalFilters += x.length);

   const handleToggleChange = (event: any, filterField: string, filterValue: string) => {
      event.preventDefault();
      const alreadySelected = selectedFilters.find(x => x.field === filterField) !== undefined && selectedFilters.find(x => x.field === filterField)?.value.includes(filterValue)
      dispatch(filterChanged(filterField, filterValue, alreadySelected ? 'remove' : 'add'));
   }
   const handleClear = (event: any) => {
      event.preventDefault();
      dispatch(filterChanged('','', 'clear'));
   }

   return (
      <Popup
         trigger={<Button disabled={props.disabled} className='mmt-filters-btn' text icon={<FilterIcon />} content={`${t(`common:filter.button`)} ${totalFilters === 0 ? '' : `(${totalFilters})`}`} />}
         content={
            <Flex column>
               <Flex vAlign='center'>
                  <Text content={`${t(`common:filter.label.type`)}`} weight='bold' />
                  <FlexItem push>
                     <Button className='mmt-filtersClear-btn' as={Text} text primary content={`${t(`common:filter.clear`)}`}
                        onClick={(event) => handleClear(event)} />
                  </FlexItem>
               </Flex>
               {filterTypes.map((type, index) =>
                  <Flex column key={`filters-flex-${index}-${type.fieldName}`}>
                     <Divider key={`filters-divider-${index}-${type.fieldName}`} />
                     <Text content={`${t(`common:filter.label.${type.title}`)}`} weight='bold' key={`filters-label-${index}-${type.fieldName}`} />
                     {type.options.map((x, i) =>
                        <Checkbox
                           className='mmt-filters-checkbox'
                           key={`filters-checkBox-${x}-${i}`}
                           labelPosition="start"
                           label={`${t(`common:filter.value.${x}`)}`}
                           checked={selectedFilters.find(y => y.field === type.fieldName) !== undefined && selectedFilters.find(y => y.field === type.fieldName)?.value.includes(x.toString())}
                           onChange={(event, ctrl) => handleToggleChange(event, type.fieldName, x.toString())} />
                     )}
                  </Flex>
               )}
            </Flex>
         }
      />
   );
}

export default Filters;