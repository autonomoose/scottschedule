import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { PasswordChgDialog } from '../userutil';
import { Auth } from 'aws-amplify';

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

// local test helpers
//
const handleDialogClose = jest.fn();
const mytest = <PasswordChgDialog dialogOpen={true} dialogClose={handleDialogClose} />;

/// form has 3 input fields, 2 buttons
///   password, new password, confirm new password
///   change password, cancel
const mySetup = () => {
    const utils = render(mytest);

    const oldPassInput = utils.getByTestId('oldPassInput');
    const newPassInput = utils.getByTestId('newPassInput');
    const confPassInput = utils.getByTestId('confPassInput');

    const canButton = utils.getByRole('button', {name: /cancel/i});
    const chgButton = utils.getByRole('button', {name: /change password/i});

    return {
        ...utils,
        oldPassInput,
        newPassInput,
        confPassInput,
        canButton,
        chgButton,
    }
}

describe("userutil password chg", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("exits correctly", () => {
    const utils = mySetup();

    userEvent.click(utils.canButton);
    expect(handleDialogClose).toHaveBeenCalledWith();
  });

  it("submits with inputs filled", async () => {
    const utils = mySetup();

    expect(utils.chgButton).toBeDisabled();

    userEvent.type(utils.oldPassInput, 'oldpass8');
    userEvent.type(utils.newPassInput, 'newpass8');
    userEvent.type(utils.confPassInput, 'newpass8');

    await waitFor(() => {
        expect(utils.chgButton).toBeEnabled();
    });

    userEvent.click(utils.chgButton);
    expect(handleDialogClose).toHaveBeenCalledWith();
  });

  it("handles input errors and Auth reject", async () => {
    const utils = mySetup();

    expect(utils.chgButton).toBeDisabled();

    // enter short newpass (<8)
    userEvent.type(utils.oldPassInput, 'oldpass8');
    userEvent.type(utils.newPassInput, 'newpass');
    userEvent.type(utils.confPassInput, 'newpass');
    expect(utils.chgButton).toBeDisabled();

    // newpass not match confpass
    userEvent.type(utils.newPassInput, 'newpass8');
    expect(utils.chgButton).toBeDisabled();

    userEvent.type(utils.confPassInput, 'newpass8');
    await waitFor(() => {
        expect(utils.chgButton).toBeEnabled();
    });

    const spy = jest.spyOn(Auth, 'currentAuthenticatedUser')
      .mockImplementation(() => Promise.reject('mock reject'));

    userEvent.click(utils.chgButton);
    expect(handleDialogClose).toHaveBeenCalledWith();

    spy.mockRestore();
  });

});
