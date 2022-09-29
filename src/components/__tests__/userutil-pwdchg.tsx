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
const mySetup = async () => {
    const user = userEvent.setup();
    const utils = render(mytest);

    const oldPassInput = utils.getByTestId('oldPassInput');
    const newPassInput = utils.getByTestId('newPassInput');
    const confPassInput = utils.getByTestId('confPassInput');

    const canButton = utils.getByRole('button', {name: /cancel/i});
    const chgButton = utils.getByRole('button', {name: /change password/i});
    await waitFor(() => {
      expect(oldPassInput).toBeEnabled();
    });

    return {
        ...utils,
        oldPassInput,
        newPassInput,
        confPassInput,
        canButton,
        chgButton,
        user,
    }
}

describe("userutil password chg", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("exits correctly", async () => {
    const utils = await mySetup();

    await utils.user.click(utils.canButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });
  });

  it("submits with inputs filled", async () => {
    const utils = await mySetup();

    expect(utils.chgButton).toBeDisabled();

    await utils.user.type(utils.oldPassInput, 'oldpass8');
    await utils.user.type(utils.newPassInput, 'newpass8');
    await utils.user.type(utils.confPassInput, 'newpass8');

    await waitFor(() => {
        expect(utils.chgButton).toBeEnabled();
    });
    await userEvent.click(utils.chgButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });
  });

  it("handles input errors and Auth reject", async () => {
    const utils = await mySetup();

    expect(utils.chgButton).toBeDisabled();

    // enter short newpass (<8)
    await utils.user.type(utils.oldPassInput, 'oldpass8');
    await utils.user.type(utils.newPassInput, 'newpass');
    await utils.user.type(utils.confPassInput, 'newpass');
    await waitFor(() => {
      expect(utils.chgButton).toBeDisabled();
    });


    // newpass not match confpass
    await utils.user.type(utils.newPassInput, 'newpass8');
    await waitFor(() => {
      expect(utils.chgButton).toBeDisabled();
    });

    await utils.user.type(utils.confPassInput, 'newpass8');
    await waitFor(() => {
        expect(utils.chgButton).toBeEnabled();
    });

    const spy = jest.spyOn(Auth, 'currentAuthenticatedUser')
      .mockImplementation(() => Promise.reject('mock reject'));

    await utils.user.click(utils.chgButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });

    spy.mockRestore();
  });

});
