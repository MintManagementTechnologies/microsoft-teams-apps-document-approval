import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Button, DownloadIcon, EyeFriendlierIcon, Flex, MoreIcon, Popup, TrashCanIcon
} from '@fluentui/react-northstar';

import { IBaseFile, ISharePointFile } from '../types';

const FileActionsPopup = (props: {
   actions: string[], // view, download, delete
   item: IBaseFile | ISharePointFile,
   onDeleteAction?: (id: string | number) => void;
}): JSX.Element => {
   const { actions, item } = props;
   const [open, setOpen] = useState(false);


   const { t, i18n } = useTranslation();
   const viewButton =
      <Button
         className={`mmt-contextual-btn mmt-link-btn ui-button view-${item.id}`}
         key={`view-contextual-${item.id}`}
         content={t("View")}
         icon={<EyeFriendlierIcon />}
         text
         as={"a"}
         href={item.viewUrl}
         target="_blank"
      />

   // TODO: Add Download action
   const downloadButton =
      <Button
         className={`mmt-contextual-btn mmt-link-btn ui-button download-${item.id}`}
         key={`download-contextual-${item.id}`}
         content={t("Download")}
         icon={<DownloadIcon />}
         text
         as={"a"}
         href={(item as ISharePointFile).downloadUrl}
         target="_blank"
         download
      />

   const deleteButton =
      <Button
         as={"a"}
         className={`mmt-contextual-btn mmt-link-btn ui-button delete-${item.id}`}
         key={`attachment-contextual-${item.id}`}
         content={"Delete"}
         icon={<TrashCanIcon />}
         text
         onClick={(event) => {
            props.onDeleteAction!(item.id);
         }}
      />

   const availableActions = actions.map(x => {
      if (x === 'view') return viewButton
      if (x === 'download') return downloadButton
      if (x === 'delete') return deleteButton
   })

   const handleOnOpen = (_event: any, _isOpen: boolean) => {
      if (_event !== null) _event.preventDefault();
      setOpen(_isOpen);
      // dispatch(itemChanged(_isOpen ? item : newGoal));
   }

   return (
      <Popup
         on="focus"
         key={`itemActions-popup-${item.id}`}
         content={
            <Flex column key={`itemActions-content-${item.id}`} hAlign="start">
               {availableActions}
            </Flex>
         }
         position={'below'}
         trigger={<Button icon={<MoreIcon />} text iconOnly title="More" />}
         onOpenChange={(e, { open }: any) => handleOnOpen(e, open)}
         open={open}
      />
   );
};

export default FileActionsPopup;
