import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

// import { IActorLevel, IActorModel } from '@common/types/actor';
import {
    Button, Flex, FormDropdown, FormLabel, SaveIcon, TrashCanIcon
} from '@fluentui/react-northstar';

import { ISimpleUserModel } from '../../../common/types/user';
import { getEndorsementOptions } from '../../../common/utils/formVariables';
import GraphPeoplePicker from '../../../components/common/graphPeoplePicker/GraphPeoplePicker';
import { useAppDispatch } from '../../../store';
import { selectRequestId } from '../../requests/requestSlice';
import { IActorLevel, IActorModel } from '../actor';
import { actorLevelDeleted, actorLevelUpdated } from '../actorsSlice';

const EditActorLevel = (props: { lvlItem: IActorLevel }): JSX.Element => {
   const { t, i18n } = useTranslation();
   const { lvlItem } = props;
   const dispatch = useAppDispatch();

   const [usersState, setUsersState] = useState<Partial<IActorModel>[]>(lvlItem.actors);
   const [endorsementTypeState, setEndorsementTypeState] = useState(lvlItem.endorsementType);
   const [isValid, setIsValid] = useState(false);

   const requestId = useSelector(selectRequestId);

   useEffect(() => {
      if (usersState.length === 0 || !endorsementTypeState) return;
      const reqActors = usersState.filter(x => lvlItem.requiredPersonas.includes(x.personaType!));
      if (reqActors.length > 0 && endorsementTypeState !== 'new') {
         setIsValid(true);
         return;
      }
      setIsValid(false);
   }, [usersState, endorsementTypeState]);

   const removeUser = (_user?: ISimpleUserModel, _fieldId?: string) => {
      if (_user) return;
      let _newUsersState = [...usersState];
      _newUsersState = _newUsersState.filter(x => x.personaType !== _fieldId);
      setUsersState(_newUsersState);
   }

   const addUser = (_user?: ISimpleUserModel, _fieldId?: string) => {
      if (!_user) return;

      let _newUsersState = [...usersState].filter(x => x.personaType !== _fieldId);
      _newUsersState.push({
         requestId: requestId,
         userId: _user.id,
         upn: _user.upn,
         personaType: _fieldId,
         level: lvlItem.level,
         id: uuid(), //`${_user.id}-${lvlItem.level}-${_fieldId}-${requestId}`,
         title: _user.title,
         image: _user.image,
         endorsementType: endorsementTypeState
      });

      setUsersState(_newUsersState);
   }

   const handlePickerChange = (_user: ISimpleUserModel | ISimpleUserModel[], _fieldId?: string) => {
      if (!_fieldId || Array.isArray(_user)) return;
      removeUser(_user, _fieldId);
      addUser(_user, _fieldId);
   }

   const handleOnEndorsementChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      if (!_value) return;

      let _newUsersState = [...usersState].map(x => ({
         ...x,
         endorsementType: _value.key
      }));
      setUsersState(_newUsersState);
      setEndorsementTypeState(_value.key)
   }

   const handleOnSave = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      dispatch(actorLevelUpdated({ id: lvlItem.id, level: lvlItem.level, endorsementType: endorsementTypeState, actors: usersState as IActorModel[] }));
   }

   const handleOnDelete = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      dispatch(actorLevelDeleted({ id: lvlItem.id, level: lvlItem.level }));
   }

   return (
      <>

         <Flex gap="gap.smaller" column fill >
            <Row className="mmt-actorLevel-row-edit" xl={3} lg={3} md={3} sm={1}>
               <Col key={`col-form-endorsementType`} className={`mmt-endorsementType-col`}>
                  <FormDropdown
                     label={`${t('form.endorsementType.label')}`}
                     fluid
                     key={`dropdown-endorsement`}
                     items={getEndorsementOptions()}
                     placeholder={`${t('form.endorsementType.placeholder')}`}
                     defaultValue={getEndorsementOptions().find(x => x.key === endorsementTypeState)}
                     onChange={(event, { value }) => handleOnEndorsementChange(event, value)}
                  />
               </Col>
            </Row>
            <Row className="mmt-actorLevel-row-edit" xl={2} lg={2} md={2} sm={1}>
               {lvlItem.availablePersonas.map((x, i) =>
                  <Col key={`col-form-persona-${lvlItem.level}-${i}`} className={`mmt-persona-col`}>
                     <Flex column fill >
                        <FormLabel content={t(`personas.${x}`)} />
                        <GraphPeoplePicker
                           key={`searchUser-persona-${x}-${lvlItem.level}`}
                           defaultSelected={lvlItem.actors.find(y => y.personaType === x)}
                           onChange={handlePickerChange}
                           fieldId={`${x}`}
                        />
                     </Flex>
                  </Col>
               )}
            </Row>
         </Flex>
         <Flex vAlign="end" gap="gap.smaller">
            {/* <br /> */}
            {/* <Flex > */}
               <Button
                  icon={<SaveIcon size="large" />}
                  title={'Save'}
                  key={'save'}
                  iconOnly
                  text={!isValid}
                  circular={isValid}
                  primary={isValid}
                  disabled={!isValid}
                  onClick={(event) => handleOnSave(event)}
               />
               <Button
                  icon={<TrashCanIcon />}
                  title={'Delete'}
                  key={'delete'}
                  iconOnly
                  text
                  disabled={lvlItem.level === 1}
                  onClick={(event) => handleOnDelete(event)}
               />
            {/* </Flex> */}
         </Flex>
      </>
   );
}

export default EditActorLevel;