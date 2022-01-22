import React from "react";
import { render } from "@testing-library/react";

import SchedsPage from "../scheds";

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
  it("renders snapshot correctly", () => {
    const {container} = render(<SchedsPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
