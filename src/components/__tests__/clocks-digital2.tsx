import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { ClockDigital2 } from "../clocks";

const mockCompleteFun = jest.fn();

// local test helpers
//
const mytest = <ClockDigital2 onComplete={mockCompleteFun}/>;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('change clock')).toBeVisible();
    });
    const chgClockButton = utils.getByTestId('change clock');
    const chgSchedButton = utils.getByRole('button', {name: /scheduler/i});
    return {
        ...utils,
        chgClockButton,
        chgSchedButton,
    }
}

describe("ClockDigital2", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("changes clock when clock is clicked", async () => {
    const utils = await mySetup();

    userEvent.click(utils.chgClockButton);
    await waitFor(() => {
        expect(mockCompleteFun).toHaveBeenLastCalledWith('next');
    });
  });

  it("closes when scheduler is clicked", async () => {
    const utils = await mySetup();

    userEvent.click(utils.chgSchedButton);
    await waitFor(() => {
        expect(mockCompleteFun).toHaveBeenLastCalledWith('close');
    });
  });

  it("defines clock update vars", async () => {
    const utils = await mySetup();

    expect(utils.getByTestId('mainpm')).toBeVisible();
    expect(utils.getByTestId('mainclock')).toBeVisible();
    expect(utils.getByTestId('maindate')).toBeVisible();
  });

});


