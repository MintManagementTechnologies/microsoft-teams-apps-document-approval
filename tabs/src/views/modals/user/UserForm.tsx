import './UserForm.scss';

import { primitiveArraysAreEqual } from 'common/utils/helpers/arrayHelpers';
import UserPill from 'components/common/userPill/UserPill';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { Button, Flex, FormDropdown, FormLabel, Pill, Segment } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import { ISimpleUserModel, IUserModel } from '../../../common/types/user';
import { getPersonaOptions } from '../../../common/utils/formVariables';
import GraphPeoplePicker from '../../../components/common/graphPeoplePicker/GraphPeoplePicker';

const UserForm = (props: {
   item: IUserModel,
   action: 'edit' | 'new' | 'delete',
   onSubmit: (users: IUserModel[], personaTypes: string[], _extraOptions?: any) => void
}): JSX.Element => {
   const { item, action } = props;
   const personaTypes = item.personaTypes || [];
   const { t } = useTranslation();
   const [userState, setUserState] = useState<IUserModel[]>(action === 'new' ? [] : [item]);
   const [personaTypeState, setPersonaTypeState] = useState<string[]>(personaTypes);

   const handlePickerChange = (_users: ISimpleUserModel | ISimpleUserModel[], _fieldId?: string) => {
      //if (Array.isArray(_user)) return;
      if (!Array.isArray(_users)) return;
      let _selectedUsers: IUserModel[] = [];
      _users.forEach(x => {
         let existingUser = userState.find(y => y.upn === x.upn);
         if (!existingUser)
            _selectedUsers.push(x as IUserModel);
         else
            _selectedUsers.push(existingUser);

      });
      setUserState(_selectedUsers as IUserModel[]);
   }

   const handleOnPersonaChange = (_event: any, _value: any[]) => {
      if (_event !== null) _event.preventDefault();
      if (!_value) setPersonaTypeState([]);
      setPersonaTypeState(_value.map(x => x.key));
   }

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      // if(!userState) return;
      props.onSubmit(userState, personaTypeState);
      // microsoftTeams.tasks.submitTask("refresh");
   }

   const personaTypesChanged = action === 'new' || !primitiveArraysAreEqual(personaTypeState, personaTypes)
   const isValid = (personaTypeState.length > 0 && userState && userState.length > 0 && personaTypesChanged) || action === 'delete';
   const buttonAction = action === 'new' ? 'save' : action === 'edit' ? 'update' : action;
   return (
      <Flex column fill padding="padding.medium">
         <Row className="mmt-form-user" xl={2} lg={2} md={2} sm={2}>
            <Col key={`col-form-user-picker`} className={`mmt-user-col`}  >
               <Flex column fill >
                  <FormLabel content={t(`form.user.label`)} />
                  {action === 'new' ?
                     <GraphPeoplePicker
                        multiple
                        key={`admin-searchUser`}
                        onChange={handlePickerChange}
                        fieldId={``}
                     /> :
                     <UserPill title={item.title} image={item.image} userId={item.id} disabled size="small" />
                  }
               </Flex>
            </Col>
            <Col key={`col-form-persona-picker`} className={`mmt-persona-col`} >
               {action === 'delete' ?
                  <Flex column fill >
                     <FormLabel content={`${t(`form.personaType.label`)}`} />
                     {getPersonaOptions().filter(x => personaTypeState.includes(x.key)).map(x =>
                        <Pill className="mmt-userPill" disabled key={x.key}> {t(`form.personaType.value.${x.key}`)} </Pill>
                     )}
                  </Flex>
                  :
                  <FormDropdown
                     label={`${t(`form.personaType.label`)}`}
                     fluid
                     className='mmt-field-persona'
                     key={`dropdown-personaType`}
                     items={getPersonaOptions()}
                     placeholder={`${t('form.personaType.placeholder')}`}
                     defaultValue={getPersonaOptions().filter(x => personaTypeState.includes(x.key))}
                     onChange={(event, { value }) => handleOnPersonaChange(event, value as any[])}
                     multiple
                  />
               }
            </Col>
         </Row>
         <Segment className={"mmt-footer-container"}>
            <Flex fill hAlign="end" gap="gap.small">
               <Button
                  content={t('common:button.cancel')}
                  onClick={() => microsoftTeams.tasks.submitTask("cancel")}
               />
               <Button
                  content={t(`common:button.${buttonAction}`)}
                  primary
                  onClick={(event) => handleOnSubmit(event)}
                  disabled={!isValid}
               />
            </Flex>
         </Segment>
      </Flex>
   );
}

export default UserForm;