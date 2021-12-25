import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import HomePage from "../home";

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));

describe("HomePage", () => {
  it("renders snapshot correctly", async () => {
    const {container} = render(<HomePage />);
    await waitFor(() => {
        expect(screen.getByRole('button', {name: /sign out/i}))
        .toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
