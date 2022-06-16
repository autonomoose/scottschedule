import React from 'react';
import { Link } from 'gatsby';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';

import Header from './header';
import { darkTheme } from "../themes/dark";
import { lightTheme } from "../themes/light";

interface LayoutPubProps {
        children: React.ReactNode,
}
const LayoutPub = ({ children }: LayoutPubProps) => {
    const [mode, setMode] = React.useState("light");

    const theme = React.useMemo(
        () => createTheme(mode === "light" ? lightTheme : darkTheme), [mode]
    );

    // setup dark/light mode on initial load and add listener
    React.useEffect(() => {
        let localColor = window.localStorage.getItem('color-mode');

        if (typeof localColor !== 'string') {
            const root = window.document.documentElement;
            localColor = root.style.getPropertyValue('--color-mode');
            window.localStorage.setItem('color-mode', localColor);
        }
        setMode(localColor);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            const newMode = event.matches ? "dark" : "light";
            setMode(newMode);
            window.localStorage.setItem('color-mode', newMode);
        })

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', () => {});
        };
    }, []);

  return (
        <ThemeProvider theme={theme}><CssBaseline enableColorScheme />
        <div style={{ margin: `1rem auto`, minHeight: '100vh', }} >
          <Header uname="" mode={mode} setMode={setMode} />
          <div style={{ margin: `0 auto`, padding: `50px 1.0875rem 1.45rem`, maxWidth: 960, }} >
            <main>{children}</main>

            <footer style={{ paddingTop: 40 }}>
              <Divider />
              <Box display='flex' justifyContent='space-around'>
                <Link to='/home'><HomeIcon /> Home</Link>
                <a href="https://www.wernerdigital.com/about"><GroupIcon />About</a>
              </Box>
              <Divider />
              <Typography variant='caption' mx={2}>
                &copy; 2021-{new Date().getFullYear()}, Werner Digital Technology Inc
              </Typography>
            </footer>
          </div>
        </div>
        </ThemeProvider>
  )
}


export default LayoutPub
