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
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('mainPageDisplay')).toBeVisible();
    });
    // utils.debug();
    const acceptBox = utils.getByRole('checkbox', {name: /acceptbox/i});
    const submitButton = utils.getByRole('button', {name: /submit/i});
    return {
        ...utils,
        acceptBox,
        submitButton,

    }
}

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
    const utils = await mySetup();
    expect(utils.submitButton).toBeDisabled();

    userEvent.click(utils.acceptBox);
    await waitFor(() => {
        expect(utils.submitButton).toBeEnabled();
    });

    const spy = jest.spyOn(API, 'post')
     .mockImplementation(() => Promise.resolve({'Response': 'completed'}));
    userEvent.click(utils.submitButton);
    await waitFor(() => {
       expect(mockEnqueue).toHaveBeenCalledTimes(1);
    });

    spy.mockRestore();
  }, 10000);

  it("calls API correctly w/ bad response", async () => {
    const utils = await mySetup();
    expect(utils.submitButton).toBeDisabled();

    userEvent.click(utils.acceptBox);
    await waitFor(() => {
        expect(utils.submitButton).toBeEnabled();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation(() => Promise.resolve({'Response': 'uncompleted'}));
    const consoleLogFn = jest.spyOn(console, 'log').mockImplementation(() => jest.fn());

    userEvent.click(utils.submitButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledTimes(2);
    });

    consoleLogFn.mockRestore();
    spy.mockRestore();
  }, 10000);

  it("calls API correctly but throws error", async () => {
    const utils = await mySetup();
    expect(utils.submitButton).toBeDisabled();

    userEvent.click(utils.acceptBox);
    await waitFor(() => {
        expect(utils.submitButton).toBeEnabled();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation((_apiname, _funname, _funparms) => Promise.reject({'Response': 'throw reject'}));
    const consoleLogFn = jest.spyOn(console, 'log').mockImplementation(() => jest.fn());

    userEvent.click(utils.submitButton);
    await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledTimes(3);
    });

    consoleLogFn.mockRestore();
    spy.mockRestore();
  }, 10000);

  it("makes sure stupid box is checked", async () => {
    const utils = await mySetup();
    expect(utils.submitButton).toBeDisabled();

    userEvent.click(utils.acceptBox);
    await waitFor(() => {
        expect(utils.submitButton).toBeEnabled();
    });

    const spy = jest.spyOn(API, 'post')
      .mockImplementation(() => Promise.resolve({'Response': 'completed'}));

    userEvent.click(utils.acceptBox);
    userEvent.click(utils.submitButton);
    await waitFor(() => {
        expect(utils.getByRole('alert')).toBeVisible();
    });

    spy.mockRestore();
  }, 10000);

});
