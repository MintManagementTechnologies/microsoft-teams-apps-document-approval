import './ActorLevel.scss';

import { useTranslation } from 'react-i18next';

// import { IActorLevel, IActorModel } from '@common/types/actor';
import { Button, EditIcon, Flex, PillGroup, Text, TrashCanIcon } from '@fluentui/react-northstar';

import UserPill from '../../../components/common/userPill/UserPill';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import { IActorLevel, IActorModel } from '../actor';
import { activeLevelSelected, actorLevelDeleted } from '../actorsSlice';

const ViewActorLevel = (props: { lvlItem: IActorLevel, isLocked: boolean, isDisabled: boolean }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { lvlItem, isLocked, isDisabled } = props;
   const dispatch = useAppDispatch();
   const allLevels = useTypedSelector((state: RootState) => state.actors.actorLevels);

   const handleOnEdit = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      dispatch(activeLevelSelected({ id: lvlItem.id, level: lvlItem.level }));
   }

   const handleOnDelete = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      dispatch(actorLevelDeleted({ id: lvlItem.id, level: lvlItem.level }));
   }

   return (
      <>
         <Flex gap='gap.small' vAlign='center' className={`mmt-actorLevel-box-view`} padding="padding.medium" fill>
            <Text content={t(`form.endorsementType.value.${lvlItem.endorsementType}`)} />
            <PillGroup>
               {lvlItem.actors.map((x: IActorModel, i: number) => (
                  <UserPill key={`pill-${x.id}-${i}`} title={x.title} image={x.image} userId={x.upn} disabled size="small" />
                  // <Pill className="mmt-userPill" key={`pill-${x.id}-${i}`} image={`${x.image || defaultAvatar}`} size="small">
                  //    {x.title}
                  // </Pill>
               ))}
            </PillGroup>
         </Flex>
         <Flex gap='gap.small' vAlign='center' >
            {!isLocked &&
               <>
                  <Button
                     icon={<EditIcon />}
                     title={'Edit'}
                     key={'edit'}
                     iconOnly
                     text
                     onClick={(event) => handleOnEdit(event)}
                     disabled={isDisabled}
                  />
                  <Button
                     icon={<TrashCanIcon />}
                     title={'Delete'}
                     key={'delete'}
                     iconOnly
                     text
                     onClick={(event) => handleOnDelete(event)}
                     disabled={isDisabled || allLevels.length === 1}
                  />
               </>
            }
         </Flex>
      </>
   );
}

export default ViewActorLevel;