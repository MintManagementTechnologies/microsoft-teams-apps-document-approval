
import { Link, useSearchParams } from 'react-router-dom';

import { Button, ButtonProps } from '@fluentui/react-northstar';

const LinkButton = (props: {
   path: string,
   queryParams?: { key: string, value: string }[],
} & ButtonProps): JSX.Element => {
   const { path, queryParams, ...btnProps } = props;

   let [searchParams, setSearchParams] = useSearchParams();
   const queryParamLayout = `layout=${searchParams.get("layout")}`;

   const queryParamsString = queryParams ?
      queryParams.map(x => `${x.key}=${x.value}`).join('&') : queryParamLayout;

   return (
      <Button
         as={Link}
         {...btnProps}
         className={`mmt-link-btn ui-button`}
         to={{ pathname: `/${path}?${queryParamsString}` }}
      />
   );
};

export default LinkButton;
