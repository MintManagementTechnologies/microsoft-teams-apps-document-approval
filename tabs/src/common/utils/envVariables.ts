export const tabBaseUrl = window.location.origin;
export const graphScope = process.env.REACT_APP_GRAPHSCOPE;
export const apiUrl = process.env.REACT_APP_API_URL; //"http://localhost:3978"; //
export const userTeamsAppId = process.env.REACT_APP_USER_TEAMSAPP_ID;
export const adminTeamsAppId = process.env.REACT_APP_ADMIN_TEAMSAPP_ID;
export const daysOverdueLimit = process.env.REACT_APP_DAYS_OVERDUE_LIMIT ? parseInt(process.env.REACT_APP_DAYS_OVERDUE_LIMIT) : 7;
export const domainFilter = process.env.REACT_APP_USER_DOMAIN_FILTER ? `$filter=endswith(mail,'${process.env.REACT_APP_USER_DOMAIN_FILTER}')&` : '';

export const verifyEnvConfig = () => {
   const daysOverdueLimitSet = daysOverdueLimit !== undefined && daysOverdueLimit !== null;
   const envIsValid = [graphScope, apiUrl, userTeamsAppId, adminTeamsAppId, ].every(Boolean) && daysOverdueLimitSet;
   if(!envIsValid) {
      console.error("Missing environment configuration!");
   }
   // return envIsValid;
}