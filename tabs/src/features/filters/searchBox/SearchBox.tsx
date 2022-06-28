import './SearchBox.scss';

import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Input, SearchIcon } from '@fluentui/react-northstar';

import { log } from '../../../common/utils/customConsoleLog';
import { useAppDispatch } from '../../../store';
import { searchQueryChanged } from './searchBoxSlice';

const SearchBox = (props: {disabled?: boolean}): JSX.Element => {
   const { disabled } = props;
   const { view } = getRouteParams(window.location.hash);
   const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const entity = view === 'users' ? 'displayName' : 'title';

   useEffect(() => {
      if (disabled) {
         log('useEffect - SearchBox', 'success');
         dispatch(searchQueryChanged(''));
      }
   }, [dispatch, disabled]);

    return (
        <Input className="mmt-searchBox" inverted fluid role="search"
            placeholder={t('common:filter.placeholder.searchBy', {entity: t(`common:header.${entity}`)})}
            icon={<SearchIcon />}
            onChange={(event: any) => dispatch(searchQueryChanged(event.target.value.toLowerCase()))}
            disabled={props.disabled} 
        // onChange={(event: any) => dispatch({ type: 'SEARCHTEXT_FILTERS', searchText: event.target.value.toLowerCase() })}
        />
    );
}

export default SearchBox;