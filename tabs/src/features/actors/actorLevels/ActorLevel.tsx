import './ActorLevel.scss';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// import { IActorModel } from '@common/types/actor';
import { Flex, FormLabel } from '@fluentui/react-northstar';

import { useAppDispatch } from '../../../store';
import { IActorModel } from '../actor';
import { selectActiveLevel, selectActorLevel } from '../actorsSlice';
import EditActorLevel from './EditActorLevel';
import ViewActorLevel from './ViewActorLevel';

const ActorLevel = (props: { levelId: string, displayMode: string }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { levelId, displayMode } = props;

   const dispatch = useAppDispatch();
   //@ts-ignore
   const item = useSelector((state) => selectActorLevel(state, levelId));
   const activeLevel = useSelector(selectActiveLevel);

   useEffect(() => {
      if (!item) return;
      if (activeLevel && item.id === activeLevel.id) {
         setDisplayModeState('edit');
         return;
      }
      const reqActors = item.actors.filter((x: IActorModel) => item.requiredPersonas.includes(x.personaType));
      if (reqActors.length > 0) {
         setDisplayModeState(displayMode);
      }
   }, [item, activeLevel])

   const [displayModeState, setDisplayModeState] = useState((activeLevel && item.id === activeLevel.id) ? 'edit' : displayMode);

   return (
      <Flex gap="gap.small" column fill className={`mmt-input-actorLevel-${item.level}`}>
         <FormLabel content={`${t('form.actorLevel.label', { level: item.level, title: t(item.title) })}`} />
         <Flex gap='gap.small' className={`mmt-actorLevel-box-row`} fill space={'between'}>
            {displayModeState === 'edit' ?
               <EditActorLevel lvlItem={item} />
               :
               <ViewActorLevel lvlItem={item} isLocked={displayModeState === 'locked'} isDisabled={(activeLevel !== null && item.id !== activeLevel.id)} />
            }
         </Flex>
      </Flex>
   );
}

export default ActorLevel;