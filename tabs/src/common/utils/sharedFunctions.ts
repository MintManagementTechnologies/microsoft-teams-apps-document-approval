interface IAvatarIconColors {
   backgroundColor: string;
   color: string;
}

export const getDashboardView = (): string => {
   const params = new URLSearchParams(window.location.hash);
   const dashboard = params.get("dashboard") || "approvals";
   return dashboard;
};

export const stringToHslColor = (userIdentifier: string): IAvatarIconColors => {
   var hash = 0;
   for (var i = 0; i < userIdentifier.length; i++) {
      hash = userIdentifier.charCodeAt(i) + ((hash << 5) - hash);
   }

   var h = hash % 360;
   var l = 80;
   var s = 30
   return {
      backgroundColor: 'hsl(' + h + ', ' + s + '%, ' + l + '%)',
      color: l > 70 ? '#555' : '#fff'
   }
}