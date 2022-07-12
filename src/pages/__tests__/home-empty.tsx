import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { API } from 'aws-amplify';
import { fetchEventsDB } from '../../components/eventsutil';
import { fetchSchedGroupsDB } from '../../components/schedgrputil';
import HomePage from "../home";

jest.mock('aws-amplify');
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


describe("HomePage empty", () => {
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

  it("renders empty snapshot correctly", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles event lookup error", async () => {
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.reject('mockReject'));
    await mySetup();

    expect(mockEnqueue).toHaveBeenLastCalledWith(`error retrieving data`, {variant: 'error'});
  });

  it("handles grp/sched lookup error", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.reject('mockReject'));
    await mySetup();

    expect(mockEnqueue).toHaveBeenLastCalledWith(`error retrieving data`, {variant: 'error'});
  });

  it("handles quicksetup", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (API.post as jest.Mock).mockImplementation(() => Promise.resolve({'Response': 'completed'}));

    const utils = await mySetup();

    const qstart1 = utils.getByTestId('qstart1');
    expect(qstart1).toBeVisible();

    const qstart2 = utils.getByTestId('qstart2');
    expect(qstart2).toBeVisible();

    const qstart3 = utils.getByTestId('qstart3');
    expect(qstart3).toBeVisible();

    await userEvent.click(qstart1);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(mockEnqueue).toHaveBeenCalledWith(`Copy successful!`, {variant: 'success', "anchorOrigin": {"horizontal": "right", "vertical": "bottom"},});
  });

  it("handles quicksetup without good api return", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (API.post as jest.Mock).mockImplementation(() => Promise.resolve({'Response': 'error'}));

    const utils = await mySetup();

    const qstart2 = utils.getByTestId('qstart2');
    expect(qstart2).toBeVisible();

    mockEnqueue.mockClear();
    await userEvent.click(qstart2);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(mockEnqueue).toHaveBeenCalledWith(`setup failed`, {variant: 'error',});

    mockEnqueue.mockClear();
    const qstart3 = utils.getByTestId('qstart3');
    (API.post as jest.Mock).mockImplementation(() => Promise.reject('mock failed'));
    await userEvent.click(qstart3);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(mockEnqueue).toHaveBeenCalledWith(`setup api failed`, {variant: 'error',});
  });

});
