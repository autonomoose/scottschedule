import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { Auth } from 'aws-amplify';
import { EmailChgVerDialog } from '../userutil';

jest.mock('aws-amplify');

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));

// returns ver, email, ''
const handleDialogClose = jest.fn();

// local test helpers
//
const mytest = <EmailChgVerDialog dialogOpen={true} verifyOnly={false} dialogClose={(retcode) => {handleDialogClose(retcode)}}/>
const myverifytest = <EmailChgVerDialog dialogOpen={true} verifyOnly={true} dialogClose={(retcode) => {handleDialogClose(retcode)}}/>
const mySetup = () => {
    const utils = render(mytest);

    const chgEmailButton = utils.getByRole('button', {name: /change email/i});
    const cancelButton = utils.getByTestId('emailChgCancel');
    const resetButton = utils.getByTestId('resetButton');
    const verifyButton = utils.getByTestId('emailChgVerify'); //main verify button
    const newEmailInput = utils.getByTestId('newEmailInput');

    return {
        ...utils,
        chgEmailButton,
        cancelButton,
        resetButton,
        verifyButton,
        newEmailInput,
    }
};

describe("userutil email chg", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles cancel correctly", async () => {
    const utils = mySetup();
    userEvent.click(utils.cancelButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith('');
    });
  });

  it("handles change email w/ verification ", async () => {
    const utils = mySetup();
    userEvent.type(utils.newEmailInput, 'test@mock.com');
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Verification code sent`, {variant: 'success'});
    });

    userEvent.type(utils.getByTestId('verifyInput'), '123456');
    expect(utils.verifyButton).toBeEnabled();
    userEvent.click(utils.verifyButton);
    await waitFor(() => {
        expect(handleDialogClose).toHaveBeenCalledWith('ver');
    });
  }, 20000);

  it("handles defaults, a bad email and resets ", async () => {
    const utils = mySetup();
    expect(utils.chgEmailButton).toBeDisabled();
    expect(utils.verifyButton).toBeDisabled();

    // put in bad email and then reset
    userEvent.type(utils.newEmailInput, 't');
    await waitFor(() => {
      expect(utils.chgEmailButton).toBeDisabled();
    });
    userEvent.click(utils.resetButton);
    await waitFor(() => {
      expect(utils.newEmailInput).toHaveValue('');
    });

    // put in correct email to get to verification page
    userEvent.type(utils.newEmailInput, 'test@mock.com');
    await waitFor(() => {
      expect(utils.chgEmailButton).toBeEnabled();
    });
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(utils.getByTestId('verifyInput')).toBeVisible();
    });

    // put in bad verifcation code
    userEvent.type(utils.getByTestId('verifyInput'), '123');
    await waitFor(() => {
      expect(utils.verifyButton).toBeDisabled();
    });

    userEvent.click(utils.cancelButton);
    await waitFor(() => {
        expect(handleDialogClose).toHaveBeenCalledWith('email');
    });

    const utilsVer = render(myverifytest);
    // resend code
    userEvent.click(utilsVer.getByRole('button', {name: /send code/i}));
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Code Sent`, {variant: 'success'});
    });

  }, 30000);

  it("handles userattrib and resendcode rejects from Auth", async () => {
    const prevAuthUpdUsrAttrib = Auth.updateUserAttributes;
    Auth.updateUserAttributes = jest.fn(() => Promise.reject('mockrejected userattrib'));

    const prevAuthVerUsrAttrib = Auth.verifyCurrentUserAttribute;
    Auth.verifyCurrentUserAttribute = jest.fn(() => Promise.reject('mockrejected verifyattrib'));

    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());

    const utils = mySetup();

    // put in correct email to get to verification page
    userEvent.type(utils.newEmailInput, 'test@mock.com');
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Failed to send code`, {variant: 'error'});
    });

    userEvent.click(utils.cancelButton);
    await waitFor(() => {
        expect(handleDialogClose).toHaveBeenCalledWith('email');
    });

    // re-render with verify-only set
    const utilsVer = render(myverifytest);
    // resend code
    userEvent.click(utilsVer.getByRole('button', {name: /send code/i}));
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Failed to resend code`, {variant: 'error'});
    });


    Auth.updateUserAttributes = prevAuthUpdUsrAttrib;
    Auth.verifyCurrentUserAttribute = prevAuthVerUsrAttrib;

    expect(consoleWarnFn).toHaveBeenCalledTimes(2);
    consoleWarnFn.mockRestore();
  }, 20000);

  it("handles reject submit", async () => {
    const prevAuthVerAttrSub = Auth.verifyCurrentUserAttributeSubmit;
    Auth.verifyCurrentUserAttributeSubmit = jest.fn(() => Promise.reject('mockrejected verifysubmit'));

    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());

    const utils = mySetup();

    // put in correct email to get to verification page
    userEvent.type(utils.newEmailInput, 'test@mock.com');
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Verification code sent`, {variant: 'success'});
    });

    userEvent.type(utils.getByTestId('verifyInput'), '123456');
    expect(utils.verifyButton).toBeEnabled();
    userEvent.click(utils.verifyButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenLastCalledWith(`Verification failed`, {variant: 'error'});
    });

    Auth.verifyCurrentUserAttributeSubmit = prevAuthVerAttrSub;
    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleWarnFn.mockRestore();
  }, 20000);

});
