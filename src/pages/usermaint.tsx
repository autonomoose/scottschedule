import React, { useState, useEffect } from 'react';
import { Auth } from "aws-amplify"
import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import { EmailChgVerDialog, PasswordChgDialog, UserDelDialog } from '../components/userutil';

import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';

const UserMaintPage = () => {
    const [uid, setUid] = useState('');
    const [uparent, setUparent] = useState('');
    const [uemail, setUemail] = useState('');
    const [uconfirmed, setUconfirmed] = useState(false);
    const [verifyonly, setVerifyonly] = useState(false);
    const [pendingverify, setPendingverify] = useState(false);

    const [pgserial, setPgserial] = useState(1);
    const [chgPassOpen, setChgPassOpen] = useState(false);
    const [chgEmailOpen, setChgEmailOpen] = useState(false);
    const [closeUserOpen, setCloseUserOpen] = useState(false);


    useEffect(() => {
      async function fetchUinfo() {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            const userAttributes = await Auth.userAttributes(currentUser);
            // console.log("user attrib ", userAttributes);
            userAttributes.forEach(item => {
                if (item.Name === 'email_verified') {
                    if (item.Value === 'true') {
                        setPendingverify(false);
                        setUconfirmed(true);
                    } else {
                        setUconfirmed(false);
                    }
                } else if (item.Name === 'email') {
                    setUemail(item.Value);
                } else if (item.Name === 'custom:tenant') {
                    setUparent(item.Value);
                } else if (item.Name === 'sub') {
                    setUid(item.Value);
                }
            });
        } catch (error) {
            console.warn('Failed user info req', error);
        }
      };

      fetchUinfo();
    }, [pgserial]);

    const handleEmailDialogClose = (retcode: string) => {
        setChgEmailOpen(false);
        // console.log('dialog close handler', retcode, pgserial);
        if (retcode) {
            setPgserial(pgserial+1);
            if (retcode === 'ver') {
                setPendingverify(true);
            }
        }
    };

    return(
        <Layout>
        <PageTopper pname="User Settings"
          helpPage="/help/usermaint"
        />

        <Paper elevation={5} style={{margin: 0, padding: 1, clear: 'both'}}>
            <PasswordChgDialog dialogOpen={chgPassOpen} dialogClose={() => {setChgPassOpen(false);} } />
            <EmailChgVerDialog dialogOpen={chgEmailOpen} verifyOnly={verifyonly} dialogClose={(retcode) => {handleEmailDialogClose(retcode);} }/>
            <UserDelDialog dialogOpen={closeUserOpen} dialogClose={() => {setCloseUserOpen(false);} }/>
            <Box mt={1} >
              <Box display='flex'>
                <h3>Welcome</h3>
                <Box mx={1} mt={1}>
                  to the User Settings page.  If you need to contact support, please include the following:
                </Box>
              </Box>

              <Box mx={4}>
                <ul>
                  <li> Account key:<br /> {uparent} </li>
                  <li> User key:<br /> {uid} </li>
                </ul>
              </Box>
            </Box>

        </Paper>

        <Box mt={1} display='flex' flexWrap='wrap'>

          <Box display='flex' width={250} mb={2} mx={1}><Card>
            <Box my={1} display='flex' justifyContent='center'><Button color="primary" variant="outlined" size="small" onClick={() => {setChgPassOpen(true);} }>
              Change Password </Button></Box>

            <Box ml={2} mr={1} mb={2}>Good account security starts with strong passwords that are changed regularly. </Box>
          </Card></Box>

          <Box display='flex' width={250} mb={2} mx={1}><Card>
            <Box my={1} display='flex' justifyContent='center'><Button color="primary" variant="outlined" size="small" onClick={() => {setVerifyonly(false); setChgEmailOpen(true);} }>
            Change Email </Button></Box>

            <Box ml={2} mr={1} mb={2}>
               <strong>{uemail}</strong>
               {(uconfirmed)?
                 <Box display='flex' justifyContent='center'>
                   <span >(verified)</span>
                 </Box> :
                 <>
                 { (pendingverify) ?
                   <Box display='flex' justifyContent='center'>
                     <span >(verification pending)</span>
                   </Box> :

                   <Box>
                     <span style={{color: '#9a0036'}}>
                         (unverified)
                         &nbsp;<Button variant="outlined" size="small" onClick={() => {setVerifyonly(true); setChgEmailOpen(true);} }>
                           Verify Email
                         </Button>
                     </span>
                   </Box>
                 }
                 </>
               }

               <p>It is important to have a valid email address for account security and password recovery.</p>
               <p>We verify new email addresses by sending a code to that address.</p>
            </Box>
          </Card></Box>

          { (uparent !== uid)?
              <Box display='flex' width={250} mb={2} mx={1}><Card>
                <Box my={1} display='flex' justifyContent='center'><Button color="secondary" variant="outlined" size="small" onClick={() => {setCloseUserOpen(true);} }>
                Delete User </Button></Box>

                <Box ml={2} mr={1} mb={2}>
                    This will delete a secondary user on the account.  To close an account, you must be the primary user.
                    If you want to close the account and do not have access to the primary user, please contact user support.
                </Box>
              </Card></Box> :

              <Box display='flex' width={250} mb={2} mx={1}><Card>
                <Box my={1} display='flex' justifyContent='center'><Button color="secondary" variant="outlined" size="small" onClick={() => {setCloseUserOpen(true);} }>

                Close Account </Button></Box>
                <Box ml={2} mr={1} mb={2}>
                    This will send you to our billing partner to close your account.
                    Your account data on this system will be securely deleted 7 days
                    after the date the close date specified.
                </Box>
              </Card></Box>
          }
        </Box>
        </Layout>
        );
};



export default UserMaintPage


