import React from "react";
import { render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import {OptionsButtons, buildButtons, buildOptions} from '../../components/schedbuttons';

const testOptions = {
    tstoption: false,
    tomorrow: false,
};

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
const testEvents = {
    testev: {
        descr: 'testing',
        schedRules: ["begin +2,++2,++2",],
        },
};

const clickOptions = (_item: string) => {
    return;
};

describe("schedbuttons", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(<OptionsButtons options={testOptions} onClick={clickOptions}/>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles button click to enable", () => {
    const utils = render(<OptionsButtons options={testOptions} onClick={clickOptions}/>);

    userEvent.click(utils.getByRole('button', {name: /tomorrow/i}));
    userEvent.click(utils.getByRole('button', {name: /tstoption/i}));
  });

  it("handles button click to disable", () => {

    const testOptionsOn = {
        tstoption: true,
        tomorrow: true,
    };
    const utils = render(<OptionsButtons options={testOptionsOn} onClick={clickOptions}/>);

    userEvent.click(utils.getByRole('button', {name: /tomorrow/i}));
    userEvent.click(utils.getByRole('button', {name: /tstoption/i}));
  });

  it("builds single button list", () => {
    const buttonDict = buildButtons(testSchedGroup);
    expect(buttonDict).toStrictEqual({testsched: 'test1'});
  });

  it("builds multi-button list", () => {
    const testSchedGroup2 = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [
            {
              begins: 'now', buttonName: 'test1', descr: 'test sched',
              schedName: 'testsched', schedTasks: [{evTaskId: 'testev'}],
            },
            {
              buttonName: 'test2', descr: 'test2 sched',
              schedName: 'testsched2', schedTasks: [{evTaskId: 'testev'}],
            },
            {
              descr: 'test3 sched',
              schedName: 'testsched3', schedTasks: [{evTaskId: 'testev'}],
            },
            {
              begins: 'now', descr: 'test4 sched',
              schedName: 'testsched4', schedTasks: [{evTaskId: 'testev'}],
            },
        ]
    };

    const buttonDict = buildButtons(testSchedGroup2);
    expect(buttonDict).toStrictEqual({
      testsched: 'test1',
      testsched2: 'test2',
      testsched3: 'testsched3',
      testsched4: 'testsched4',
    });
  });

  it("builds multi-starttime list", () => {
    const testSchedGroup2 = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [
            {
              begins: '8:00,9:00,10:00,', buttonName: '', descr: 'test multistart',
              schedName: 'testsched', schedTasks: [{evTaskId: 'testev'}],
            },
        ]
    };
    const buttonDict = buildButtons(testSchedGroup2);
    expect(buttonDict).toStrictEqual({
      'testsched.8:00': ' 8:00',
      'testsched.9:00': ' 9:00',
      'testsched.10:00': ' 10:00'
    });
  });

  it("builds multi-starttime list wo buttonname", () => {
    const testSchedGroup2 = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [
            {
              begins: '8:00,9:00,10:00,', descr: 'test multistart',
              schedName: 'testsched', schedTasks: [{evTaskId: 'testev'}],
            },
        ]
    };
    const buttonDict = buildButtons(testSchedGroup2);
    expect(buttonDict).toStrictEqual({
      'testsched.8:00': 'testsched 8:00',
      'testsched.9:00': 'testsched 9:00',
      'testsched.10:00': 'testsched 10:00'
    });
  });

  it("builds options wo defined options", () => {
    const optionDict = buildOptions(testSchedGroup, testEvents);
    expect(optionDict).toStrictEqual({tomorrow: false});
  });

  it("builds options from events", () => {
    const testEvents2 = {
        testev: {
            descr: 'testing',
            schedRules: ["option tstoption +2,++2,++2",],
            },
    };
    const optionDict = buildOptions(testSchedGroup, testEvents2);
    expect(optionDict).toStrictEqual(testOptions);
  });

  it("builds options from events w compound options", () => {
    const testEvents2 = {
        testev: {
            descr: 'testing',
            schedRules: ["option tstoption+tstoption2 +2,++2,++2",],
            },
    };
    const optionDict = buildOptions(testSchedGroup, testEvents2);
    expect(optionDict).toStrictEqual({tstoption: false,tstoption2: false,tomorrow: false,} );
  });

  it("builds options from events w compound start", () => {
    const testEvents2 = {
        testev: {
            descr: 'testing',
            schedRules: ["option tstoption+start:8:00 +2,++2,++2",],
            },
    };
    const optionDict = buildOptions(testSchedGroup, testEvents2);
    expect(optionDict).toStrictEqual(testOptions);
  });

  it("ignores options wo rule", () => {
    const testEvents2 = {
        testev: {
            descr: 'testing',
            schedRules: ["option ",],
            },
    };
    const optionDict = buildOptions(testSchedGroup, testEvents2);
    expect(optionDict).toStrictEqual({tomorrow: false});
  });

  it("ignores schedules wo matching rule defined", () => {
    const testEvents2 = {
        testev2: {
            descr: 'testing',
            schedRules: ["begin +2,++2,++2",],
            },
    };
    const optionDict = buildOptions(testSchedGroup, testEvents2);
    expect(optionDict).toStrictEqual({tomorrow: false});
  });

});

