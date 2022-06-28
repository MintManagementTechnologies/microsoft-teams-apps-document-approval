import './CommentsLog.scss';

import { distinct } from 'common/utils/helpers/arrayHelpers';
import { formatRelative } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

// import { distinct } from '~helpers/arrayHelpers';
// import { upperFirstLetter } from '~helpers/stringHelpers';
import {
    Avatar, Button, Chat, ChatItem, ChatMessage, Flex, Input, Loader, SendIcon, Text
} from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import { ICommentModel } from '../../common/types/comment';
import { stringToHslColor } from '../../common/utils/sharedFunctions';
import MintLoader from '../../components/common/Loader';
import { graphApiService, useGetUserQuery } from '../../services/graphApiService';
import { RootState, useTypedSelector } from '../../store';
import { useCreateCommentMutation, useGetManyCommentsQuery } from './commentService';

const CommentsLog = (props: { requestId: string, disabled?: boolean }): JSX.Element => {
   const { requestId, disabled } = props;
   const { t, i18n } = useTranslation();

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const { data: dataGetUser } = useGetUserQuery(currentUser ? currentUser.upn : skipToken);


   const { data: dataGetManyComments, isLoading: isLoadingGetManyComments, isFetching: isFetchingGetManyComments } = useGetManyCommentsQuery(requestId);
   const allComments = dataGetManyComments || [];

   const [createComment, { isLoading: isLoadingCreateComment }] = useCreateCommentMutation();

   const [trigger, result, lastPromiseInfo] = graphApiService.useLazyGetManyUsersQuery();
   const allCommentUsers = result.data || [];

   const [comment, setComment] = useState('');

   const lastMsgRef = useRef(null);
   const scrollToBottom = () => {
      (lastMsgRef as any).current?.scrollIntoView({ behavior: "smooth" });
   }

   useEffect(() => {
      if (!(dataGetManyComments && lastMsgRef.current)) return;
      (lastMsgRef as any).current?.scrollIntoView({ behavior: "smooth" });

      const newUserUPNs = dataGetManyComments.map(x => x.upn).filter(distinct).sort();
      const prevUserUPNs = Array.isArray(lastPromiseInfo.lastArg) ? lastPromiseInfo.lastArg : [];
      if (newUserUPNs.length === prevUserUPNs.length) {
         console.log('not reloading');
         return;
      }

      trigger(newUserUPNs);
      console.warn('testingReloads');
   }, [dataGetManyComments, lastMsgRef]);

   const handleOnCommentAdd = async (_event: any) => {
      if (_event !== null) _event.preventDefault();
      let defaultComment: ICommentModel = {
         requestId: requestId,
         upn: currentUser.upn,
         comment: comment,
         version: 0,
         id: uuid(),
         title: dataGetUser?.title || 'test',
         createdTimestamp: new Date().getTime(),
         modifiedTimestamp: new Date().getTime(),
         active: false
      }
      await createComment(defaultComment);
      setComment('');
   }

   const handleOnCommentEnter = async (_event: any) => {
      if (_event.key === 'Enter' || _event.charCode === 13) {
         handleOnCommentAdd(_event);
      }
   }

   const handleOnCommentChange = async (_event: any, _value: string = '') => {
      if (_event !== null) _event.preventDefault();
      setComment(_value);
   }

   const isLoadingUsers = result.isFetching || result.isLoading; //isFetchingGetManyUsers || isLoadingGetManyUsers;
   const isLoadingComments = isFetchingGetManyComments || isLoadingGetManyComments;
   const displayMode = 'edit' //: 'view';
   return (
      <Flex column gap="gap.smaller" fill space={'around'}>
         <Flex gap="gap.small" >
            <Text content={t('form.comments.label')} className={'ui-form__label'} />
            <Text content={t('form.comments.message')} color="orange" />
         </Flex>
         <Flex fill
            className={'mmt-chatLog-container'}>
            <>
               {isLoadingComments && <MintLoader message={t('common:entity.comment', { count: 0 })} />}
               {dataGetManyComments && dataGetManyComments.length > 0 ?
                  <Chat density="compact"
                     className={'mmt-chatLog'}
                  >
                     {dataGetManyComments.map((x, i, arr) =>
                        <ChatItem
                           ref={i + 1 === arr.length ? lastMsgRef : undefined}
                           className={'mmt-chatLog-item'}
                           key={`chatItem-${i}`}
                           gutter={
                              isLoadingUsers ? <Loader size={"smallest"} /> :
                                 <Avatar name={x.title} size={'smaller'}
                                    image={allCommentUsers?.find(y => y.upn === x.upn)?.image || undefined}
                                    label={{
                                       styles: {
                                          color: stringToHslColor(x.title).color,
                                          backgroundColor: stringToHslColor(x.title).backgroundColor,
                                       },
                                    }}
                                 />
                           }
                           message={
                              <ChatMessage
                                 className={'mmt-chatLog-msg'}
                                 content={x.comment}
                                 header={
                                    <Flex gap="gap.medium" vAlign="center">
                                       <Text color={x.upn === currentUser.upn ? 'brand' : 'none'} content={x.title} weight='semibold' />
                                       <Text timestamp content={(formatRelative(new Date(x.createdTimestamp), new Date())).upperFirstLetter()} size='small' />
                                    </Flex>
                                 }
                                 mine={x.upn === currentUser.upn}
                              />
                           }
                        />
                     )}
                  </Chat>
                  : <Flex fill vAlign="center" hAlign="center" className={'mmt-empty-container'}>
                     <Text content={t('common:error.noItems', { entity: t('common:entity.comment', { count: 0 }) })} />
                  </Flex>
               }
            </>
         </Flex>
         <Flex gap="gap.small" className={'mmt-comments-inputGroup'} >
            <Flex.Item grow>
               <Input fluid
                  placeholder={t('form.comments.placeholder')}
                  onKeyPress={(event) => handleOnCommentEnter(event)}
                  onChange={(event, ctrl) => handleOnCommentChange(event, ctrl?.value)}
                  value={comment}
                  disabled={disabled}
               />
            </Flex.Item>
            <Flex.Item align="center">
               <Button icon={<SendIcon />} size="small" primary text content={t('common:button.send')}  className={'mmt-comments-sendBtn'}
                  onClick={(event) => handleOnCommentAdd(event)}
                  disabled={comment.length < 2 || disabled}
                  loading={isLoadingCreateComment}
               />
            </Flex.Item>
         </Flex>
      </Flex>
   );
}

export default CommentsLog;