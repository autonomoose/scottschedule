import React from "react";
import { render } from "@testing-library/react";
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

  it("exits correctly", () => {
    const {getByText} = render(mytest);
    userEvent.click(getByText(/Cancel/i));
    expect(handleDialogClose).toHaveBeenCalledWith();
  });
  it("submits correctly", () => {
    const {getByRole} = render(mytest);
    const delButton = getByRole('button', {name: /delete/i});
    userEvent.click(delButton);
    expect(handleDialogClose).toHaveBeenCalledWith();
  });
  it("handles Auth reject", () => {
    const {getByRole} = render(mytest);
    const delButton = getByRole('button', {name: /delete/i});

    const spy = jest.spyOn(Auth, 'currentAuthenticatedUser')
      .mockImplementation(() => Promise.reject('mock reject'));

    userEvent.click(delButton);
    expect(handleDialogClose).toHaveBeenCalledWith();

    spy.mockRestore();
  });

});
