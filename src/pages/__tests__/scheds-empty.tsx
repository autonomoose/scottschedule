import React from "react";
import { render, waitFor } from "@testing-library/react";

import { fetchSchedGroupsDB } from '../../components/schedgrputil';
import SchedsPage from "../scheds";

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

const mytest = <SchedsPage />;
describe("SchedsPage", () => {
  it("renders no group/scheds correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  }, 15000);

  it("handles null for group/scheds fetch", async () => {
    (fetchSchedGroupsDB as jest.Mock).mockImplementation(() => Promise.resolve());
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
  }, 15000);
});


