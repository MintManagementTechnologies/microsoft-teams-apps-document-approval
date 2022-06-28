import i18n from './i18n';

export const getClassificationOptions = () => {
   return [
      { header: i18n.t('form.classification.value.none'), key: `none` },
      { header: i18n.t('form.classification.value.confidential'), key: `confidential` },
      { header: i18n.t('form.classification.value.secret'), key: `secret` },
      { header: i18n.t('form.classification.value.topSecret'), key: `topSecret` }
   ];
}

export const getEndorsementOptions = () => {
   return  [
      { header: i18n.t('form.endorsementType.value.recommender'), key: `recommender` },
      { header: i18n.t('form.endorsementType.value.supporter'), key: `supporter` },
      { header: i18n.t('form.endorsementType.value.approver'), key: `approver` }
   ];
}

export const getPersonaOptions = () => {
   return  [
      { header: i18n.t('form.personaType.value.dgsupport'), key: `dgsupport` },
      { header: i18n.t('form.personaType.value.approvalcustodian'), key: `approvalcustodian` }
   ];
}