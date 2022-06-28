import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Alert, ExclamationTriangleIcon, Flex, Text } from '@fluentui/react-northstar';

const ErrorMessage = (props: { message?: string, messageDetails?: string, onDismiss?: () => void, children?: React.ReactNode }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { pathname } = useLocation();
   const {
      userScope,
      view,
      action,
      id
   } = getRouteParams(pathname);

   const [showDetails, setShowDetails] = useState(false);

   const { message, messageDetails } = props;
   const actions = [];
   if(messageDetails !== undefined){
      actions.push({
         primary: true,
         content: t('common:button.viewProperty', { property: t('common:general.details') }),
         key: 'errorDetails',
         onClick: () => setShowDetails(!showDetails)
      })
   }
   if(props.onDismiss !== undefined) {
      actions.push({
         primary: false,
         content: t('common:button.dismiss'),
         onClick: props.onDismiss,
         key: 'dismiss',
       })
   }
   return (
      <>
         <Alert icon={<ExclamationTriangleIcon />}
            className="mmt-errorMessage"
            danger
            // variables={{
            //    oof: true,
            // }}
            content={message}
            actions={actions} />
         <Flex fill column gap='gap.medium' className={showDetails ? '' : 'mmt-hidden'}>
            <Flex hAlign='center' column gap='gap.medium' className={'mmt-messageDetails'}>
               <Text content={messageDetails} error />
               <Text content={`Path: ${pathname}`} />
            </Flex>
            <Flex fill column gap='gap.medium' className={'mmt-additionalInfo'}>
               {props.children}
            </Flex>
         </Flex>

      </>
   );
}

export default ErrorMessage;

/* <Alert icon={<ErrorIcon />} danger content="This is an alert with a warning icon"
actions={[
  {
    content: 'Privacy policy',
    key: 'privacy',
    primary: true,
  },
  'Settings',
]} /></> */
      // <Flex hAlign='center' fill><Loader label={t('errorOpeningModal')} /></Flex>