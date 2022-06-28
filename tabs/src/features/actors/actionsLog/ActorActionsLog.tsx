import './ActorActionsLog.scss';

import { getLocaleDate } from 'common/utils/helpers/localeHelpers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { IActorModel } from '@common/types/actor';
// import { getLocaleDate } from '~helpers/localeHelpers';
import { Flex, Table, Text } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../../components/common/Loader';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import { IActorModel } from '../actor';
import { useGetRequestActorsQuery } from '../actorService';
import { actorLevelsChanged } from '../actorsSlice';

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
const ActorActionsLog = (props: { requestId: string, requestVersion: number }): JSX.Element => {
   const { requestId, requestVersion } = props;
   const { t, i18n } = useTranslation();
   const dispatch = useAppDispatch();

   const allActors = useTypedSelector((state: RootState) => state.actors.allActors);
   
   const { data: dataGetRequestActors, isLoading: isLoadingGetRequestActors, isFetching: isFetchingGetRequestActors } = useGetRequestActorsQuery(requestId || skipToken);

   useEffect(() => {
      if (!dataGetRequestActors || allActors.length > 0) return;
      if(dataGetRequestActors.filter(x => x.version === requestVersion).length === 0) return;
      dispatch(actorLevelsChanged(dataGetRequestActors.filter(x => x.version === requestVersion)));
   }, [dataGetRequestActors, allActors]);


   // const handleTotalLevelChange = (event: any, increaseLevels: boolean) => {
   //    event.preventDefault();
   //    try {
   //       setAddLevelStatus('pending');
   //       let nxtLvl = allLevels.length + 1;
   //       let defaultLvl = {
   //          endorsementType: "",
   //          level: nxtLvl,
   //          availablePersonas: ['actor', 'pa'],
   //          requiredPersonas: ['actor'],
   //          actors: [],
   //          status: "",
   //          outcome: "",
   //          id: `${nxtLvl}-${new Date().getTime()}`,
   //          title: "Actor & PA",
   //          createdTimestamp: 0,
   //          modifiedTimestamp: 0,
   //          active: false,
   //       };
   //       dispatch(levelAdded(defaultLvl));
   //    } catch (err) {
   //       console.error('Failed to save the post: ', err)
   //    } finally {
   //       setAddLevelStatus('idle');
   //    }
   // }
   const header = {
      className: 'mmt-header',
      key: 'actorActionsLog-header',
      items: [
         {
            content: t('common:header.level'),
            key: 'actorActionsLog-h-level',
            styles: {
               maxWidth: '50px'
            }
         },
         {
            content: t('common:header.status'),
            key: 'actorActionsLog-h-status',
            styles: {
               maxWidth: '300px',
            }
         },
         {
            content: t('common:header.date'),
            key: 'actorActionsLog-h-date',
            styles: {
               maxWidth: '50px',
            }
         },
      ],
   }

   const rows = [
      {
         key: 'r-1',
         items: [
            {
               content: <Flex hAlign='center'><Text content='1' /></Flex>,
               key: '1-1',
               styles: {
                  maxWidth: '50px'
               }
            },
            {
               content: <Text content='Approved by Abrie van Wyk' color={'green'} />,
               truncateContent: true,
               key: '1-2',
               styles: {
                  maxWidth: '300px',
               }
            },
            {
               content: getLocaleDate(new Date().getTime(), 'dd/MM'),
               key: '1-3',
               styles: {
                  maxWidth: '50px',
               }
            }
         ],
      },
      {
         key: 'r-2',
         items: [
            {
               content: <Flex hAlign='center'><Text content='1' /></Flex>,
               key: '2-1',
               styles: {
                  maxWidth: '50px'
               }
            },
            {
               content: <Text content='Approved by Abrie van Wyk' color={'red'} />,
               truncateContent: true,
               key: '2-2',
               styles: {
                  maxWidth: '300px',
               }
            },
            {
               content: getLocaleDate(new Date().getTime(), 'dd/MM'),
               key: '2-3',
               styles: {
                  maxWidth: '50px',
               }
            }
         ],
      },
      {
         key: 'r-3',
         items: [
            {
               content: <Flex hAlign='center'><Text content='1' /></Flex>,
               key: '3-1',
               styles: {
                  maxWidth: '50px'
               }
            },
            {
               content: <Text content='Approved by Abrie van Wyk' color={'orange'} />,
               truncateContent: true,
               key: '3-2',
               styles: {
                  maxWidth: '300px',
               }
            },
            {
               content: getLocaleDate(new Date().getTime(), 'dd/MM'),
               key: '3-3',
               styles: {
                  maxWidth: '50px',
               }
            }
         ],
      },
   ]

   const getStatusControl = (_outcome: string, _endorsementType: string, _displayName: string) => {
      let statusColor = 'orange';
      let statusContent = '';
      let outcome = _outcome || 'pending';
      switch (outcome) {
         case 'recommended':
         case 'supported':
         case 'approved':
            statusContent = `${t(`form.outcome.sentenceValue.approved`, {
               outcome: t(`form.outcome.value.${outcome}`),
               displayName: _displayName
            })}`;
            statusColor = 'green';
            break;
         case 'rejected':
            statusContent = `${t(`form.outcome.sentenceValue.${outcome}`, {
               outcome: t(`form.endorsementType.verbValue.${_endorsementType}`),
               displayName: _displayName
            })}`
            statusColor = 'red';
            break;
         default:
            statusContent = `${t(`form.outcome.sentenceValue.${outcome}`, {
               outcome: t(`form.endorsementType.verbValue.${_endorsementType}`),
               displayName: _displayName
            })}`
            break;
      }
      return <Text content={statusContent} color={statusColor} />
   }

   const getLevelRows = (_actors: IActorModel[]) => {
      const actingActors = _actors.filter(x => x.personaType === 'actor').sort((a, b) => a.level - b.level);
      const rows = actingActors.map((x,i) => ({
            key: `lvl-${x.level}-${x.id}`,
            items: [
               {
                  content: <Flex hAlign='center'><Text content={`${x.level}`} /></Flex>,
                  key: `col-lvl-index-${i}`,
                  styles: {
                     maxWidth: '50px'
                  }
               },
               {
                  content: getStatusControl(x.outcome, x.endorsementType, x.title),
                  truncateContent: true,
                  key: `col-status-index-${i}`,
                  styles: {
                     maxWidth: '300px',
                  }
               },
               {
                  content: x.status === 'complete' ? getLocaleDate(x.completedTimestamp, 'dd/MM') : '--',
                  key: `col-date-index-${i}`,
                  styles: {
                     maxWidth: '50px',
                  }
               }
            ]
      }));
      return rows;
   }

   const isLoading = isLoadingGetRequestActors || isFetchingGetRequestActors;
   return (
      <Flex fill column>
         {/* <Text content={t('form.actorStatus.label')} className={'ui-form__label'} /> */}
         {(isLoading || !dataGetRequestActors) ? <Loader message={t('common:entity.actorActionsLog')} />
            : 
            <Table
               className={`mmt-table`}
               header={header as any}
               rows={getLevelRows(allActors)}
               compact
               variables={{ cellContentOverflow: 'none' }}
               aria-label='Nested navigation'
               styles={{
                  maxWidth: '420px',
               }}
            />
         }
      </Flex>
   );
}

export default ActorActionsLog;