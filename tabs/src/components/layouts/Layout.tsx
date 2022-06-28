import './Layout.scss';

import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { TeamsFxContext } from 'Context';
import { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet, useLocation } from 'react-router-dom';

import { Flex } from '@fluentui/react-northstar';

import TopBar from './topBar/TopBar';

const Layout = (): JSX.Element => {
   const { pathname,  } = useLocation();
   const {
       userScope,
       view,
       action,
       id
   } = getRouteParams(pathname);
   const { context } = useContext(TeamsFxContext);
   const isTab = context && context?.frameContext === 'content';
   return (
      <>
         {isTab &&
            <TopBar loading={false} />
         }
         <Flex fill className={`mmt-layout mmt-${view} mmt-${view}-${action}`}>
            <Container fluid>
               <Outlet />
            </Container>
         </Flex>
      </>
   );
}

export default Layout;