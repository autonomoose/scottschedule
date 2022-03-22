import React from "react";
import { render, waitFor } from "@testing-library/react";

import { fetchEventsDB } from '../../components/eventsutil';
import { fetchSchedGroupsDB } from '../../components/schedgrputil';
import HomePage from "../home";

jest.mock('../../components/eventsutil', () => ({
    fetchEventsDB: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve({})),
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
describe("HomePage empty", () => {
  it("renders empty snapshot correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles event lookup error", async () => {
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.reject('mockReject'));

    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(mockEnqueue).toHaveBeenLastCalledWith(`error retrieving events`, {variant: 'error'});

  });

  it("handles grp/sched lookup error", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.reject('mockReject'));

    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(mockEnqueue).toHaveBeenLastCalledWith(`error retrieving sched/groups`, {variant: 'error'});

  });

});
