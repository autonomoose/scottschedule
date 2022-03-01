import React from "react";
import { render } from "@testing-library/react";

import { ModifyGroup } from '../../components/schedgrputil';

const mockCallback = jest.fn();
const testSchedGroup = {
    name: 'testgrp',
    descr: 'test group',
    schedNames: [{
        begins: 'now',
        buttonName: 'test1',
        descr: 'test sched',
        schedName: 'testsched',
        schedTasks: [{evTaskId: 'testev'}],
        }]
};

const mytest = <ModifyGroup group='testgrp' groupSched={testSchedGroup} onComplete={mockCallback} open={true} />

describe("schedgrputil - modify", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


