let currentUserUPN = '';
export const setCurrentUserUPN = (_upn: string) => {
   currentUserUPN = _upn;
}

export const getCurrentUserUPN = () => {
   return currentUserUPN;
}
