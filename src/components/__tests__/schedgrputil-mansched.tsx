import React from "react";
import { render } from "@testing-library/react";

import { ManSched } from '../../components/schedgrputil';

const mockCallback = jest.fn();
const testSched = {
    begins: 'now',
    buttonName: 'test1',
    descr: 'test sched',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
};

const mytest = <ManSched groupSchedName='testgrp' gSchedule={testSched} onComplete={mockCallback} open={true} />

describe("schedgrputil - mansched", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


