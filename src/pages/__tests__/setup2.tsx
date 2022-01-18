import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { API } from 'aws-amplify';
import SetupStep2Page from "../setup2";

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

const mytest = <SetupStep2Page />;
describe("SetupStep2Page", () => {
  it("renders snapshot correctly", async () => {
    const {container} = render(mytest);
    await waitFor(() => {
        expect(screen.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
  it("calls API correctly", async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation(() => Promise.resolve({'Response': 'completed'}));

    const acceptBox = utils.getByRole('checkbox', {name: /acceptbox/i});
    const submitButton = utils.getByRole('button', {name: /submit/i});
    expect(submitButton).toBeDisabled();

    userEvent.click(acceptBox);

    expect(submitButton).toBeEnabled();
    userEvent.click(submitButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledTimes(1);
    });
    // utils.debug(utils.getByRole('main'));

    spy.mockRestore();
  });

  it("calls API correctly w/ bad response", async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation(() => Promise.resolve({'Response': 'uncompleted'}));

    const acceptBox = utils.getByRole('checkbox', {name: /acceptbox/i});
    const submitButton = utils.getByRole('button', {name: /submit/i});
    expect(submitButton).toBeDisabled();

    userEvent.click(acceptBox);

    expect(submitButton).toBeEnabled();
    userEvent.click(submitButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledTimes(2);
    });
    // utils.debug(utils.getByRole('main'));

    spy.mockRestore();
  });
  it("calls API correctly but throws error", async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation((_apiname, _funname, _funparms) => Promise.reject({'Response': 'completed'}));

    const acceptBox = utils.getByRole('checkbox', {name: /acceptbox/i});
    const submitButton = utils.getByRole('button', {name: /submit/i});
    expect(submitButton).toBeDisabled();

    userEvent.click(acceptBox);

    expect(submitButton).toBeEnabled();
    userEvent.click(submitButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledTimes(3);
    });
    // utils.debug(utils.getByRole('main'));

    spy.mockRestore();
  });

  it("makes sure stupid box is checked", async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation(() => Promise.resolve({'Response': 'completed'}));

    const acceptBox = utils.getByRole('checkbox', {name: /acceptbox/i});
    const submitButton = utils.getByRole('button', {name: /submit/i});
    expect(submitButton).toBeDisabled();

    userEvent.click(acceptBox);

    expect(submitButton).toBeEnabled();
    userEvent.click(acceptBox);
    userEvent.click(submitButton);
    await waitFor(() => {
        expect(utils.getByRole('alert')).toBeVisible();
    });

    spy.mockRestore();
  });

});
