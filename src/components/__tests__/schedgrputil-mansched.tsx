import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { ManSched } from '../../components/schedgrputil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();
const testSched = {
    begins: 'now',
    buttonName: 'test1',
    descr: 'test sched',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
};

const mytest = <ManSched groupSchedName='testgrp!testsched' gSchedule={testSched} onComplete={mockCallback} open={true} />
const mySetup = () => {
    const utils = render(mytest);
    const canButton = utils.getByTestId('cancel');
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const descrFld = utils.getByTestId('descrInput');
    const newEvButton = utils.getByRole('button', {name: /add event/i});

    return {
        ...utils,
        canButton,
        resetButton,
        saveButton,
        descrFld,
        newEvButton,
    }
};

describe("schedgrputil - mansched", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
    expect(utils.newEvButton).toBeEnabled();
  });
  it("cancels with upper right x button", () => {
    const utils = mySetup();

    userEvent.click(utils.canButton);
    expect(mockCallback).toHaveBeenLastCalledWith('');
  });

  it("enables reset and save after descr modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after descr modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.descrFld, 'test desc');
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

    userEvent.type(utils.descrFld, 'test desc');
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
  it("handles save after descr modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp!testsched');
    });
    API.graphql = prevAPIgraphql;
  });
  it("handles event disconnect", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.click(utils.getByTestId('dconn-testev'));

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp!testsched');
    });
    API.graphql = prevAPIgraphql;
  });


});


