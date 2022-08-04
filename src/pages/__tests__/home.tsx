import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { fetchSchedGroupsDB } from '../../components/schedgrputil';
import { fetchEventsDB } from '../../components/eventsutil';
import HomePage from "../home";

jest.useFakeTimers();

const mockNow = 1482363367071; //  6:36 PM
Date.now = jest.fn(() => mockNow);
window.HTMLMediaElement.prototype.play = () => Promise.resolve();

// needs mocks for DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
jest.unmock('../../components/schedbuttons');

jest.mock('../../components/eventsutil', () => ({
    fetchEventsDB: jest.fn(() => Promise.resolve(
      {testev: {descr: 'testing',
        schedRules: [
          "begin +2,++2,++2",
        ]}})),
}));

const baseSchedNames = {
    begins: 'now',
    buttonName: 'test1',
    descr: 'test sched',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
};

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve( {
      default: {descr: 'test group', schedNames: [ baseSchedNames, ]},
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

describe("HomePage", () => {
  const mytest = <HomePage />;
  const mySetup = async () => {
      jest.clearAllTimers();
      Date.now = jest.fn(() => mockNow);
      // const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const user = userEvent.setup({delay: null});

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
          user,
      }
  }

  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });
  it("displays a time in the morning", async () => {
      const mockAM = 1482331087071; // 9:38 AM
      Date.now = jest.fn(() => mockAM);
      const utils = render(mytest);
      await waitFor(() => {
          expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
      });
  });
  it("changes clocks with click", async () => {
      const utils = await mySetup();

      await utils.user.click(utils.getByTestId('change clock'));
      await waitFor(() => {
        expect(utils.getByRole('button', {name: /scheduler/i})).toBeVisible();
      });
      await utils.user.click(utils.getByTestId('change clock'));
      await waitFor(() => {
        expect(utils.getByRole('button', {name: /scheduler/i})).toBeVisible();
      });

      await utils.user.click(utils.getByRole('button', {name: /scheduler/i}));
      await waitFor(() => {
        expect(utils.getByTestId('clock-scheduler')).toBeVisible();
      });
  });
  it("changes group to test2", async () => {
    const utils = await mySetup();
    expect(utils.groupInput).toHaveValue('default');

    utils.groupInputChg('test2');
    await waitFor(() => {
      expect(utils.groupInput).toHaveValue('test2');
    });
  });

  it("starts and stops scheduler", async () => {
    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-pending')).toBeVisible();
    });

    // should run pre-alarm and reschedule
    Date.now = jest.fn(() => mockNow + 60000);
    act(() => {jest.runOnlyPendingTimers()});
    expect(utils.getByTestId('ev-pending')).toBeVisible();

    // should fire the current alarm and reschedule
    Date.now = jest.fn(() => mockNow + 120000);
    act(() => {jest.runOnlyPendingTimers()});
    expect(utils.getByTestId('ev-current')).toBeVisible();

    // cleanup and show the next one
    Date.now = jest.fn(() => mockNow + 136000);
    act(() => {jest.runOnlyPendingTimers()});
    expect(utils.getByTestId('ev-pending')).toBeVisible();

    await utils.user.click(utils.getByRole('button', {name: /off/i}));
    expect(mockEnqueue).toHaveBeenLastCalledWith(`scheduler off`, {variant: 'info', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});
  });

  it("stops scheduler with group change", async () => {
    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));

    utils.groupInputChg('test2');
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenLastCalledWith(`scheduler canceled`, {variant: 'info', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});
    });
  });

  it("changes options", async () => {
    const utils = await mySetup();

    const tobutton = utils.getByRole('button', {name: /tomorrow/i})
    expect(tobutton).toBeEnabled();
    await utils.user.click(tobutton);
  });

  it("restarts active schedule when changes options", async () => {
    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));

    await utils.user.click(utils.getByRole('button', {name: /tomorrow/i}));
  });

  // warning - fetchSchedGroupsDB mock changes
  it("starts scheduler with warning schedule", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({
      default: {descr: 'test group',
      schedNames: [ {...baseSchedNames, warn: {sound: {name: 'bigbell'}}, }, ]},
    }));

    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-pending')).toBeVisible();
    });

    // handles multiple presses
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));

    // should run pre-alarm and reschedule
    act(() => {jest.runOnlyPendingTimers()});
    expect(utils.getByTestId('ev-soon')).toBeVisible();

    await utils.user.click(utils.getByRole('button', {name: /silence/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-ack')).toBeVisible();
    });
    act(() => {jest.runOnlyPendingTimers()});

    // await utils.user.click(utils.getByRole('button', {name: /off/i}));
    // expect(mockEnqueue).toHaveBeenLastCalledWith(`scheduler off`, {variant: 'info', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});
  });

  // warning - fetchSchedGroupsDB mock changes
  it("starts scheduler with sound attribs and handles ack", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({
      default: {descr: 'test group',
      schedNames: [ {...baseSchedNames, sound: {name: 'bigbell', repeat: 2,}} ]},
    }));

    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-pending')).toBeVisible();
    });

    // should run event fun before ack
    Date.now = jest.fn(() => mockNow + 10000);
    act(() => {jest.runOnlyPendingTimers()});

    await utils.user.click(utils.getByRole('button', {name: /silence/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-ack')).toBeVisible();
    });

    // run as postevent after ack
    Date.now = jest.fn(() => mockNow + 600000);
    act(() => {jest.runOnlyPendingTimers()});
  });

  it("starts scheduler with quiet sound attribs and chain", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({
      default: {descr: 'test group',
      schedNames: [ {...baseSchedNames, chain: 'test1+tomorrow', sound: {name: '',}} ]},
    }));

    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));
    await waitFor(() => {
      expect(utils.getByTestId('ev-pending')).toBeVisible();
    });

    // should fire the current alarm and reschedule
    Date.now = jest.fn(() => mockNow + 120000);
    act(() => {jest.runOnlyPendingTimers()});
    expect(utils.getByTestId('ev-current')).toBeVisible();

    // run as postevent
    Date.now = jest.fn(() => mockNow + 600000);
    act(() => {jest.runOnlyPendingTimers()});
  });

  it("starts scheduler with expired events", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({
      default: {descr: 'test group',
      schedNames: [ {...baseSchedNames, warn: {sound: {name: '_default_'}}, }, ]},
    }));
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.resolve({
      testev: {descr: 'testing',
        schedRules: [
          "begin 2:00,++2,++2",
        ]}},
    ));

    const utils = await mySetup();
    await utils.user.click(utils.getByRole('button', {name: /test1/i}));
    act(() => {jest.runOnlyPendingTimers()});
    expect(mockEnqueue).toHaveBeenLastCalledWith(`Complete with no future events`, {variant: 'warning',});
  });

});
