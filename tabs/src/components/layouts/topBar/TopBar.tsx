import './TopBar.scss';

import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

// import { getRouteParams } from '~helpers/urlHelpers';
import { Flex, Segment, Text } from '@fluentui/react-northstar';

import TopActionsBar from './TopActionsBar';

const TopBar = (props: { loading: boolean }): JSX.Element => {
   const { pathname } = useLocation();
   const { loading } = props;
   const {
      userScope,
      view,
      action,
      id
   } = getRouteParams(pathname);

   return (
      <>
         {view !== 'config' &&
            <Flex className='mmt-topBar' column>
               <Segment>
                  <TopActionsBar loading={loading} />
               </Segment>
            </Flex>
         }
      </>
   );
}

export default TopBar;