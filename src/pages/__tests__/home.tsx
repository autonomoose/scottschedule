import React from "react";
import { render, waitFor } from "@testing-library/react";

import HomePage from "../home";

jest.mock('../../components/eventsutil');
jest.mock('../../components/schedgrputil');

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

describe("HomePage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(<HomePage />);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  }, 15000);
});
