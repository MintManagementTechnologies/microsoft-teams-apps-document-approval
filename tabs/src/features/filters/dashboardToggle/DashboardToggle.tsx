import './DashboardToggle.scss';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { Button, Dropdown, Flex, GridIcon, NumberListIcon } from '@fluentui/react-northstar';

import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import { dashboardChanged, selectDashboard } from './dashboardToggleSlice';

const DashboardToggle = (): JSX.Element => {
   //const [dashboardView, setDashboardView] = useState('approvals');
   const dashboardView = useSelector(selectDashboard);
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const { t } = useTranslation();
   const dispatch = useAppDispatch();

   useEffect(() => {
      if (dashboardView === '') {
         dispatch(dashboardChanged(`approvals`));
      }
   }, []);

   const handleOnChange = (event: any, value: any) => {
      if (event !== null) event.preventDefault();
      dispatch(dashboardChanged(value.key));
   }

   const dashboardOptions = [
      { header: t('tab.approvals.header'), key: `approvals` },
      { header: t('tab.requests.header'), key: `requests` },
   ];
   if (currentUser.personaTypes.includes('dgsupport')) {
      dashboardOptions.push({ header: t('tab.dgSupport.header'), key: `all` })
   }
   const defaultValue = dashboardOptions.find(option => option.key === dashboardView) || dashboardOptions[0]

   return (
      <Flex>
         <Dropdown
            inverted
            fluid
            className="mmt-dashboardToggle"
            defaultValue={defaultValue}
            items={dashboardOptions}
            onChange={(event, { value }) => handleOnChange(event, value)}
         />
         {/* <Button onClick={(event) => onDashboardToggleClick(event, 'approvals')}
            content={`${t(`tab.approvals.header`)}`} text primary={dashboardView === 'approvals'} />
         <Button onClick={(event) => onDashboardToggleClick(event, 'requests')}
            content={`${t(`tab.requests.header`)}`} text primary={dashboardView === 'requests'} /> */}
      </Flex>
   );
}

export default DashboardToggle;