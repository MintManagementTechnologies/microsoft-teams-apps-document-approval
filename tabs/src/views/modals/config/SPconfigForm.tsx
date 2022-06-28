import Loader from 'components/common/Loader';
import {
    useCreateSiteConfigMutation, useGetAllMySitesQuery, useGetSiteConfigQuery,
    useLazyGetDriveFoldersQuery, useLazyGetSiteDrivesQuery, useSearchMySitesQuery
} from 'features/config/configService';
import { ISiteConfigModel, ISiteModel } from 'features/config/types';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import {
    Button, Dropdown, Flex, FormLabel, Input, Loader as FluentLoader, Segment
} from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

const SPconfigForm = (props: { docType: string }): JSX.Element => {
   const { docType } = props;
   const { t } = useTranslation();
   const [siteState, setSiteState] = useState<ISiteModel>();
   // const [siteFolderState, setSiteFolderState] = useState<ISiteFolderModel>();
   // const [docLibName, setDocLibName] = useState('');
   const [siteOptions, setSiteOptions] = useState<{ header: string, key: string }[]>([]);
   const [docLibOptions, setDocLibOptions] = useState<{ header: string, key: string }[]>([]);
   const [driveName, setDriveName] = useState('');
   const [driveId, setDriveId] = useState('');
   const [folderName, setFolderName] = useState('');
   const [folderId, setFolderId] = useState('');
   const [folderOptions, setFolderOptions] = useState<{ header: string, key: string }[]>([]);
   const [searchQuery, setSearchQuery] = useState(siteState?.title);
   const { data: dataGetSiteConfig, isLoading: isLoadingGetSiteConfig, isFetching: isFetchingGetSiteConfig } = useGetSiteConfigQuery(props.docType || skipToken);
   // const { data: dataGetAllMySites, isLoading: isLoadingGetAllMySites, isFetching: isFetchingGetAllMySites } = useGetAllMySitesQuery();
   const { data: dataGetAllMySites, isLoading: isLoadingGetAllMySites, isFetching: isFetchingGetAllMySites } = useSearchMySitesQuery(searchQuery || '');
   const [triggerGetSiteDrives, { isLoading: isLoadingGetSiteDrives, isFetching: isFetchingGetSiteDrives, isError: isErrorGetSiteDrives }] = useLazyGetSiteDrivesQuery();
   const [triggerGetDriveFolders, { isLoading: isLoadingGetDriveFolders, isFetching: isFetchingGetDriveFolders, isError: isErrorGetDriveFolders }] = useLazyGetDriveFoldersQuery();
   const [createSiteConfig, { isLoading: isLoadingCreateSPconfig, isError: isErrorCreateSPconfig }] = useCreateSiteConfigMutation();
   let allSite: ISiteModel[] = dataGetAllMySites || [];
   const siteDropdownOptions = allSite.map(x => ({ header: x.title, key: x.siteId }));

   useEffect(() => {
      if (!(dataGetSiteConfig && dataGetAllMySites)) return;
      const selectedSite = dataGetAllMySites.find(x => x.siteId === dataGetSiteConfig.siteId);
      if (!selectedSite) return;
      setSiteState(selectedSite);
      setDriveName(dataGetSiteConfig.docLibName);
      setDriveId(dataGetSiteConfig.driveId);
      setFolderName(dataGetSiteConfig.templateFolderName);
      setFolderId(dataGetSiteConfig.docLibId);
   }, [dataGetSiteConfig, dataGetAllMySites]);

   useEffect(() => {
      if (!dataGetAllMySites || isLoadingGetSiteConfig) return;
      setSiteOptions(dataGetAllMySites.map(x => ({ header: x.title, key: x.siteId })));
   }, [dataGetAllMySites, isLoadingGetSiteConfig]);

   useEffect(() => {
      if (!siteState) return;
      triggerGetSiteDrives(siteState.siteId).unwrap().then((result) => {
         setDocLibOptions(result.map(x => ({ header: x.name, key: x.id })));
      });
   }, [siteState]);

   useEffect(() => {
      if (!driveId) return;
      triggerGetDriveFolders(driveId).unwrap().then((result) => {
         setFolderOptions(result.map(x => ({ header: x.name, key: x.id })));
      })
   }, [driveId]);

   useEffect(() => {
      if (!folderId) return;
      // triggerGetDriveFolders(driveId).unwrap().then((result) => {
      //    setFolderOptions(result.map(x => ({ header: x.name, key: x.id })));
      // })
   }, [folderId]);

   const handleOnSearchQuery = (searchText: string) => {
      if (searchText.length > 1) {
         //@ts-ignore
         setSearchQuery(searchText || '');
      }
   }

   const handleSiteChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      setDocLibOptions([]);
      setFolderOptions([]);
      setDriveId('');
      setFolderId('');
      if (!_value) {
         setSiteState(undefined);
         return;
      }
      const selectedSite = allSite.find(x => x.siteId === _value.key);
      if (!selectedSite) return;
      setSiteState(selectedSite);
   }

   const handleDocLibChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      if (!_value) {
         setDriveId('');
         setDriveName('');
         return;
      }
      setFolderOptions([]);
      setFolderId('');
      setDriveId(_value ? _value.key : undefined);
      setDriveName(_value ? _value.header : undefined);
   }

   const handleFolderChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      if (!_value) {
         setFolderId('');
         setFolderName('');
         return;
      }
      setFolderId(_value ? _value.key : undefined);
      setFolderName(_value ? _value.header : undefined);
   }

   const handleOnSubmit = async (_event: any) => {
      if (_event !== null) _event.preventDefault();
      if (!siteState) return;
      const spConfig: ISiteConfigModel = {
         id: docType,
         configType: 'spSiteConfig',
         driveId: driveId,
         docLibName: driveName,
         docLibId: folderId,
         templateFolderName: folderName,
         title: siteState.title,
         siteId: siteState.siteId,
         domainName: siteState.domainName,
         url: siteState.url
      }
      await createSiteConfig(spConfig);
   }

   // const isLoading = isFetchingGetAllMySites || isLoadingGetAllMySites || isLoadingCreateSPconfig || isFetchingGetSiteConfig || isLoadingGetSiteConfig;
   const isLoading = isLoadingCreateSPconfig || isFetchingGetSiteConfig || isLoadingGetSiteConfig;
   const isLoadingDocLibs = isLoadingGetSiteDrives || isFetchingGetSiteDrives;
   const isLoadingFolders = isLoadingGetDriveFolders || isFetchingGetDriveFolders;
   return (
      <Flex gap="gap.medium" column fill className={`mmt-form-container`} padding="padding.medium">
         <Flex className={`mmt-taskModule-body`} >
            {isLoading ? <Loader message={t('common:entity.config')} /> :
               <Flex column fill>
                  <Row className="mmt-form-spConfig">
                     <Col key={`col-form-spSite-picker`} className={`mmt-spSite-col`}  >
                        <Flex column fill className={`mmt-inputGroup mmt-dropdown-spSite`}>
                           <FormLabel content={`SharePoint Site`} />
                           {/* {(siteOptions.length > 0) && */}
                           <Dropdown
                              loading={isFetchingGetAllMySites}
                              loadingMessage={t('common:loading', { entity: 'sites' })}
                              placeholder={`SharePoint Site`}
                              items={siteOptions}
                              defaultValue={siteOptions.find(x => x.key === siteState?.siteId)}
                              defaultSearchQuery={siteState?.title}
                              onSearchQueryChange={(event, { searchQuery }) => { handleOnSearchQuery(searchQuery || '') }}
                              onChange={(event, { value }) => handleSiteChange(event, value)}
                              fluid
                              search
                           />
                           {/* } */}
                        </Flex>
                     </Col>
                  </Row>
                  <Row className="mmt-form-docLib">
                     <Col key={`col-form-docLib`} className={`mmt-docLib-col`} >
                        <Flex column fill className={`mmt-inputGroup mmt-input-docLibName`}>
                           <FormLabel content={`Document Library`} />
                           {isLoadingDocLibs && <FluentLoader />}
                           {(docLibOptions.length > 0) ?
                              <Dropdown
                                 loading={isLoadingGetSiteDrives}
                                 disabled={!siteState}
                                 onChange={(event, { value }) => handleDocLibChange(event, value)}
                                 placeholder={`Select...`}
                                 items={docLibOptions}
                                 defaultValue={docLibOptions.find(x => x.key === driveId)}
                                 fluid
                              />
                              :
                              <>{!isLoadingDocLibs && <Input fluid disabled value={'No document libraries found.'} />}</>
                           }
                        </Flex>
                     </Col>
                  </Row>
                  <Row className="mmt-form-docLib">
                     <Col key={`col-form-docLib`} className={`mmt-docLib-col`} >
                        <Flex column fill className={`mmt-inputGroup mmt-input-docLibName`}>
                           <FormLabel content={`Teamplates Folder`} />
                           {isLoadingFolders && <FluentLoader />}
                           {(folderOptions.length > 0) ?
                              <Dropdown
                                 loading={isLoadingGetDriveFolders}
                                 disabled={!driveId || !siteState}
                                 onChange={(event, { value }) => handleFolderChange(event, value)}
                                 placeholder={`Select...`}
                                 items={folderOptions}
                                 defaultValue={folderOptions.find(x => x.key === folderId)}
                                 fluid
                              />
                              :
                              <>{!isLoadingFolders && <Input fluid disabled value={'No folders found.'} />}</>
                           }
                        </Flex>
                     </Col>
                  </Row>
                  {/* <Row className="mmt-form-docLib">
                     <Col key={`col-form-docLib`} className={`mmt-docLib-col`} >
                        <Flex column fill className={`mmt-inputGroup mmt-input-docLibName`}>
                           {dataGetSiteConfig &&
                              <Text content={'SharePoint already configured.'} error weight="semibold" />
                           }
                        </Flex>
                     </Col>
                  </Row> */}
                  <Segment className={"mmt-footer-container"}>
                     <Flex fill hAlign="end" gap="gap.small">
                        <Button
                           content={t('common:button.cancel')}
                           onClick={() => microsoftTeams.tasks.submitTask("cancel")}
                        />
                        <Button
                           content={t(`common:button.save`)}
                           primary
                           onClick={(event) => handleOnSubmit(event)}
                           disabled={!(folderId && driveId && siteState)}
                        />
                     </Flex>
                  </Segment>
               </Flex>
            }
         </Flex>
      </Flex>
   );
}

export default SPconfigForm;