import React from "react";
import { render, waitFor } from "@testing-library/react";

import { fetchEventsDB } from '../../components/eventsutil';
import EventsPage from "../events";

jest.mock('../../components/eventsutil', () => ({
    ...jest.requireActual('../../components/eventsutil'),
    fetchEventsDB: jest.fn(() => Promise.resolve({})),
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

const mytest = <EventsPage />;
describe("EventsPage - empty", () => {
  it("renders no events snapshot correctly", async () => {
    const {asFragment, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(asFragment()).toMatchSnapshot();
  }, 15000);

  it("handles null for events fetch", async () => {
    (fetchEventsDB as jest.Mock).mockImplementation(() => Promise.resolve());
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });

  }, 15000);

});
