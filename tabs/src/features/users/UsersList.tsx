import './UsersList.scss';

import { getBaseUrl } from 'common/utils/helpers/urlHelpers';
import UserPill from 'components/common/userPill/UserPill';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// import { upperFirstLetter } from '~helpers/stringHelpers';
// import { getBaseUrl } from '~helpers/urlHelpers';
import {
    Button, EditIcon, Flex, gridCellWithFocusableElementBehavior, Table, Text, TrashCanIcon
} from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { createSelector } from '@reduxjs/toolkit';

import { IUserModel } from '../../common/types/user';
import Loader from '../../components/common/Loader';
import { useLazyGetManyUsersQuery } from '../../services/graphApiService';
import { RootState, useTypedSelector } from '../../store';
import { useGetAllUsersQuery } from './userService';

export interface IHeader {
   key: string;
   items: {
      content: string;
      key: string;
   }[];
}

export interface ICell {
   content: string | JSX.Element;
   key: string;
   truncateContent?: boolean;
}

export interface IRow {
   key: string;
   items: ICell[];
}
const UsersList = (): JSX.Element => {
   const { t, i18n } = useTranslation();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);


   const searchQuery = useTypedSelector((state: RootState) => state.search);
   const selectedFilters = useTypedSelector((state: RootState) => state.filters);
   const selectFilterResults = useMemo(() => {
      // Return a unique selector instance for this page so that
      // the filtered results are correctly memoized
      return createSelector(
         (res: any) => res.data,
         (data) => {
            let dataResult = data ? data as IUserModel[] : undefined;
            let totalFilters = 0; //selectedFilters.map(x => x.value).length === 0 ? '' : `(${selectedFilters.length})`;
            selectedFilters.map(x => x.value).forEach(x => totalFilters += x.length);
            return dataResult ?
               dataResult.filter((x: IUserModel) => x.title.toLowerCase().includes(searchQuery))
               : undefined
         }
      )
   }, [selectedFilters, searchQuery]);


   const { filteredData, isLoading: isLoadingGetUsersByUser, isFetching: isFetchingGetUsersByUser, refetch } = useGetAllUsersQuery(undefined, {
      selectFromResult: result => {
         return ({
            ...result,
            filteredData: selectFilterResults(result)
         })
      }
   });
   let allItems: IUserModel[] = filteredData || [];

   const [trigger, result] = useLazyGetManyUsersQuery();
   const allUsers = result.data || [];

   useEffect(() => {
      if (!allItems) return;
      //trigger(allUserUPNs);
   }, [isFetchingGetUsersByUser]);
   
   const header = {
      className: 'mmt-header',
      key: 'browseUsers-header',
      items: [
         {
            content: t('common:header.user'),
            key: 'browseUsers-h-user',
            styles: {
               maxWidth: '220px'
            }
         },
         {
            content: t('common:header.personaType'),
            key: 'browseUsers-h-personaType',
            styles: {
               maxWidth: '220px',
            }
         },
         {
            content: '',
            key: 'browseUsers-h-actions',
            styles: {
               maxWidth: '100px',
            }
         },
      ],
   }

   const getPersonaTypes = (_personaTypes: string[]) => {
      return (<Flex column>
         {_personaTypes.map((persona,i) => 
            <Text content={t(`form.personaType.value.${persona}`)} key={`${persona}-${i}`} />
         )}
      </Flex>)

   }

   const getUserPill = (_user: IUserModel) => {
      return <UserPill userId={_user.id} disabled size="small" />
   }

   const getRowActions = (_user: IUserModel) => {

      return (<Button.Group buttons={[{
         icon: <EditIcon size='small' />,
         key: `edit-${_user.id}`,
         iconOnly: true,
         text: true,
         title: 'edit',
         onClick: (event: any) => handleOnActionClick(event, 'edit', _user.id)
      }, {
         icon: <TrashCanIcon size='small' />,
         key: `delete-${_user.id}`,
         iconOnly: true,
         text: true,
         title: 'delete',
         onClick: (event: any) => handleOnActionClick(event, 'delete', _user.id)
      }]} />);
   };

   const getUserRows = (_users: IUserModel[]) => {
      let actingUsers = [..._users].sort((x: IUserModel) => x.modifiedTimestamp);
      const rows = actingUsers.map((x, i) => ({
         className: 'mmt-table-row',
         key: `user-${x.id}`,
         items: [
            {
               content: getUserPill(x),
               truncateContent: true,
               key: `col-createdByDisplayName-index-${i}`,
               styles: {
                  maxWidth: '220px',
               }
            },
            {
               content: getPersonaTypes(x.personaTypes),
               truncateContent: true,
               key: `col-currentApprover-index-${i}`,
               styles: {
                  maxWidth: '220px',
               }
            },
            {
               content: getRowActions(x),
               key: `col-actions-index-${i}`,
               styles: {
                  maxWidth: '100px',
               },
               accessibility: gridCellWithFocusableElementBehavior,
               onClick: (e: any) => {
                  e.stopPropagation()
               }
            },
         ]
      }));
      return rows;
   }

   const handleOnActionClick = (_event: any, _action: string, _id: string) => {

      const submitHandler = (err: any, result: any) => {
         if (result === "refreshUsers") {
            refetch();
         } else {
            console.log("DONT REFRESH");
         }
      };


      const taskInfo = {
         url: getBaseUrl() + `/me/users/${_action}/${_id}`,
         title: `${t(`taskModule.title.${_action}User`)}`,
         height: 400,
         width: 400,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }

   const isLoading = isLoadingGetUsersByUser || isFetchingGetUsersByUser || result.isLoading || result.isFetching;
   return (
      <Flex fill column>
         {/* <Text content={t('form.userStatus.label')} className={'ui-form__label'} /> */}
         {(isLoading || !allItems) ? <Loader message={t('common:entity.user', { count: 0 })} />
            :
            (allItems.length > 0 ?
               <Table
                  className={`mmt-table`}
                  header={header as any}
                  rows={getUserRows(allItems)}
                  variables={{ cellContentOverflow: 'none' }}
                  aria-label='Nested navigation'
               />
               :
               <Flex fill hAlign='center' padding='padding.medium'>
                  <Text content={t('common:error.noItems', { entity: t('common:entity.user', { count: 0 }) })} size='large' weight={'semibold'} />
               </Flex>
            )
         }
      </Flex>
   );
}

export default UsersList;