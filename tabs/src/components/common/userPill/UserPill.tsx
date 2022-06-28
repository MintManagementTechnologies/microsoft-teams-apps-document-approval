import './UserPill.scss';

import { IDetailedUserModel } from 'common/types/user';
import { useEffect, useState } from 'react';

import { Avatar, Loader, Pill, PillProps } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import { defaultAvatar } from '../../../common/utils/commonVariables';
import { stringToHslColor } from '../../../common/utils/sharedFunctions';
import { useGetUserWithPhotoQuery, useLazyGetUserQuery } from '../../../services/graphApiService';

const UserPill = (props: { userId: string, title?: string } & PillProps): JSX.Element => {
   const { userId, title, image, ...otherProps } = props;
   const queryGraph = !(title && image) && userId && userId.length > 0;
   const [graphUserDetails, setGraphUserDetails] = useState<IDetailedUserModel>();

   const { data: dataGetUserWithPhoto, isLoading: isLoadingGetUserWithPhoto, isFetching: isFetchingGetUserWithPhoto, isError, error } = useGetUserWithPhotoQuery(queryGraph ? userId : skipToken);
   const [triggerGetUser,
      { data: dataGetUser, isFetching: isFetchingGetUser, isLoading: isLoadingGetUser }]
      = useLazyGetUserQuery();

   useEffect(() => {
      if(isError && !dataGetUser){
         if((error as any).error.toLowerCase().includes('imagenotfound')){
            console.error('ImageNotFoundException');
            triggerGetUser(userId);
         }
         return;
      }
      if(dataGetUserWithPhoto){
         setGraphUserDetails(dataGetUserWithPhoto)
      } else if(dataGetUser) {
         setGraphUserDetails(dataGetUser)
      }

   }, [dataGetUserWithPhoto, dataGetUser, isError])

   const isLoading = isLoadingGetUserWithPhoto || isFetchingGetUserWithPhoto || isLoadingGetUser || isFetchingGetUser;
   if (isLoading)
      return <Loader size={"smallest"} />;
   if (!graphUserDetails && !title)
      return <Pill className="mmt-userPill" image={defaultAvatar} size="small" disabled={otherProps.disabled}>error</Pill>;

   const userDisplayName = graphUserDetails ? graphUserDetails.title : `${title}`;
   const userAvatar = graphUserDetails ? graphUserDetails.image : image;

   const avatarColors = stringToHslColor(userDisplayName);

   const avatar = (<Avatar name={userDisplayName} size={otherProps.size}
      image={userAvatar}
      label={{
         styles: {
            color: avatarColors.color,
            backgroundColor: avatarColors.backgroundColor,
         },
      }}
   />)

   return (<Pill className="mmt-userPill" icon={avatar} size="small" disabled={otherProps.disabled}>{userDisplayName}</Pill>)
}

export default UserPill;