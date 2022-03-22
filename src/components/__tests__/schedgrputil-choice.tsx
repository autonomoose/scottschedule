import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";

import { ChoiceSchedGroup } from '../../components/schedgrputil';

const mockCallback = jest.fn();

const testSchedGroup = {
    'default': {
      descr: 'main group',
      schedNames: [{
        begins: 'now',
        buttonName: 'main',
        descr: 'main test',
        schedName: 'testsched',
        schedTasks: [{evTaskId: 'testev'}],
        }]
    },
    'testgrp': {
      descr: 'test group',
      schedNames: [{
        begins: 'now',
        buttonName: 'test1',
        descr: 'test sched',
        schedName: 'testsched',
        schedTasks: [{evTaskId: 'testev'}],
        }]
    },
};

const mytest = <ChoiceSchedGroup currgroup='default' schedGroupList={testSchedGroup} setgroup={mockCallback} />
const mySetup = () => {
    const utils = render(mytest);
    const groupInput = utils.getByTestId(/schedgroup/i);
    const groupInputChg = (myvalue: string) => {
        fireEvent.change(groupInput, { target: { value: myvalue } });
    };
    return {
        ...utils,
        groupInput,
        groupInputChg,
    }
};

describe("schedgrputil - choice (ChoiceSchedGroup) event", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("has correct default", () => {
    const utils = mySetup();
    expect(utils.groupInput).toHaveValue('default');
  });
  it("changes to test", async () => {
    const utils = mySetup();
    utils.groupInputChg('testgrp');
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

});


