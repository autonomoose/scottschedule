/*
  user utilities
    effectChgVerEmailDialog - change email, verify email

*/
import React, { useState, ChangeEvent, BaseSyntheticEvent  } from 'react';
import { Auth } from "aws-amplify"

import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

/*
===============================================================
   email change and verification
   parameters to pass in
     dialogOpen(true/false)
     dialogClose={(retval) => {setChgPassOpen(false);} } // minimum
     verifyOnly (optional)
   returns
     '' on cancel, 'email' email chg (no verify), 'ver' if verified
     page should be refreshed on 'email' | 'ver' , so as to show any
       new information from the user attributes
     'ver' indicates a verify pending that may not show for a few minutes
       on the user attributes
===============================================================
*/

interface EmailChgVerDialogProps {
    dialogOpen: boolean,
    dialogClose: (arg0:string) => void,
    verifyOnly?: boolean,
}
export const EmailChgVerDialog = (props: EmailChgVerDialogProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { dialogOpen, dialogClose, verifyOnly } = props;

    const [codeval, setCodeval] = useState('');
    const [newemail, setNewemail] = useState('');

    const [sendingcode, setSendingcode] = useState(false);
    const [emailchanged, setEmailchanged] = useState(false);
    const [codesent, setCodesent] = useState(false);
    const [confirming, setConfirming] = useState(false);

    // change email and send validation code
    const changeCognitoEmail = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            setSendingcode(true);
            await Auth.updateUserAttributes(currentUser, {email: newemail });
            setEmailchanged(true);
            setCodesent(true);
            enqueueSnackbar(`Email has been changed`, {variant: 'success'} );
            enqueueSnackbar(`Verification code sent`, {variant: 'success'} );
        } catch (error) {
            console.warn("Failed to send code", error);
            setSendingcode(false);
            enqueueSnackbar(`Failed to send code`, {variant: 'error'});
        }
    };

    // re-send validation code
    const resendEmailValidation = async () => {
        try {
            setSendingcode(true);
            await Auth.verifyCurrentUserAttribute('email');
            setCodesent(true);
            enqueueSnackbar(`Code Sent`, {variant: 'success'} );
        } catch (error) {
            console.warn("Failed to resend code", error);
            setSendingcode(false);
            enqueueSnackbar(`Failed to resend code`, {variant: 'error'});
        }
    };

    // validation with code
    const confirmCognitoEmail = async () => {
        try {
            setConfirming(true);
            await Auth.verifyCurrentUserAttributeSubmit("email", codeval);
            enqueueSnackbar(`Email verified`, {variant: 'success'} );

            setSendingcode(false);
            setCodesent(false);
            setConfirming(false);
            setCodeval('');
            setNewemail('');
            dialogClose('ver');
        } catch (error) {
            setConfirming(false);
            console.warn("Verification failed", error);
            enqueueSnackbar(`Verification failed`, {variant: 'error'});
        }
    };

    // handle form actions

    // reset form states
    const handleReset = () => {
        setCodeval('');
        setNewemail('');

        setSendingcode(false);
        setEmailchanged(false);
        setCodesent(false);
        setConfirming(false);
    };

    // cancel button, also called when esc or click off dialog
    const handleCancel = () => {
        dialogClose((emailchanged)? 'email': '');
    };

    // request to change email and send the code
    const handleSubEmail = (event: BaseSyntheticEvent) => {
        event.preventDefault(); // disable any form action that may duplicate call
        changeCognitoEmail();
    };

    // request to re-send the code
    const handleResendCode = (event: BaseSyntheticEvent) => {
        event.preventDefault(); // disable any form action that may duplicate call
        resendEmailValidation();
    };

    // request to validate code
    const handleAction = (event: BaseSyntheticEvent) => {
        event.preventDefault();
        confirmCognitoEmail();
    };

    // when true will enable dialog send code button
    const validateEmail = () => {
        return (
            newemail.length > 6 &&
            newemail.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
        );
    }

    // when true will enable verify button
    const validateForm = () => {
        return (codeval.length > 5);
    }

    // handle field changes
    const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setNewemail(event.target.value);
    };
    const handleChangeCode = (event: ChangeEvent<HTMLInputElement>) => {
        setCodeval(event.target.value);
    };

    return (
      <Dialog onClose={handleCancel} aria-labelledby="namedialog-title" open={dialogOpen}>
        <DialogTitle id="namedialog-title">{(verifyOnly || codesent)? 'Verify Email': 'Change Email'} </DialogTitle>
        <DialogContent><DialogContentText>
        { (!codesent) ?
          <>
          { (!verifyOnly) ?
            <span>
              Enter your new email address and request a verification code.
            </span> :
            <span>
              Request a verification code to be sent to your unverified email address.
            </span>
          }
          </> :
          <span>
            Find the verification code in your email, and enter it below.
            Press the Verify button when you are done entering the code to finish verification.
            { (verifyOnly) ?
              <small>&nbsp;(Press reset to have another code resent)</small>:
              <small>
                &nbsp;(Press reset to change the email address,
                or press cancel, and Verify email for the user page to have another code
                    resent to the current email address)
              </small>
            }
          </span>
        }

        </DialogContentText>

          { (!codesent) ?
             <>
             { (!verifyOnly) ?
               <Box alignItems='center' display='flex'>
                 <TextField margin="dense" type="text" variant="outlined"
                   disabled={sendingcode}
                   value={newemail} onChange={handleChangeEmail}
                   label="New email address" id="email"
                   inputProps={{'data-testid': 'newEmailInput'}}
                 />
                 <Button size='small' style={{ marginLeft: 4 }}
                   disabled={!validateEmail() || sendingcode} onClick={handleSubEmail} color="primary" variant="outlined" >
                   Change Email and Verify
                  </Button>
                </Box> :

                <Box alignItems='center' display='flex'>
                  <Button size='small' style={{ marginLeft: 4 }}
                    disabled={sendingcode} onClick={handleResendCode} color="primary" variant="outlined" >
                     Send Code </Button>
                </Box>
              }
              </>:

              <Box alignItems='center' display='flex'>
              <TextField margin="dense" type="text" variant="outlined"
                disabled={confirming}
                value={codeval} onChange={handleChangeCode}
                label="Verification Code" id="code"
                inputProps={{'data-testid': 'verifyInput'}}
              />
              </Box>
          }

        </DialogContent>
        <DialogActions>
          <Tooltip title='Enabled after confirmation code is sent and entered into the form'>
          <span><Button disabled={!validateForm() || confirming} onClick={handleAction} color="primary" variant="outlined" data-testid='emailChgVerify'>
            Verify </Button></span></Tooltip>

          <Tooltip title='Start process from the beginning, without completing verification'>
          <Button onClick={handleReset} variant="outlined" data-testid="resetButton">
            Reset </Button></Tooltip>

          <Tooltip title='Return immediately to user settings page'>
          <Button onClick={handleCancel} color="secondary" variant="outlined" data-testid='emailChgCancel'>
            Cancel </Button></Tooltip>
        </DialogActions>
      </Dialog>
    );
}


/*
===============================================================
password change,
   parameters to pass in
   dialogOpen(true/false)
   dialogClose={() => {setChgPassOpen(false);} }  // at minimum
===============================================================
*/
interface PasswordChgDialogProps {
    dialogOpen: boolean,
    dialogClose: () => void,
}
export const PasswordChgDialog = (props: PasswordChgDialogProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { dialogOpen, dialogClose } = props;
    const [passval, setPassval] = useState('');
    const [newval, setNewval] = useState('');
    const [confval, setConfval] = useState('');

    async function changeCognitoPassword() {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            await Auth.changePassword(currentUser, passval, newval);
            enqueueSnackbar(`Your password has been changed`, {variant: 'success'} );
        } catch (error) {
            // console.warn("pwd chg fail", error)
            enqueueSnackbar(`Password change failed`, {variant: 'error'});
        }
     };

    // handle form actions
    // cancel button, also called when esc or click off dialog
    const handleCancel = () => {
        setPassval('');
        setNewval('');
        setConfval('');
        dialogClose();
    };

    // submit action, also called when esc or click off dialog
    const handleAction = (event: BaseSyntheticEvent) => {
        event.preventDefault(); // disable any form action that may duplicate call
        // console.log('begin dialog action');
        changeCognitoPassword();
        setPassval('');
        setNewval('');
        setConfval('');
        dialogClose();
    };
    const validateForm = () => {
        return (passval.length > 0 && newval.length > 7 && newval === confval);
    }

    // handle field changes
    const handleChangePassval = (event: ChangeEvent<HTMLInputElement>) => {
        setPassval(event.target.value);
    };
    const handleChangeNewval = (event: ChangeEvent<HTMLInputElement>) => {
        setNewval(event.target.value);
    };
    const handleChangeConfval = (event: ChangeEvent<HTMLInputElement>) => {
        setConfval(event.target.value);
    };

    return (
      <Dialog onClose={handleCancel} aria-labelledby="namedialog-title" open={dialogOpen}>
        <DialogTitle id="namedialog-title">Change Password</DialogTitle>
        <DialogContent>
          <TextField margin="dense" type="password" variant="outlined" fullWidth autoComplete="new-password"
            value={passval} onChange={handleChangePassval}
            label="Password" id="pass"
            inputProps={{'data-testid': 'oldPassInput'}}
          />
          <TextField margin="dense" type="password" variant="outlined" fullWidth autoComplete="new-password"
            value={newval} onChange={handleChangeNewval}
            label="New Password" id="newpass"
            inputProps={{'data-testid': 'newPassInput'}}
          />
          <TextField margin="dense" type="password" variant="outlined" fullWidth autoComplete="new-password"
            value={confval} onChange={handleChangeConfval}
            label="Confirm Password" id="confpass"
            inputProps={{'data-testid': 'confPassInput'}}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={!validateForm()} onClick={handleAction} color="primary" variant="outlined" >
           Change Password </Button>
          <Button onClick={handleCancel} color="secondary" variant="outlined">
            Cancel </Button>
        </DialogActions>
      </Dialog>
    );
}


/*
===============================================================
user self-service delete
   parameters to pass in
   dialogOpen(true/false)
   dialogClose={() => {setDelUserOpen(false);} }  // at minimum
===============================================================
*/
interface UserDelDialogProps {
    dialogOpen: boolean,
    dialogClose: () => void,
}
export const UserDelDialog = (props: UserDelDialogProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { dialogOpen, dialogClose } = props;

    async function deleteUser() {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            console.log("still needs to del", currentUser);
            // await currentUser.deleteUser(err, res);
            enqueueSnackbar(`Would have tried to delete you!`, {variant: 'success'});
            // redirect?
        } catch (error) {
            // console.warn('delete failed', error);
            enqueueSnackbar(`Delete failed`, {variant: 'error'});
        }
     };

    // handle form actions
    // cancel button, also called when esc or click off dialog
    const handleCancel = () => {
        dialogClose();
    };

    // submit action, also called when esc or click off dialog
    const handleAction = (event: BaseSyntheticEvent) => {
        event.preventDefault(); // disable any form action that may duplicate call
        // console.log('begin dialog action');
        deleteUser();
        dialogClose();
    };

    return (
      <Dialog onClose={handleCancel} aria-labelledby="namedialog-title" open={dialogOpen}>
        <DialogTitle id="namedialog-title">Delete User Account</DialogTitle>
        <DialogContent><DialogContentText>
          This will delete your user account and log you off.
          <br /> Thanks for using our software!
        </DialogContentText> </DialogContent>
        <DialogActions>
          <Button onClick={handleAction} color="primary" variant="outlined" >
           Delete User Account </Button>
          <Button onClick={handleCancel} color="secondary" variant="outlined">
            Cancel </Button>
        </DialogActions>
      </Dialog>
    );
}



