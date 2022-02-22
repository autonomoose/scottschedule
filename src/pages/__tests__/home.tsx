import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import HomePage from "../home";
import { fetchEventsDB } from '../../components/eventsutil';
import { fetchSchedGroupsDB } from '../../components/schedgrputil';

jest.mock('../../components/eventsutil', () => ({
    fetchEventsDB: jest.fn(),
}));
jest.mock('../../components/schedgrputil', () => ({
    fetchSchedGroupsDB: jest.fn(),
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

describe("HomePage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(<HomePage />);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
