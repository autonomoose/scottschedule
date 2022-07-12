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
const testSchedEmpties = {
    begins: '',
    buttonName: '',
    descr: '',
    schedName: 'testsched',
    schedTasks: [],
    sound: {name: '', repeat: 2},
    warn: {sound: {name: ''}},
};
const testSchedFull = {
    begins: '8:00,8:30,9:00',
    buttonName: '_same_',
    descr: 'full',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
    sound: {name: 'bigbell', repeat: 2},
    warn: {sound: {name: '_default_'}},
    chain: 'testsched',
    clock: 'digital1',
};

const mockEvList = ['ev1','ev2'];

const mytest = <ManSched evList={mockEvList} groupSchedName='testgrp!testsched' gSchedule={testSched} onComplete={mockCallback} open={true} />
const myNewTest = <ManSched evList={mockEvList} groupSchedName='testgrp!_NEW_' gSchedule={testSched} onComplete={mockCallback} open={true} />
const myEmptyTest = <ManSched evList={mockEvList} groupSchedName='testgrp!testsched' gSchedule={testSchedEmpties} onComplete={mockCallback} open={true} />
const myFullTest = <ManSched evList={mockEvList} groupSchedName='testgrp!testsched' gSchedule={testSchedFull} onComplete={mockCallback} open={true} />
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
  it("starts in _NEW_ mode - custom setup", () => {
    const utils = render(myNewTest);

    expect(utils.container.firstChild).toMatchSnapshot();
  });
  it("handles fields filled - custom setup", async () => {
    const utils = render(myFullTest);
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it("handles empties - custom setup", async () => {
    const utils = render(myEmptyTest);

    expect(utils.container.firstChild).toMatchSnapshot();
    // click to delete should be enabled
    const delButton = utils.getByTestId('delSched');

    expect(delButton).toBeEnabled();
    await userEvent.click(delButton);
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
    expect(utils.newEvButton).toBeEnabled();
  });
  it("cancels with upper right x button", async () => {
    const utils = mySetup();

    await userEvent.click(utils.canButton);
    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('');
    });
  });

  it("enables reset and save after descr modification", async () => {
    const utils = mySetup();

    await userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after descr modification", async () => {
    const utils = mySetup();

    await userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    await userEvent.click(utils.resetButton);
    await waitFor(() => {
      expect(utils.resetButton).toBeDisabled();
    });
  });

  it("handles graphql error on save", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = mySetup();

    await userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    await userEvent.click(utils.saveButton);

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

    await userEvent.type(utils.descrFld, 'test desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    await userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp!testsched');
    });
    API.graphql = prevAPIgraphql;
  });

  /* field edits */
  it("handles error after invalid name mod on _NEW_ ", async () => {
    const utils = render(myNewTest); // none of the presets defined!
    const saveButton = utils.getByRole('button', {name: /save/i});

    const nameFld = utils.getByTestId('schedNameInput');
    await userEvent.type(nameFld, 'newdescbutwaywaytoolong');

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(utils.getByText(/20 char max/i)).toBeVisible();
    });
  });

  it("handles error after invalid descr mod", async () => {
    const utils = mySetup();

    await userEvent.type(utils.descrFld, 'new desc but way way too long');
    await waitFor(() => {
      expect(utils.saveButton).toBeEnabled();
    });

    await userEvent.click(utils.saveButton);
    await waitFor(() => {
      expect(utils.getByText(/20 char max/i)).toBeVisible();
    });
  });

  /* events */
  it("handles event disconnect", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    await userEvent.click(utils.getByTestId('dconn-testev'));

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp!testsched');
    });

    API.graphql = prevAPIgraphql;
  });
  it("handles add event", async () => {
    const utils = mySetup();
    await userEvent.click(utils.newEvButton);
    await waitFor(() => {
      expect(utils.getByTestId('evCancel')).toBeEnabled();
    });
    await userEvent.click(utils.getByTestId('evCancel'));
    await waitFor(() => {
      expect(utils.getByTestId('evCancel')).not.toBeVisible();
    });
  });

});


