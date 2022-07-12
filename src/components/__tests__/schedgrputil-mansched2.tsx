import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

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
const mockEvList = ['ev1','ev2'];

const mytest = <ManSched evList={mockEvList} groupSchedName='testgrp!testsched' gSchedule={testSched} onComplete={mockCallback} open={true} />
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

describe("schedgrputil - mansched opens and ", () => {
  it("handles invalid button name", async () => {
    const utils = mySetup();
    const editButton = utils.getByTestId('buttonEdit');

    await userEvent.click(editButton);
    const inputFld = utils.getByTestId('buttonInput');

    await userEvent.type(inputFld, 'new text but way way too long');
    await waitFor(() => {
      expect(utils.saveButton).toBeEnabled();
    });

    await userEvent.click(utils.saveButton);
    await waitFor(() => {
      expect(utils.getByText(/8 char max/i)).toBeVisible();
    });
    await userEvent.clear(inputFld);

    const propCancel = utils.getByTestId('closeBname');
    await userEvent.click(propCancel);

    await waitFor(() => {
      expect(inputFld).not.toBeVisible();
    });
  });
  it("handles start - begin name", async () => {
    const utils = mySetup();
    const editButton = utils.getByTestId('startEdit');
    await userEvent.click(editButton);
    const inputFld = utils.getByTestId('beginsInput');
    await waitFor(() => {
      expect(inputFld).toBeVisible();
    });


    await userEvent.type(inputFld, 'newtextbuwaywaytoolong1234567890123456789012345678901234567890');
    await waitFor(() => {
      expect(utils.saveButton).toBeEnabled();
    });

    await userEvent.click(utils.saveButton);
    await waitFor(() => {
      expect(utils.getByText(/50 char max/i)).toBeVisible();
    });
    await userEvent.clear(inputFld);

    const propCancel = utils.getByTestId('startCancel');
    await userEvent.click(propCancel);

    await waitFor(() => {
      expect(inputFld).not.toBeVisible();
    });

  });
  it("handles finish - chain", async () => {
    const utils = mySetup();
    const editButton = utils.getByTestId('endEdit');
    await userEvent.click(editButton);
    const inputFld = utils.getByTestId('chainInput');
    await waitFor(() => {
      expect(inputFld).toBeVisible();
    });

    await userEvent.type(inputFld, 'newtextbuwaywaytoolong1234567890123456789012345678901234567890');
    await waitFor(() => {
      expect(utils.saveButton).toBeEnabled();
    });

    await userEvent.click(utils.saveButton);
    await waitFor(() => {
      expect(utils.getByText(/40 char max/i)).toBeVisible();
    });
    await userEvent.clear(inputFld);

    const propCancel = utils.getByTestId('endCancel');
    await userEvent.click(propCancel);

    await waitFor(() => {
      expect(inputFld).not.toBeVisible();
    });

  });
  it("handles default-clock", async () => {
    const utils = mySetup();
    const editButton = utils.getByTestId('defaultEdit');
    await userEvent.click(editButton);
    const inputFld = utils.getByTestId('clockInput');
    await waitFor(() => {
      expect(inputFld).toBeVisible();
    });

    await userEvent.type(inputFld, 'newtextbuwaywaytoolong1234567890123456789012345678901234567890');
    await waitFor(() => {
      expect(utils.saveButton).toBeEnabled();
    });

    await userEvent.click(utils.saveButton);
    await waitFor(() => {
      expect(utils.getByText(/10 char max/i)).toBeInTheDocument();
    });
    await userEvent.clear(inputFld);

    const soundFld = utils.getByTestId('soundInput');
    await userEvent.type(soundFld, 'newtextbuwaywaytoolong1234567890123456789012345678901234567890');
    await waitFor(() => {
      expect(utils.getByText(/20 char max/i)).toBeVisible();
    });
    await userEvent.clear(soundFld);

    const sRepeatFld = utils.getByTestId('soundRepeatInput');
    await userEvent.type(sRepeatFld, 'newtextbuwaywaytoolong');
    await waitFor(() => {
      expect(utils.getByText(/less than 100/i)).toBeVisible();
    });

    await userEvent.clear(sRepeatFld);
    const warnFld = utils.getByTestId('warnInput');
    await userEvent.type(warnFld, 'newtextbuwaywaytoolong12345678901234567890');
    await waitFor(() => {
      expect(utils.getByText(/20 char max/i)).toBeVisible();
    });
    await userEvent.clear(warnFld);

    const propCancel = utils.getByTestId('defaultCancel');
    userEvent.click(propCancel);

    await waitFor(() => {
      expect(inputFld).not.toBeVisible();
    });
  });
});


