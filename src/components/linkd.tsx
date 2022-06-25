// this rather convoluted hack is a compromise
//  between ui link, gatsby link, and typescript
import React from 'react';
import type { GatsbyLinkProps } from "gatsby";
import { Link } from 'gatsby';

import MuiLink from '@mui/material/Link';

export type MyLinkProps = Omit<GatsbyLinkProps<unknown>, "ref">;

const GatsbyLink = React.forwardRef<any, MyLinkProps>((props, ref) => (
    <Link
      innerRef={ref} activeClassName="active"
      {...props}
    />
),);

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

