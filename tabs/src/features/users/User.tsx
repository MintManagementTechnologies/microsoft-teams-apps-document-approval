import { TeamsFxContext } from 'Context';
import { useContext, useEffect } from 'react';
import { useAppDispatch } from 'store';

import { Flex, Text } from '@fluentui/react-northstar';
import { useData } from '@microsoft/teamsfx-react';

import { userDetailsChanged } from './userSlice';

const User = (props: { loading?: boolean }): JSX.Element => {
   const dispatch = useAppDispatch();
   const { teamsfx, context } = useContext(TeamsFxContext);

   const { loading: loadingUserInfo, data: dataUserInfo, error: errorUserInfo } = useData(async () => {
      if (teamsfx) {
         const userInfo = await teamsfx.getUserInfo();
         return userInfo;
      }
   });


   useEffect(() => {
      if (!dataUserInfo || !context) return;
      console.log(`setting dataUserInfo-context`);
      const userCtx = {
         title: dataUserInfo.displayName,
         upn: context.userPrincipalName.toLowerCase(),
         id: context?.userObjectId
      };
      dispatch(userDetailsChanged(userCtx));
   }, [dataUserInfo]);
   return <></>;
   // return (
   //    <Flex gap="gap.small" fill>
   //       <Flex column >
   //          <Text content={`dataUserInfo`} size="large" weight="bold" />
   //          <Text content={`name: ${dataUserInfo?.displayName}`} />
   //          <Text content={`mail: ${dataUserInfo?.preferredUserName}`} />
   //          <Text content={`adId: ${dataUserInfo?.objectId}`} />
   //       </Flex>
   //       <Flex column >
   //          <Text content={`context`} size="large" weight="bold" />
   //          <Text content={`upn: ${context?.userPrincipalName}`} />
   //          <Text content={`id: ${context?.userObjectId}`} />
   //          <Text content={`locale: ${context?.locale}`} />
   //       </Flex>
   //    </Flex>
   // );
}

export default User;