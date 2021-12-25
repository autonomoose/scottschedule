// import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import React, { useState, useEffect, useCallback, Component } from 'react';
import { Link } from 'gatsby';
// import { Auth, API, Hub } from "aws-amplify"
import { Auth, Hub } from "aws-amplify"
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import Header from './header';

// import { currUsersInfo, IgetCurrentUser } from '../graphql/queries';
import './layout.scss';

interface EboundaryState {
        errorMsg : string | null,
}
class WbenchErrorBoundary extends Component<{}, EboundaryState> {
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
                <h3 data-testid="errorboundary" style={{marginTop: '30px', color: '#000000'}}>Sorry! Something went wrong. </h3>
                <span style={{color: '#000000'}}>This event has been logged.  We apologize for the issue, please contact tech support for more information.</span>
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

// this should come from graphql def
export interface IgetCurrentUser {
         userid?: string,
         perm?: string,
         nname?: string,
         adisable?: string,
         agroups?: string,
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
     const [uname, setUname] = useState('')
     const [uid, setUid] = useState('')

     // set this to show a pre-fetch (uncomment useeffect below)
     // const [hdata, setHdata] = useState<HdataValues>({"data":{"getCurrentUser":{"loading": "true", "progError": null}}});
     const [hdata, setHdata] = useState<HdataValues>({"data":{"getCurrentUser":{userid: "000TEST00000000000000000000000"}}});

     // const vdebug = true;    // test and dev settings
     const vdebug = (props.vdebug || false);  // production settings

     // get the username and uid from session accessToken
     // using memoized fetchUname to keep renders from
     //   triggering useeffects listing it in dependencies
     // NOTE: this could be simply defined in the useeffect
     //   without usecallback since it is only used by one useeffect
     const fetchUname = useCallback(async () => {
         try {
             // @ts-expect-error: until aws-amplify gets formal typing
             const {accessToken} = await Auth.currentSession();
             const uname = accessToken.payload['username'];
             setUname(uname);
             const uid = accessToken.payload['sub'];
             setUid(uid);
         } catch (error) {
             setHdata({"data":{"getCurrentUser":{"progError": "AWS-AUTH-CURRENSESSION"}}});
             setUname('');
             }
         }, []);

     // every time the page loads
     useEffect(() => {
         fetchUname();
     }, [fetchUname, vdebug]);

     // log out user after an hour
     // useInterval(() => {
     //     async function signOut() {
     //       try {
     //           await Auth.signOut({ global: true });
     //       } catch (error) {
     //           console.log('error signing out: ', error);
     //       }
     //     };
     //
     //     signOut();
     //     // fetchUname();
     // }, (uname === 'no user' || uname === '')? 0: 3600000);

     // get the user record from dynamodb
     // everytime the user changes to a valid name
     // useEffect(() => {
     //     async function fetchUser() {
     //       try {
     //         const result: any = await API.graphql({query: currUsersInfo});
     //         if (vdebug) { console.log(result); }
     //         setHdata(result);
     //         } catch (error) {
     //           setHdata({"data":{"getCurrentUser":{"progError": "AWS-AUTHDB-CURRUSERSINFO"}}});
     //         }
     //       };
     //
     //     if (uname !== 'no user' && uname !=='') {
     //         fetchUser();
     //   }
     // }, [uname, vdebug]);

   // subscribe to any changes in auth status
   useEffect(() => {
       const hubListener = (data: any) => {
           switch (data.payload.event) {
           case 'signIn':
               window.location.reload();
               enqueueSnackbar(`Sign-on successful`, {variant: 'success'});
               break;
           case 'tokenRefresh_failure':
               // setUname('no user');
               window.location.reload();
               enqueueSnackbar(`user timed out`, {variant: 'success'});
               // navigate("/");
               break;
           case 'signOut':
               // setUname('no user');
               enqueueSnackbar(`user logged off`, {variant: 'success'});
               break;
           case 'tokenRefresh':
               console.log('user refreshed session');
               break;
           default:
               console.log('Uncaught Auth module hub signal', data.payload.event);
               break;
           }
       };

       Hub.listen('auth', hubListener);
       return () => {Hub.remove('auth', hubListener)};
   }, [enqueueSnackbar, vdebug]);

   return (
       <AmplifyAuthenticator>
       <div style={{textAlign: 'center'}}>
       <div style={{margin: `1rem auto`, minHeight: '100vh', backgroundColor: '#eeeeee', textAlign: 'left' }} >
         <Header uname={uname}/>
         <div style={{ margin: `0 auto`, padding: `50px 1.0875rem 1.45rem`, maxWidth: 960, color: `#000000` }} >

           <main>
             {(props.usrSetup || (hdata.data.getCurrentUser && hdata.data.getCurrentUser.userid)) ?
                 <>
                 { ((!props.permit) || (hdata.data.getCurrentUser.agroups && hdata.data.getCurrentUser.agroups.includes(props.permit))) ?
                     <WbenchErrorBoundary ><div data-testid='mainPageDisplay'> {props.children} </div></WbenchErrorBoundary>
                     : <div style={{textAlign: 'center'}}>
                       <h3 style={{marginTop: '30px'}}>Sorry! Not Permitted. </h3>
                       This user needs {props.permit} privileges to access this page.
                     </div>
                 } </>:

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
                         <p>Your userkey is {uid}.  <br /><small>Give this userkey to your administrator to join an existing company.</small></p>
                         <p>To setup as a new company please <br /><Button variant='outlined' size='small' ><Link to='/setup2'>Accept Terms of Service</Link></Button> to continue
                         </p>
                       </div>
                     }
                     </>
                 }
                 </>

             }

           </main>

           <footer style={{ paddingTop: 40 }}>
             <Divider />
             &copy; {new Date().getFullYear()}, Werner Digital Technology Inc
           </footer>
         </div>
       </div>
       </div>
       </AmplifyAuthenticator>

   ) // end of anonymous return
 }

export default Layout