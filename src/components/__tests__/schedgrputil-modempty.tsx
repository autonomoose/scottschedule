import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { ModifyGroup } from '../../components/schedgrputil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();
const testSchedGroup = {
    name: 'testgrp',
    descr: 'test group',
    schedNames: [],
};

const mytest = <ModifyGroup group='testgrp' groupSched={testSchedGroup} onComplete={mockCallback} open={true} />
const mySetup = () => {
    const utils = render(mytest);
    const resetButton = utils.getByRole('button', {name: /reset/i});
    const saveButton = utils.getByRole('button', {name: /save/i});
    const descrFld = utils.getByTestId('descrInput');
    const newButton = utils.getByRole('button', {name: /new schedule/i});
    const delButton = utils.getByTestId('delete');

    return {
        ...utils,
        resetButton,
        saveButton,
        descrFld,
        newButton,
        delButton,
    }
};

describe("schedgrputil - modify empty group", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
    expect(utils.newButton).toBeEnabled();
    expect(utils.delButton).toBeEnabled();
  });

  it("handles graphql error on delete", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = mySetup();

    userEvent.click(utils.delButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });
  it("handles delete", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.click(utils.delButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp');
    });
    API.graphql = prevAPIgraphql;
  });

});


