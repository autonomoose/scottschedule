/*
usermaint
 contains mocks for userutil components
 - MockEmailChgDialog (MockEmailChgDialogProps)
 - PasswordChgDialog
 - UserDelDialog
*/
import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import UserMaintPage from "../usermaint";
import { EmailChgVerDialog, PasswordChgDialog, UserDelDialog } from '../../components/userutil';

import { Auth } from "aws-amplify"
jest.mock('aws-amplify');

interface MockEmailChgDialogProps {
    dialogOpen: boolean,
    dialogClose: (arg0:string) => void,
}
const MockEmailChgDialog = (props: MockEmailChgDialogProps) => {
    const {dialogOpen, dialogClose} = props;
    const handleCancel = () => {
        dialogClose('');
    };
    const handleChanged = () => {
        dialogClose('email');
    };
    const handleVerify = () => {
        dialogClose('ver');
    };
    return(
        <Dialog onClose={handleCancel} aria-labelledby="namedialog-title" open={dialogOpen}>
        <div>Hidden dialog
          { (dialogOpen) &&
              <>
              <div data-testid="mockdialog">Open</div>
              <Button onClick={handleCancel} color="secondary" variant="outlined">
                Dialog Cancel
              </Button>
              <Button onClick={handleChanged} color="secondary" variant="outlined">
                Dialog Change
              </Button>
              <Button onClick={handleVerify} color="secondary" variant="outlined">
                Dialog Verify
              </Button>
              </>
          }
        </div>
        </Dialog>
        );
};

jest.mock('../../components/userutil', () => ({
    __esModule: true,
    default: jest.fn(),
    EmailChgVerDialog: jest.fn(),
    PasswordChgDialog: jest.fn(),
    UserDelDialog: jest.fn(),
}));

beforeAll(() => {
  (EmailChgVerDialog as jest.Mock).mockImplementation(MockEmailChgDialog);
  (PasswordChgDialog as jest.Mock).mockImplementation(MockEmailChgDialog);
  (UserDelDialog as jest.Mock).mockImplementation(MockEmailChgDialog);
});


const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));

// local test helpers
//
const mytest = <UserMaintPage />;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('mainPageDisplay')).toBeVisible();
    });
    const chgEmailButton = utils.getByRole('button', {name: /change email/i});
    const chgPwdButton = utils.getByRole('button', {name: /change password/i});
    const prevAuthAttrib = Auth.userAttributes;

    return {
        ...utils,
        chgEmailButton,
        chgPwdButton,
        prevAuthAttrib,
    }
}

describe("UserMaintPage", () => {
  it("renders snapshot correctly", async () => {
    const {asFragment, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('mainuser')).toBeVisible();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("opens and closes change dialogs as primary", async () => {
    const utils = await mySetup();

    // open change password and cancel
    expect(utils.chgPwdButton).toBeEnabled();
    userEvent.click(utils.chgPwdButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });
    userEvent.click(utils.getByRole('button', {name: /cancel/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

    // open change email and cancel
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });
    userEvent.click(utils.getByRole('button', {name: /cancel/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

    // click on close account and then cancel
    userEvent.click(utils.getByRole('button', {name: /close account/i}));
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });

    userEvent.click(utils.getByRole('button', {name: /cancel/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

  }, 60000);

  it("checks change email submit", async () => {
    const utils = await mySetup();

    // open change email and click change
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });

    userEvent.click(utils.getByRole('button', {name: /change/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

  }, 30000);

  it("checks verify email submit", async () => {
    // @ts-expect-error: until aws-amplify gets formal typing
    Auth.userAttributes = jest.fn(() => Promise.resolve([
        {Name: 'sub', Value: 'test'},
        {Name: 'email_verified', Value: 'false'},
        {Name: 'email', Value: 'testuser1@test.com'},
        {Name: 'custom:tenant', Value: 'test'},
        {Name: 'phone_number_verified', Value: 'false'},
        {Name: 'phone_number', Value: '111'},
      ]));

    const utils = await mySetup();
    // open change email and click verify
    expect(utils.chgEmailButton).toBeEnabled();
    userEvent.click(utils.chgEmailButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });

    userEvent.click(utils.getByRole('button', {name: /verify/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

    Auth.userAttributes = utils.prevAuthAttrib;
  }, 30000);

  it("checks re-verify email submit", async () => {
    const prevAuthAttrib = Auth.userAttributes;
    // @ts-expect-error: until aws-amplify gets formal typing
    Auth.userAttributes = jest.fn(() => Promise.resolve([
        {Name: 'sub', Value: 'test'},
        {Name: 'email_verified', Value: 'false'},
        {Name: 'email', Value: 'testuser1@test.com'},
        {Name: 'custom:tenant', Value: 'test'},
        {Name: 'phone_number_verified', Value: 'false'},
        {Name: 'phone_number', Value: '111'},
      ]));

    const utils = await mySetup();
    // open change email and click change
    const verButton = utils.getByRole('button', {name: /verify email/i});
    userEvent.click(verButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });

    userEvent.click(utils.getByRole('button', {name: /change/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

    Auth.userAttributes = prevAuthAttrib;
  }, 15000);

  it("opens and closes del user as secondary", async () => {
    // @ts-expect-error: until aws-amplify gets formal typing
    Auth.userAttributes = jest.fn(() => Promise.resolve([
      {Name: 'sub', Value: 'test'},
      {Name: 'email_verified', Value: 'true'},
      {Name: 'email', Value: 'testuser1@test.com'},
      {Name: 'custom:tenant', Value: 'different'},
    ]));

    const utils = await mySetup();

    const delUserButton = utils.getByRole('button', {name: /delete user/i});
    expect(delUserButton).toBeEnabled();
    userEvent.click(delUserButton);
    await waitFor(() => {
        expect(utils.getByTestId('mockdialog')).toBeVisible();
    });

    userEvent.click(utils.getByRole('button', {name: /cancel/i}));
    await waitFor(() => {
        utils.getByRole('main');
    });

    Auth.userAttributes = utils.prevAuthAttrib;
  }, 15000);

  it("handles a thrown error on userAttributes", async () => {
    Auth.userAttributes = jest.fn(() => Promise.reject('mockfailed userAttribute'));

    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const utils = await mySetup();

    Auth.userAttributes = utils.prevAuthAttrib;

    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleWarnFn.mockRestore();
  }, 10000);

});
