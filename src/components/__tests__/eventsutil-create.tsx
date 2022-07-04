import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { ModifyEvent } from '../../components/eventsutil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();
const mockEvents = {testevt: {descr: 'testing', schedRules: ["begin +2,++2,++2"]}};

const mytest = <ModifyEvent evid='_new' tasks={mockEvents} onComplete={mockCallback} open={true} />;
const mySetup = () => {
    const utils = render(mytest);
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const nameFld = utils.getByTestId('nameInput');
    const descrFld = utils.getByTestId('descrInput');

    return {
        ...utils,
        resetButton,
        saveButton,
        nameFld,
        descrFld,
    }
};

describe("eventsutil - create", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
  });
  it("enables reset and save after name modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after name modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
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

    userEvent.type(utils.nameFld, 'newgrp');
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
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('newgrp');
    });
    API.graphql = prevAPIgraphql;
  });

});


