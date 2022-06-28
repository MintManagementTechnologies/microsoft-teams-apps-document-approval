import { IRequestModel } from 'features/requests/request';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// import { IRequestModel } from '@common/types/request';
import {
    Flex, Form, FormDropdown, FormInput, FormTextArea, PresenceAvailableIcon, Text
} from '@fluentui/react-northstar';

import { getClassificationOptions } from '../../../common/utils/formVariables';
import ActorLevelsList from '../../../features/actors/actorLevels/ActorLevelsList';
import Attachment from '../../../features/files/parts/Attachment';
import DocTemplate from '../../../features/files/parts/DocTemplate';
import {
    formStateChanged, formValidationChanged, itemChanged, requestUpdated
} from '../../../features/requests/requestSlice';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';

const NewForm = (props: {
   item: IRequestModel,
   crudOperation?: 'create' | 'details' | 'edit' | 'delete'
}): JSX.Element => {
   const { item, crudOperation } = props;
   const { t, i18n } = useTranslation();
   const dispatch = useAppDispatch();
   const [itemState, setRequestState] = useState(item);
   const formTitle = `${t('form.default.label')}`;

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   useEffect(() => {
      if (!itemState) return;
      const isValid = [itemState.title, itemState.classificationType, itemState.subject, itemState.description].every(Boolean);
      if (isValid) {
         const validItem = {
            ...itemState,
            createdById: currentUser.id,
            createdByUPN: currentUser.upn,
            createdByDisplayName: currentUser.title,
         }
         dispatch(itemChanged(validItem));
         dispatch(formStateChanged("creating"));
         dispatch(formValidationChanged(true));
      } else {
         dispatch(formValidationChanged(false));
      }
   }, [itemState, currentUser])

   const handleMultiInputChange = (event: any, keyValuePair: { field: string, value: any }[]) => {
      if (event !== null) event.preventDefault();

      let _item = { ...itemState };
      keyValuePair.forEach(x => {
         //@ts-ignore
         _item[x.field] = x.value;
      });
      setRequestState(_item);
   }

   const viewingOnly = crudOperation === 'details';
   const viewModeClass = viewingOnly ? 'mmt-viewingOnly' : '';
   return (
      <Flex gap="gap.medium" column fill className={`mmt-form-container`} padding="padding.medium">

         <Flex column fill gap="gap.small"
            className={`mmt-taskModule-body mmt-inputForm ${viewModeClass}`} >
            <Row className="mmt-form-row mmt-form-row-title" xl={1} lg={1} md={1} sm={1} >
               <Col>
                  <Text content={formTitle} weight={'semibold'} />
               </Col>
            </Row>
            <Row className="mmt-form-row" xl={2} lg={2} md={1} sm={1} >
               <Col key={`col-form-left`} className={`mmt-left-col`} xl={7} lg={7}>
                  <Row className="mmt-title-classification-row mx-lg-n5" xl={2} lg={2} md={2} sm={1}>
                     <Col key={`col-form-title`} className={`mmt-title-col`}>
                        <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-title`}>
                           <FormInput
                              label={`${t('form.docType.value.memo')} ${t('form.title.label')}`}
                              placeholder={t('form.title.placeholder')}
                              defaultValue={item.title}
                              onChange={
                                 (event, ctrl) => handleMultiInputChange(event, [
                                    { field: `title`, value: ctrl?.value || '' }
                                 ])
                              }
                              disabled={viewingOnly}
                              fluid
                              successIndicator={<PresenceAvailableIcon />}
                              required
                           />
                        </Flex>
                     </Col>
                     <Col key={`col-form-classification`} className={`mmt-classification-col`}>
                        <Flex gap="gap.small" column className={`mmt-inputGroup mmt-dropdown-classification`}>
                           <FormDropdown
                              label={`${t('form.docType.value.memo')} ${t('form.classification.label')}`}
                              fluid
                              key={`dropdown-classification`}
                              items={getClassificationOptions()}
                              defaultValue={getClassificationOptions().find(x => x.key === item.classificationType)}
                              onChange={
                                 (event, { value }) => handleMultiInputChange(event, [
                                    { field: `classificationType`, value: value ? (value as any).key : -1 }
                                 ])
                              }
                              placeholder={`${t('form.classification.placeholder')}`}
                              disabled={viewingOnly}
                           />
                        </Flex>
                     </Col>
                  </Row>
                  <Row className="mmt-subject-row gy-5" xl={1} lg={1} md={1} sm={1}>
                     <Col key={`col-form-subject`} className={`mmt-subject-col`}>
                        <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-subject`}>
                           <FormInput
                              label={`${t('form.docType.value.memo')} ${t('form.subject.label')}`}
                              placeholder={t('form.subject.placeholder')}
                              defaultValue={item.subject}
                              onChange={
                                 (event, ctrl) => handleMultiInputChange(event, [
                                    { field: `subject`, value: ctrl?.value || '' }
                                 ])
                              }
                              disabled={viewingOnly}
                              fluid
                              successIndicator={<PresenceAvailableIcon />}
                              required
                           />
                        </Flex>
                     </Col>
                  </Row>
                  <Row className="mmt-actorLevels-row" xl={1} lg={1} md={1} sm={1}>
                     <Col key={`col-form-actorLevels`} className={`mmt-actorLevels-col`}>
                        <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-actorLevels`}>
                           <ActorLevelsList displayMode='new' editPermissions='all' />
                        </Flex>
                     </Col>
                  </Row>
               </Col>
               <Col key={`col-form-right`} className={`mmt-right-col`} xl={5} lg={5}>
                  <Flex gap="gap.medium" column fill>
                     <Flex gap="gap.small" column className={`mmt-inputGroup mmt-textArea-description`}>
                        <FormTextArea
                           label={t('form.noteDescription.label')}
                           placeholder={t('form.noteDescription.placeholder')}
                           name="request-description"
                           fluid
                           className="mmt-textArea mmt-textArea-100"
                           defaultValue={item.description}
                           onChange={(event, ctrl) =>
                              handleMultiInputChange(event,
                                 [{ field: `description`, value: ctrl?.value || '' }])
                           }
                           disabled={viewingOnly}
                           required
                        />
                     </Flex>
                     <DocTemplate docType={'memo'} />
                     <Attachment maxAttachments={1} overrideAttachment canDelete requestId={item.id} isTemporary />
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-supportingDocsLink`}>
                        <FormInput
                           label={`${t('form.supportingDocsLink.label')}`}
                           placeholder={t('form.supportingDocsLink.placeholder')}
                           defaultValue={item.supportingDocsLink}
                           onChange={
                              (event, ctrl) => handleMultiInputChange(event, [
                                 { field: `supportingDocsLink`, value: ctrl?.value || '' }
                              ])
                           }
                           disabled={viewingOnly}
                           fluid
                           successIndicator={<PresenceAvailableIcon />}
                           required
                        />
                     </Flex>
                  </Flex>
               </Col>
            </Row>
            <Row className="mmt-inputGroup-row mmt-row-description" xl={1} lg={1} md={1} sm={1} >
            </Row>
         </Flex>
      </Flex>
   )
}

export default NewForm;