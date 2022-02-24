import React from "react";
import { render, waitFor } from "@testing-library/react";

import EventsPage from "../events";

jest.mock('../../components/eventsutil', () => ({
    ...jest.requireActual('../../components/eventsutil'),
    fetchEventsDB: jest.fn(() => Promise.resolve({testevt: {descr: 'testing', schedRules: ["begin +2,++2,++2"]}})),
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

describe("EventsPage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(<EventsPage />);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  }, 15000);
});
