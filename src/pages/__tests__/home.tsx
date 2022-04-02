import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import HomePage from "../home";

// needs mocks for DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
jest.unmock('../../components/schedbuttons');

jest.mock('../../components/eventsutil', () => ({
    fetchEventsDB: jest.fn(() => Promise.resolve(
      {testev: {descr: 'testing',
        schedRules: [
          "begin +2,++2,++2",
        ]}})),
}));

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve( {
      default: {descr: 'test group',
        schedNames: [{
          begins: 'now',
          buttonName: 'test1',
          descr: 'test sched',
          schedName: 'testsched',
          schedTasks: [{evTaskId: 'testev'}],
      }]},
      test2: {descr: 'test2 group',
        schedNames: [{
          begins: 'now',
          buttonName: 'test2',
          descr: 'test2 sched',
          schedName: 'testsched',
          schedTasks: [{evTaskId: 'testev'}],
      }]},
      })),
}));

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));

Date.now = jest.fn(() => 1482363367071);

const mytest = <HomePage />;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    const groupInput = utils.getByTestId(/schedgroup/i);
    const groupInputChg = (myvalue: string) => {
        fireEvent.change(groupInput, { target: { value: myvalue } });
    };
    return {
        ...utils,
        groupInput,
        groupInputChg,
    }
}

describe("HomePage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("changes clocks with click", async () => {
      const utils = await mySetup();

      userEvent.click(utils.getByTestId('change clock'));
      await waitFor(() => {
        expect(utils.getByRole('button', {name: /scheduler/i})).toBeVisible();
      });

      userEvent.click(utils.getByTestId('change clock'));
      await waitFor(() => {
        expect(utils.getByRole('button', {name: /scheduler/i})).toBeVisible();
      });

      userEvent.click(utils.getByRole('button', {name: /scheduler/i}));
      await waitFor(() => {
        expect(utils.getByTestId('clock-scheduler')).toBeVisible();
      });
  });
  it("starts and stops scheduler", async () => {
    const utils = await mySetup();
    userEvent.click(utils.getByRole('button', {name: /test1/i}));

    // handles multiple presses
    userEvent.click(utils.getByRole('button', {name: /test1/i}));

    userEvent.click(utils.getByRole('button', {name: /off/i}));
    expect(mockEnqueue).toHaveBeenLastCalledWith(`scheduler off`, {variant: 'info', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});
  });

  it("changes group to test2", async () => {
    const utils = await mySetup();
    expect(utils.groupInput).toHaveValue('default');

    utils.groupInputChg('test2');
    await waitFor(() => {
      expect(utils.groupInput).toHaveValue('test2');
    });
  });

  it("stops scheduler with group change", async () => {
    const utils = await mySetup();
    userEvent.click(utils.getByRole('button', {name: /test1/i}));

    utils.groupInputChg('test2');
    await waitFor(() => {
      expect(utils.groupInput).toHaveValue('test2');
    });
    expect(mockEnqueue).toHaveBeenLastCalledWith(`scheduler canceled`, {variant: 'info', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});

  });

  it("changes options", async () => {
    const utils = await mySetup();
    userEvent.click(utils.getByRole('button', {name: /tomorrow/i}));
  });

  it("restarts active schedule when changes options", async () => {
    const utils = await mySetup();
    userEvent.click(utils.getByRole('button', {name: /test1/i}));

    userEvent.click(utils.getByRole('button', {name: /tomorrow/i}));
  });

});
