import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { UserDelDialog } from '../userutil';
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

const handleDialogClose = jest.fn();
const mytest = <UserDelDialog dialogOpen={true} dialogClose={handleDialogClose}/>

describe("userutil user delete", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("exits correctly", async () => {
    const {getByText} = render(mytest);
    await userEvent.click(getByText(/Cancel/i));
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });
  });

  it("submits correctly", async () => {
    const {getByRole} = render(mytest);
    const delButton = getByRole('button', {name: /delete/i});
    await userEvent.click(delButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });
  });

  it("handles Auth reject", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const {getByRole} = render(mytest);
    const delButton = getByRole('button', {name: /delete/i});

    const spy = jest.spyOn(Auth, 'currentAuthenticatedUser')
      .mockImplementation(() => Promise.reject('mock reject'));

    await userEvent.click(delButton);
    await waitFor(() => {
      expect(handleDialogClose).toHaveBeenCalledWith();
    });

    expect(consoleWarnFn).toHaveBeenCalledTimes(1);

    spy.mockRestore();
    consoleWarnFn.mockRestore();
  });

});
