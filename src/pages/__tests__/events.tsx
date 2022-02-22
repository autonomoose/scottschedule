import React from "react";
import { render, waitFor } from "@testing-library/react";

import EventsPage from "../events";

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
  });
});
