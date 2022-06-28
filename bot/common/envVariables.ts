export const tenantId = process.env.M365_TENANT_ID;
export const botId = process.env.BOT_ID;
export const botPassword = process.env.BOT_PASSWORD;
export const clientId = process.env.M365_CLIENT_ID;
export const clientSecret = process.env.M365_CLIENT_SECRET;

export const storageAccount_name = process.env.STORAGE_ACCOUNT_NAME;
export const storageAccount_key = process.env.STORAGE_ACCOUNT_KEY;
export const storageAccount_connectionString = process.env.STORAGE_ACCOUNT_CONNECTION_STRING;
export const storageAccount_containerName = process.env.STORAGE_ACCOUNT_CONTAINER_NAME;
export const storageAccount_tmpFolderName = process.env.STORAGE_ACCOUNT_TMPFOLDER_NAME;

export const tabBaseUrl = process.env.TAB_BASE_URL;
export const graphScope = process.env.GRAPHSCOPE;
export const apiUrl = process.env.API_URL;
export const userTeamsAppId = process.env.USER_TEAMSAPP_ID;
export const adminTeamsAppId = process.env.ADMIN_TEAMSAPP_ID;
export const daysOverdueLimit = process.env.DAYS_OVERDUE_LIMIT ? parseInt(process.env.DAYS_OVERDUE_LIMIT) : 7;

export const verifyEnvConfig = () => {
   const daysOverdueLimitSet = daysOverdueLimit !== undefined && daysOverdueLimit !== null;
   const envIsValid = [graphScope, apiUrl, userTeamsAppId, adminTeamsAppId, ].every(Boolean) && daysOverdueLimitSet;
   if(!envIsValid) {
      console.error("Missing environment configuration!");
   }
   // return envIsValid;
}