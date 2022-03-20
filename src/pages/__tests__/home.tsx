import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import HomePage from "../home";

// needs mocks for DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
jest.mock('../../components/schedbuttons', () => ({
    ...jest.requireActual('../../components/schedbuttons'),
    buildButtons: jest.fn(() => Promise.resolve({
      testsched: 'test1',
      })),
    buildOptions: jest.fn(() => Promise.resolve({
      tomorrow: false,
      })),
}));

jest.mock('../../components/eventsutil', () => ({
    fetchEventsDB: jest.fn(() => Promise.resolve(
      {testev: {descr: 'testing',
        schedRules: [
          "begin +2,++2,++2",
        ]}})),
}));

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve(
      {default: {descr: 'test group',
        schedNames: [{
          begins: 'now',
          buttonName: 'test1',
          descr: 'test sched',
          schedName: 'testsched',
          schedTasks: [{evTaskId: 'testev'}],
          }]}
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

    return {
        ...utils,
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
});
