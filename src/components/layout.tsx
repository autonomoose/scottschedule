import React, { useState, useEffect, useMemo } from 'react';
import { Auth, API, Hub } from "aws-amplify"
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import { useSnackbar } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Header from './header';
import LinkD from './linkd';
import { darkTheme } from "../themes/dark";
import { lightTheme } from "../themes/light";

import { currUsersInfo, IgetCurrentUser } from '../graphql/queries';


interface EboundaryState {
        errorMsg : string | null,
}
class WbenchErrorBoundary extends React.Component<{children: React.ReactNode}, EboundaryState> {
    constructor(props: any) {
        super(props);
        this.state = {errorMsg: ''};
    }

    static getDerivedStateFromError(error: any) {
        return {errorMsg: error.toString()};
    }
    componentDidCatch(_error: any, _info: any) {
        console.warn('found body error');
    }
    render() {
        if (this.state.errorMsg) {
            return (
              <div style={{textAlign: 'center'}}>
                <h3 data-testid="errorboundary" style={{marginTop: '30px'}}>Sorry! Something went wrong. </h3>
                <span>This event has been logged.  We apologize for the issue, please contact tech support for more information.</span>
              </div>
            );
        }
        return this.props.children;
    }
}

// this uses hooks to store the callback function
//    when it changes and reset the timer when the delay changes
// this keeps page timer from being reset with every render
//  type CallBackFunction = {
//         (): void,
//  }
//  const useInterval = (callback : CallBackFunction, delay: number) => {
//      const savedCallback = useRef<CallBackFunction | null>(null);
//
//      // Remember the latest callback.
//      useEffect(() => {
//          savedCallback.current = callback;
//      }, [callback]);

     // Set up the interval.
//      useEffect(() => {
//          function tick() {
//              if (savedCallback.current) {
//                 savedCallback.current();
//              }
//          }
//          if (delay) {
//              let id = setInterval(tick, delay);
//              return () => clearInterval(id);
//          } else {
//              return () => {};
//          }
//      }, [delay]);
//    }

interface LayoutProps {
     children: React.ReactNode,
     permit?: string,
     usrSetup?: string,
     vdebug?: string,
}

interface GetDataValues extends IgetCurrentUser {
                loading?: "true" | "false" | null,
                progError?: string | null,
}
interface HdataValues {
        data: {getCurrentUser: GetDataValues},
}

const Layout = (props: LayoutProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [uid, setUid] = useState('')

    const [hdata, setHdata] = useState<HdataValues>({"data":{"getCurrentUser":{"loading": "true", "progError": null}}});
    const [mode, setMode] = useState("light");
    // we also use the authenticator to watch for auth status changes
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const { user } = useAuthenticator((context) => [context.user]);

    // const vdebug = true;    // test and dev settings
    const vdebug = (props.vdebug || false);  // production settings

    const theme = useMemo(
        () => createTheme(mode === "light" ? lightTheme : darkTheme), [mode]
    );


    // get the user record from dynamodb
    // everytime the user changes to a valid name
    useEffect(() => {
        async function fetchUser() {
          try {
            const result: any = await API.graphql({query: currUsersInfo});
            setHdata(result);
          } catch (error) {
              setHdata({"data":{"getCurrentUser":{"progError": "AWS-AUTHDB-CURRUSERSINFO"}}});
          }
          try {
              // @ts-expect-error: until aws-amplify gets formal typing
              const {accessToken} = await Auth.currentSession();
              // const uname = accessToken.payload['username'];
              const uid = accessToken.payload['sub'];
              setUid(uid);
          } catch (error) {
              setHdata({"data":{"getCurrentUser":{"progError": "AWS-AUTH-CURRENSESSION"}}});
          }

        };

        // useEffect body
        if (authStatus === 'authenticated') {
            fetchUser();
        } else {
            setHdata({"data":{"getCurrentUser":{"loading": "true", "progError": null}}});

        }
    }, [authStatus]);

    // setup dark/light mode on initial load and add listener
    useEffect(() => {
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

    useEffect(() => {
        const root = window.document.documentElement;
        if (mode === 'light') {
            // backgrounds, borders
            root.style.setProperty('--amplify-colors-background-primary', '#f2eee2');
            root.style.setProperty('--amplify-colors-border-primary', 'var(--amplify-colors-blue-90)');
            root.style.setProperty('--amplify-colors-border-focus', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-primary-background-color', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-primary-hover-background-color', 'var(--amplify-colors-blue-80)');
            root.style.setProperty('--amplify-components-button-primary-active-background-color', 'var(--amplify-colors-blue-20)');

            // text
            root.style.setProperty('--amplify-colors-font-primary', 'var(--amplify-colors-black)');
            root.style.setProperty('--amplify-colors-font-interactive', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-color', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-hover-color', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-hover-border-color', 'var(--amplify-colors-blue-90)');
            root.style.setProperty('--amplify-components-button-hover-background-color', '#f5ce28');

            root.style.setProperty('--amplify-components-button-link-hover-color', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-link-hover-background-color', '#f5ce28');

        } else {
            // backgrounds, borders, buttons
            root.style.setProperty('--amplify-colors-background-primary', '#031424');
            root.style.setProperty('--amplify-colors-border-primary', 'var(--amplify-colors-blue-80)');
            root.style.setProperty('--amplify-colors-border-focus', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-primary-background-color', 'var(--amplify-colors-blue-100)');
            root.style.setProperty('--amplify-components-button-primary-hover-background-color', 'var(--amplify-colors-blue-80)');
            root.style.setProperty('--amplify-components-button-primary-active-background-color', 'var(--amplify-colors-blue-60)');

            // text
            root.style.setProperty('--amplify-colors-font-primary', 'var(--amplify-colors-white)');
            root.style.setProperty('--amplify-colors-font-interactive', 'var(--amplify-colors-blue-40)');
            root.style.setProperty('--amplify-components-button-color', 'var(--amplify-colors-blue-40)');
            root.style.setProperty('--amplify-components-button-hover-color', 'var(--amplify-colors-neutral-60)');
            root.style.setProperty('--amplify-components-button-hover-border-color', 'var(--amplify-colors-blue-60)');
            root.style.setProperty('--amplify-components-button-hover-background-color', '#30415d');

            root.style.setProperty('--amplify-components-button-link-hover-color', 'var(--amplify-colors-neutral-60)');
            root.style.setProperty('--amplify-components-button-link-hover-background-color', '#30415d');
        }
    }, [mode]);

    // subscribe to any changes in auth status
    useEffect(() => {
        const hubListener = (data: any) => {
            const mytime = new Date(Date.now());

            switch (data.payload.event) {
            case 'signIn':
                enqueueSnackbar(`Sign-on successful`, {variant: 'success'});
                console.log('Sign-in:', mytime.toLocaleTimeString());
                break;
            case 'tokenRefresh_failure':
                window.location.reload();
                enqueueSnackbar(`user timed out`, {variant: 'success'});
                console.log('Time-out:', mytime.toLocaleTimeString());
                break;
            case 'signOut':
                enqueueSnackbar(`user logged off`, {variant: 'success'});
                console.log('Sign-out:', mytime.toLocaleTimeString());
                break;
            case 'tokenRefresh':
                console.log(mytime.toLocaleTimeString());
                console.log('user refreshed session');
                break;
            case 'signIn_failure':
            case 'signUp':
                break;
            default:
                console.log(mytime.toLocaleTimeString());
                console.log('Uncaught Auth module hub signal', data.payload.event);
                break;
            }
        };

        Hub.listen('auth', hubListener);
        return () => {Hub.remove('auth', hubListener)};
    }, [enqueueSnackbar, vdebug]);


    return (
        <ThemeProvider theme={theme}> <CssBaseline enableColorScheme />
        { (authStatus !== 'authenticated') ? <Authenticator /> :
        <div style={{margin: `1rem auto`, minHeight: '100vh', textAlign: 'center' }} >
          <Header uname={user?.username || ''} mode={mode} setMode={setMode} />
          <Box mt={8}>

            <main>
              {(props.usrSetup || (hdata.data.getCurrentUser && hdata.data.getCurrentUser.userid)) ?
                <>
                  { ((!props.permit) || (hdata.data.getCurrentUser.agroups && hdata.data.getCurrentUser.agroups.includes(props.permit)))
                      ? <WbenchErrorBoundary>
                          <div data-testid='mainPageDisplay' style={{textAlign: 'left'}}>
                              {props.children}
                          </div>
                        </WbenchErrorBoundary>
                      : <div data-testid='notpermitted' style={{textAlign: 'center'}}>
                        <h3 style={{marginTop: '30px'}}>Sorry! Not Permitted. </h3>
                        This user needs {props.permit} privileges to access this page.
                      </div>
                  }
                </>:

                <>
                  { (hdata.data.getCurrentUser && hdata.data.getCurrentUser.loading) ?
                    <div style={{textAlign: 'center'}}>
                      <h3 style={{marginTop: '30px'}} data-testid="authentCheckDB"><CircularProgress /> </h3>
                    </div> :

                    <>
                      { (hdata.data.getCurrentUser && hdata.data.getCurrentUser.progError) ?
                        <div style={{textAlign: 'center'}}>
                        <h3 style={{marginTop: '30px'}}  data-testid="authentFail"> Authentication Error! </h3>
                          <p>We have encountered an expected error during authentication.
                            <br /> This is an unusual error, please wait a few minutes before retrying.
                            <br /><br /> If this error persists, please contact technical support at
                            support@wernerdigital.com and report error {hdata.data.getCurrentUser.progError}.  Our apologies for the inconvenience!
                          </p>
                        </div> :

                        <div style={{textAlign: 'center'}}>
                        <h3 style={{marginTop: '30px'}} data-testid="authentNewUser"> Welcome, new user! </h3>
                          <p>Your userkey is {uid}.  <br /><small>Give this userkey to your administrator to join an existing account.</small></p>
                          <p>To setup as a new account please <br /><Button variant='outlined' size='small' ><LinkD to='/setup2'>Accept Terms of Service</LinkD></Button> to continue
                          </p>
                        </div>
                      }
                    </>
                  }
                </>
              }
            </main>
          </Box>

            <footer style={{ paddingTop: 40 }}>
              <Divider />
              <Box display='flex' justifyContent='space-around'>
                <LinkD color='secondary' to='/home'>Home</LinkD>
                <LinkD color='secondary' to='/usermaint'>Account</LinkD>
                <LinkD color='secondary' to='/scheds'>Schedules</LinkD>
                <LinkD color='secondary' to='/events'>Events</LinkD>
                <LinkD color='secondary' to='/help'>Help</LinkD>
              </Box>
              <Divider />
              <Typography variant='caption' mx={2}>
                &copy; 2021-{new Date().getFullYear()}, Werner Digital Technology Inc
              </Typography>
            </footer>
        </div>
        }
        </ThemeProvider>
    ) // end of anonymous return
}

export default Layout