import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { CreateRule } from '../../components/eventsutil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();

const mytest = <CreateRule evName='testevt' onComplete={mockCallback} open={true} />;
const mySetup = () => {
    const utils = render(mytest);
    const canButton = utils.getByRole('button', {name: /cancel/i});
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const ruleFld = utils.getByTestId('contentRule');

    return {
        ...utils,
        canButton,
        resetButton,
        saveButton,
        ruleFld,
    }
};

describe("eventsutil - newrule", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.canButton).toBeEnabled();
    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
  });
  it("cancels with button", async () => {
    const utils = mySetup();

    userEvent.click(utils.canButton);
    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('');
    });
  });

  it("enables reset and save after rule modification", async () => {
    const utils = mySetup();

    await userEvent.type(utils.ruleFld, '+2');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after rule modification", async () => {
    const utils = mySetup();

    await userEvent.type(utils.ruleFld, '+2');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    userEvent.click(utils.resetButton);
    await waitFor(() => {
      expect(utils.resetButton).toBeDisabled();
    });
  });
  it("handles graphql error on save", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = mySetup();

    await userEvent.type(utils.ruleFld, '+2');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    await userEvent.type(utils.ruleFld, '+2');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testevt');
    });
    API.graphql = prevAPIgraphql;
  });

});


