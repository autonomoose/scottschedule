import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { ModifyEvent } from '../../components/eventsutil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();
const mockEvents = {testevt: {descr: 'testing', schedRules: ["begin +2,++2,++2"]}};

const mytest = <ModifyEvent evid='testevt' tasks={mockEvents} onComplete={mockCallback} open={true} />;
const mySetup = () => {
    const utils = render(mytest);
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const descrFld = utils.getByTestId('descrInput');
    const newRuleButton = utils.getByRole('button', {name: /new rule/i});

    return {
        ...utils,
        resetButton,
        saveButton,
        descrFld,
        newRuleButton,
    }
};

describe("eventsutil - modify", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
    expect(utils.newRuleButton).toBeEnabled();
  });

  it("enables reset and save after descr modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after descr modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.descrFld, 'new descr');
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

    userEvent.type(utils.descrFld, 'new desc');
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

    userEvent.type(utils.descrFld, 'new desc');
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
  // delete empty events
  it("shows delete option on events wo rules", () => {
    const specEvents = {testevt: {descr: 'testing', schedRules: []}};
    const spectest = <ModifyEvent evid='testevt' tasks={specEvents} onComplete={mockCallback} open={true} />;
    const utils = render(spectest);

    const delButton = utils.getByTestId('del-testevt');
    expect(delButton).toBeEnabled();
  });
  it("deletes events wo rules", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;

    const specEvents = {testevt: {descr: 'testing', schedRules: []}};
    const spectest = <ModifyEvent evid='testevt' tasks={specEvents} onComplete={mockCallback} open={true} />;
    const utils = render(spectest);

    const delButton = utils.getByTestId('del-testevt');
    userEvent.click(delButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testevt');
    });
    API.graphql = prevAPIgraphql;
  });
  it("handles grapql error on delete", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;

    const specEvents = {testevt: {descr: 'testing', schedRules: []}};
    const spectest = <ModifyEvent evid='testevt' tasks={specEvents} onComplete={mockCallback} open={true} />;
    const utils = render(spectest);

    const delButton = utils.getByTestId('del-testevt');
    userEvent.click(delButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });

});


