/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */
import React from 'react'
import { SnackbarProvider } from 'notistack';

const DeferredScript = () => {
    const scriptText = `(() => {
        const loadColorMode = () => {
            let ret_mode = 'light';
            const browserColorMode = window.matchMedia('(prefers-color-scheme: dark)');
            if (typeof browserColorMode.matches === 'boolean' && browserColorMode.matches) {
                ret_mode = 'dark';
            }
            return ret_mode;
        }

        const currColorMode = loadColorMode();
        const root = document.documentElement;
        root.style.setProperty(
          '--color-mode', currColorMode
        );
        root.style.setProperty(
          '--color-background',
          (currColorMode === 'light')
            ? '#eeeeee'
            : 'black'
        );

    })()`;

    return(<script dangerouslySetInnerHTML={{ __html: scriptText}} />);
};

export const onRenderBody = ({ setPreBodyComponents }) => {
    setPreBodyComponents(<DeferredScript key='colorMode' />);
};

export const wrapPageElement = ({ element }) => {
  // props provide same data to Layout as Page element will get
  // including location, data, etc - you don't need to pass it
  return <SnackbarProvider maxSnack={3} dense preventDuplicate>{element}</SnackbarProvider>;
};


