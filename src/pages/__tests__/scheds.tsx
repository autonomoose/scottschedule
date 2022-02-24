import React from "react";
import { render, waitFor } from "@testing-library/react";

import SchedsPage from "../scheds";

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
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

describe("SchedsPage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(<SchedsPage />);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  }, 15000);
});
