import './Request.scss';

import { daysOverdueLimit } from 'common/utils/envVariables';
import { differenceInDays, formatDistance } from 'date-fns';
import { IRequestModel } from 'features/requests/request';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// import { IRequestModel } from '@common/types/request';
import {
    Alert, Button, ExclamationCircleIcon, Flex, Form, FormTextArea, Text
} from '@fluentui/react-northstar';

import ActorActionsLog from '../../../features/actors/actionsLog/ActorActionsLog';
import CommentsLog from '../../../features/comments/CommentsLog';
import Attachment from '../../../features/files/parts/Attachment';
import DocTemplate from '../../../features/files/parts/DocTemplate';
import { RootState, useTypedSelector } from '../../../store';

const EditForm = (props: {
   item: IRequestModel,
   permissions: {
      editActors: string | boolean, // incomplete | all | false
      editAttachments: boolean,
      viewTemplate: boolean,
      addComments: boolean,
   },
   action: 'edit' | 'approve' | 'view'
}): JSX.Element => {
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const { item, action, permissions } = props;

   const getOverdueMessage = (_createdTimestamp: number, _modifiedTimestamp: number) => {
      const createdDays = formatDistance(_createdTimestamp, new Date(), { addSuffix: true });

      // let nowDate = new Date().toDateString();
      // let modifiedDate = new Date(_modifiedTimestamp).toDateString();
      // const lastModifiedDays = differenceInDays(new Date(nowDate), new Date(modifiedDate));
      // const lastModified = formatDistance(new Date(_modifiedTimestamp), new Date(), { addSuffix: true });
      let nowDate = new Date().getTime();
      let modifiedDate = _modifiedTimestamp;
      const lastModifiedDays = differenceInDays(nowDate, modifiedDate);
      const overdueDays = lastModifiedDays - daysOverdueLimit;
      const overdueMessage = overdueDays > 0 ? ` ${t('message.overdueSuffix', { overdueDays: overdueDays })}` : '.';
      return `${t('message.created', { docType: 'memo', createdDays: createdDays })}${overdueMessage}`;
   }

   const getCompleteMessage = (_modifiedTimestamp: number, _outcome: string) => {
      const lastModified = formatDistance(_modifiedTimestamp, new Date(), { addSuffix: true });
      return `${t('message.complete', { docType: 'memo', outcome: _outcome, completeDays: lastModified })}`;
   }

   const handleOnEditActorsView = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      if (_event.keyCode == 13) return;
      navigate(`/me/memo/editactors/${item.id}`);
   }


   const formTitle = `${t('common:header.refNumber')} ${item.refNumber} - ${item.title} | ${t('form.classification.label')} - ${t(`form.classification.value.${item.classificationType}`)}`;
   const viewModeClass = 'mmt-viewingOnly';
   return (
      <Flex gap="gap.medium" column fill className={`mmt-form-container`} padding="padding.medium">
         <Flex column fill gap="gap.small"
            className={`mmt-taskModule-body mmt-inputForm ${viewModeClass}`} >
            <Row className="mmt-form-row mmt-form-row-title" xl={1} lg={1} md={1} sm={1} >
               <Col>
                  <Text content={formTitle} weight={'semibold'} size="large" />
               </Col>
            </Row>
            <Row className="mmt-form-row" xl={2} lg={2} md={1} sm={1} >
               <Col key={`col-form-left`} className={`mmt-left-col`} xl={7} lg={7}>
                  <Flex gap="gap.medium" column fill className={`mmt-leftPanel`}>
                     <Flex gap="gap.small" className={`mmt-actorActionsLog-container`}>
                        <ActorActionsLog requestId={item.id} requestVersion={item.version} />
                        {permissions.editActors &&
                           <Flex vAlign='end' hAlign='start'>
                              <Button content={t('common:button.change', { entity: 'Actors' })}
                                 onClick={(event) => handleOnEditActorsView(event)}
                                 className="mmt-actorActions-btn"
                                 tinted
                              />
                           </Flex>
                        }
                     </Flex>
                     {item.status === 'complete' &&
                        <Alert warning content={getCompleteMessage(item.modifiedTimestamp, item.outcome)} icon={<ExclamationCircleIcon outline />} className={`mmt-message`} />}
                     {item.status !== 'complete' &&
                        <Alert warning content={getOverdueMessage(item.createdTimestamp, item.modifiedTimestamp)} icon={<ExclamationCircleIcon outline />} className={`mmt-message`} />}

                     <CommentsLog requestId={item.id} disabled={!permissions.addComments} />
                  </Flex>
               </Col>
               <Col key={`col-form-right`} className={`mmt-right-col`} xl={5} lg={5}>
                  <Flex gap="gap.small" column fill>
                     <Flex gap="gap.small" column className={`mmt-inputGroup mmt-textArea-description`} >
                        <FormTextArea
                           label={t('form.noteDescription.label')}
                           placeholder={t('form.noteDescription.placeholder')}
                           name="request-description"
                           fluid
                           className="mmt-textArea mmt-textArea-150"
                           value={item.description}
                           disabled
                        />
                     </Flex>
                     {permissions.viewTemplate && <DocTemplate docType={'memo'} />}
                     <Attachment maxAttachments={permissions.editAttachments ? 1 : 0} overrideAttachment requestId={item.id} disabled={!permissions.editAttachments} />
                     {item.outcome === 'approved' &&
                        <>
                           <Alert content={t('message.docMoved')} icon={<ExclamationCircleIcon outline />} className={`mmt-message`} />
                        </>
                     }
                     <Flex gap="gap.small" column fill className={`mmt-inputGroup mmt-input-supportingDocsLink`}>
                        <Text content={`${t('form.supportingDocsLink.label')}`} weight="semibold" />
                        <Text as={"a"} target="_blank" href={item.supportingDocsLink} content={item.supportingDocsLink} />
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

export default EditForm;