import { createContext } from 'react';

import { ThemePrepared } from '@fluentui/react-northstar';
import { TeamsFx } from '@microsoft/teamsfx';

export const TeamsFxContext = createContext<{
  theme?: ThemePrepared,
  themeString: string,
  teamsfx?: TeamsFx,
  context?: any,
}>({
  theme: undefined,
  themeString: "",
  teamsfx: undefined,
  context: undefined
});
