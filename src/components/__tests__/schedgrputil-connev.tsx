import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { ConnectTask } from '../../components/schedgrputil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();

const mytest = <ConnectTask schedName='testgrp' onComplete={mockCallback} open={true} />
const mySetup = () => {
    const utils = render(mytest);
    const canButton = utils.getByRole('button', {name: /cancel/i});
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const taskFld = utils.getByTestId('taskid');

    return {
        ...utils,
        canButton,
        resetButton,
        saveButton,
        taskFld,
    }
};


describe("schedgrputil - connect event", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.canButton).toBeEnabled();
    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
  });
  it("cancels with button", () => {
    const utils = mySetup();

    userEvent.click(utils.canButton);
    expect(mockCallback).toHaveBeenLastCalledWith('_testgrp');
  });

  it("enables reset and save after event name modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after event modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
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
    API.graphql = jest.fn(() => Promise.reject('mockreject'));
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
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
    API.graphql = jest.fn(() => Promise.resolve({}));
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp');
    });
    API.graphql = prevAPIgraphql;
  });

});


