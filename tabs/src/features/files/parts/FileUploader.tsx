import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
    Alert, Button, ExclamationTriangleIcon, Flex, Input, PaperclipIcon
} from '@fluentui/react-northstar';

export type FileUploaderProps = {
   onChange: (file: File) => void;
   maxAllowedSize: number;
   isDisabled: boolean;
   label: string;
}

const FileUploader = (props: FileUploaderProps): JSX.Element => {
   const { t, i18n } = useTranslation();
   const [error, setError] = React.useState({
      show: false,
      message: ''
   });
   const inputKey = Math.random().toString(36);
   const inputImageKey = Math.random().toString(36);

   const onFileChange = (event: any) => {
      //const files: HTMLInputElement["files"] = event.target.files;

      const maxAllowedSize = props.maxAllowedSize * 1024 * 1024;

      if (event.target.files === null || event.target.files.length === 0) {
         return;
      }
      if(!event.target.files[0].name.endsWith(".pdf")){
         setError({
            show: true,
            message: `Only PDF files are allowed.`
         });
         return;
      }
      if (event.target.files[0].size > maxAllowedSize) {
         setError({
            show: true,
            message: `Max file size exceeded. Maximum size is ${props.maxAllowedSize}MB`
         });
         return;
      } else {
         props.onChange(event.target.files[0]);
      };
   }

   const onErrorDismiss = () => {
      setError({
         show: false,
         message: ''
      });
   }

   return (
      <Flex column>
         {error.show && <Alert icon={<ExclamationTriangleIcon />} className="mmt-errorMessage" danger content={error.message} dismissible
            onVisibleChange={onErrorDismiss}
            dismissAction={{ 'aria-label': 'close', }}
            visible={error.show}
         />}
         {!error.show &&
            <>
               <Input
                  className="mmt-fileUploader-input"
                  type="file"
                  name={`mmt-fileUploader-${inputKey}`}
                  id={`mmt-fileUploader-${inputKey}`}
                  accept="application/pdf"
                  key={inputKey}
                  onAbort={onFileChange}
                  onAbortCapture={onFileChange}
                  onChange={onFileChange}
                  autoComplete="off"
                  disabled={props.isDisabled}
               />
               <Button disabled={props.isDisabled} as={"label"} text primary content={t(props.label)} icon={<PaperclipIcon />} htmlFor={`mmt-fileUploader-${inputKey}`} className={`mmt-fileUploader-label ${props.isDisabled ? 'mmt-disabled-label' : ''}`} />
            </>
         }
      </Flex>
   );
}

export default FileUploader;