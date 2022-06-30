// this rather convoluted hack is a compromise
//  between ui link, gatsby link, and typescript
import React from 'react';
import type { GatsbyLinkProps } from "gatsby";
import { Link } from 'gatsby';

import MuiLink from '@mui/material/Link';

/*
    Use this to wrap gatsby link in mui components
    such as button, etc.  link example <LinkD> below
        component={}
*/

export type MyLinkProps = Omit<GatsbyLinkProps<unknown>, "ref">;
export const GatsbyLink = React.forwardRef<any, MyLinkProps>((props, ref) => (
    <Link
      innerRef={ref} activeClassName="active"
      {...props}
    />
),);

/*
  LinkD demonstrates the embeddable gatsby link and extends it
    to pass an explicit debug= on the URL when passed as a parm
    vdebug
*/
const linkDebug = (plink: string, vdebug: string): string => {
    if (!vdebug) { return(plink); }
    const sep = (plink.indexOf('?') > 0) ? '&': '?';
    return (plink + sep + 'debug=' + vdebug);
}
export const LinkD = (props: any) => {
    const { to, vdebug, children, ...pass_props } = props;
    return (
        <MuiLink component={GatsbyLink} to={linkDebug(to, vdebug)} {...pass_props}>{children}</MuiLink>
    );
}

export default LinkD

