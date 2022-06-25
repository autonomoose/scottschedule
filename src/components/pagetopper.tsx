import React from 'react';

import LinkD from './linkd';

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';

// quick-n-dirty yy-mm-dd
export var sysQuickDate = new Intl.DateTimeFormat("en-US", {year: "2-digit", month: "numeric", day: "numeric"});

interface LinksListProp {
        title: string,
        plink: string,
        vdebug?: string,
}
interface XtraListProp  {
        title: string,
        plink: string,
        vdebug?: string,
}

interface PageTopperProps {
    linksList?: LinksListProp[],
    xtraList?: XtraListProp[],
    helpPage?: string,
    ptitle?: string,
    pname?: string,
    vdebug?: string,
}

export const PageTopper = (props: PageTopperProps) => {
    const { linksList, xtraList, helpPage, ptitle, pname, vdebug } = props;
    return (
        <Box mx={2} display="flex" justifyContent="space-between">
        <div style={{ float: 'left' }}>
            <Breadcrumbs separator=">" aria-label="Breadcrumb">
            { (pname !== 'Home') &&
                <LinkD color='secondary' key="home" to='/home' vdebug={vdebug}>Home</LinkD>
            }

           { (linksList) && linksList.map(item => (
             <LinkD key={item.title}
               to={item.plink} vdebug={vdebug}>
               {item.title}</LinkD>
            ))}
            {(pname) && <span>{pname}
              {(vdebug) && <span> (DEBUG MODE)</span>}
            </span>}
            </Breadcrumbs>

            {(ptitle) && <h2>{ptitle}</h2>}
        </div>

        { (xtraList) &&
          <Box>
          {xtraList.map(item => (
            <Button key={item.title}  style={{margin: '0px 2px'}}
              color="primary" variant="outlined" size="small">
            <LinkD to={item.plink} vdebug={vdebug}>
              <small>{item.title}</small></LinkD>
            </Button>
          ))}
          </Box>
        }

        { (helpPage) ?
            <div >
                <LinkD to={helpPage} color='secondary'>Help</LinkD>
            </div> :
            <div >
              &nbsp;
            </div>
        }
        </Box>
    );
}

export default PageTopper

