import React from "react";
import { render } from "@testing-library/react";

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
  it("renders snapshot correctly", () => {
    const {container} = render(<EventsPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
