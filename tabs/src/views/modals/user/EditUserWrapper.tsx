import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useTranslation } from 'react-i18next';

// import { getRouteParams } from '~helpers/urlHelpers';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

//import { v4 as uuidv4 } from 'uuid';
import { IUserModel } from '../../../common/types/user';
import Loader from '../../../components/common/Loader';
import {
    useCreateManyUsersMutation, useCreateUserMutation, useDeleteUserMutation, useGetUserQuery,
    useUpdateUserMutation
} from '../../../features/users/userService';
import UserForm from './UserForm';

const EditUserWrapper = (): JSX.Element => {
   const { t } = useTranslation();
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const userId = id || 'notFound';

   const { data: dataGetUser, isLoading: isLoadingGetUser, isFetching: isFetchingGetUser } = useGetUserQuery(action !== 'new' ? userId : skipToken);
   const [createUser, { isLoading: isLoadingCreateUser }] = useCreateUserMutation();
   const [createManyUsers, { isLoading: isLoadingCreateManyUsers }] = useCreateManyUsersMutation();
   const [updateUser, { isLoading: isLoadingUpdateUser }] = useUpdateUserMutation();
   const [deleteUser, { isLoading: isLoadingDeleteUser }] = useDeleteUserMutation();

   const onSubmit = async (_users: IUserModel[], _personaTypes: string[]) => {
      if(action === 'new') await handleOnCreate(_users, _personaTypes);
      if(action === 'edit') await handleOnUpdate(_users, _personaTypes);
      if(action === 'delete') await handleOnDelete(_users, _personaTypes);
      microsoftTeams.tasks.submitTask("refreshUsers");
   }

   const handleOnCreate = async (_users: IUserModel[], _personaTypes: string[]) => {
      let newUsers: IUserModel[] = [];
      _users.forEach(user => {
         newUsers.push({
            ...user,
            createdTimestamp: 0,
            modifiedTimestamp: 0,
            personaTypes: _personaTypes
         });
      });
      await createManyUsers(newUsers);
   }

   const handleOnUpdate = async (_users: IUserModel[], _personaTypes: string[]) => {
      let newUsers: IUserModel[] = [];
      _users.forEach(user => {
         newUsers.push({
            ...user,
            personaTypes: _personaTypes
         });
      });
      newUsers.forEach(async (x) => await updateUser(x));
   }

   const handleOnDelete = async (_users: IUserModel[], _personaTypes: string[]) => {
      _users.forEach(async (x) => await deleteUser(x.id));
   }

   const newUser: IUserModel = {
      upn: '',
      firstName: '',
      lastName: '',
      jobTitle: '',
      department: '',
      personaTypes: [],
      active: true,
      id: '',
      title: '',
      createdTimestamp: new Date().getTime(),
      modifiedTimestamp: new Date().getTime()
   }
   let singleItem: IUserModel = dataGetUser || newUser;
   const isLoading = isLoadingGetUser || isFetchingGetUser || isLoadingCreateManyUsers || isLoadingUpdateUser || isLoadingDeleteUser;
   return (
      <>
         {isLoading ? <Loader message={t('common:entity.user', { count: 1 })} /> :
            <UserForm
               item={singleItem}
               action={action as any}
               onSubmit={onSubmit}
            />
         }
      </>
   );
}

export default EditUserWrapper;