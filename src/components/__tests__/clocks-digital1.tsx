import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";

import { ClockDigital1 } from "../clocks";

const mockCompleteFun = jest.fn();

// local test helpers
//
const mytest = <ClockDigital1 onComplete={mockCompleteFun}/>;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('change clock')).toBeVisible();
    });
    const chgClockButton = utils.getByTestId('change clock');
    const chgSchedButton = utils.getByRole('button', {name: /scheduler/i});
    const chgColorButton = utils.getByRole('button', {name: /color/i});
    return {
        ...utils,
        chgClockButton,
        chgSchedButton,
        chgColorButton,
    }
}

describe("ClockDigital1", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("changes clock when clock is clicked", async () => {
    const utils = await mySetup();

    userEvent.click(utils.chgClockButton);
    await waitFor(() => {
        expect(mockCompleteFun).toHaveBeenLastCalledWith('digital2');
    });
  });

  it("closes when scheduler is clicked", async () => {
    const utils = await mySetup();

    userEvent.click(utils.chgSchedButton);
    await waitFor(() => {
        expect(mockCompleteFun).toHaveBeenLastCalledWith('close');
    });
  });

  it("passes digital1-color when option is pressed", async () => {
    const utils = await mySetup();

    userEvent.click(utils.chgColorButton);
    await waitFor(() => {
        expect(mockCompleteFun).toHaveBeenLastCalledWith('digital1-color');
    });
  });

  it("defines clock update vars", async () => {
    const utils = await mySetup();

    expect(utils.getByTestId('mainpm')).toBeVisible();
    expect(utils.getByTestId('compclock')).toBeVisible();
    expect(utils.getByTestId('compminutes')).toBeVisible();
    expect(utils.getByTestId('maindate')).toBeVisible();
  });

});


