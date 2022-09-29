import React from "react";
import { render } from "@testing-library/react";

import { DisplayFutureCard, buildFutureEvents } from '../../components/futurevents';

// 9:46 am local, a few years ago
const mockNow = 1482331087071;
Date.now = jest.fn(() => mockNow);

const evsList = [
  {
  evTstamp: mockNow + 120000,
  evTaskId: 'testev',
  },
  {
  evTstamp: mockNow + 240000,
  evTaskId: 'testev',
  },
  {
  evTstamp: mockNow + 360000,
  evTaskId: 'testev',
  },
];

const evsExpected = {
  evs: [
    {
    evTstamp: expect.any(Number),
    evTaskId: 'testev',
    },
    {
    evTstamp: expect.any(Number),
    evTaskId: 'testev',
    },
    {
    evTstamp: expect.any(Number),
    evTaskId: 'testev',
    },
  ],
  begins: expect.any(Number),
};

const eventList = {
  'testev': {
    descr: 'test event',
    schedRules: ['begin +2,++2,++2',],
  }
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


const mytest = <DisplayFutureCard tasks={eventList} evs={evsList} />
describe("futurevents", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("creates basic futurevents", () => {
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  // custom event language ---------------
  it("handles minute constants", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 50#30,++2#30,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  it("handles hour offsets", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 22:00#30,++1:2#30,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles start keyword", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin start,++1:00,++1:00',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });


  // or statement handling ---------------
  //
  it("handles no time after or by ignoring or", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ++2 or,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  it("handles 'or later' when later events", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 13:45 or +5:00,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles 'or later' when not later events", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 13:45 or +4:00,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  it("handles 'or later' relative events", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 13:45 or ++1:00,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  it("handles 'or sooner' when not sooner events", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin +4:00 or 13:45,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles 'or sooner' when sooner", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin +5:00 or 13:45,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles whitespace in 'or'", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin +5:00 or   13:45,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  // option statement handling ---------------
  //
  it("uses tomorrow option", () => {
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      eventList,
      {tomorrow: true}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBeGreaterThan(mockNow);
  });
  it("handles 'option' events when no option", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['option testopt ++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, testopt: false}
    );
    expect(newEvs).toStrictEqual({evs: [], begins: mockNow});
    expect(newEvs.begins).toBe(mockNow);
  });

  it("handles 'option' events when option is true", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['option testopt ++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, testopt: true}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles 'option start' events when not the right start", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['option start:9:00 ++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({evs: [], begins: mockNow});
  });
  it("handles 'option - press' setup", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['option button1 press',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, button1: false,}
    );
    expect(newEvs).toStrictEqual({evs: [], begins: mockNow});
  });
  it("handles 'option - press' active", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['option button1 press',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, button1: true,}
    );
    expect(newEvs).toStrictEqual(
      {evs: [
        {
        evTstamp: expect.any(Number),
        evTaskId: 'testev',
        },
      ],
      begins: mockNow
      });
  });

  // multi-events ---------------
  //
  it("handles overlapping events", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ++2',],
      }
    };
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: '8:00,9:00',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [{evTaskId: 'testev'}, {evTaskId: 'testev'}],
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched.8:00',
      specEventList,
      {tomorrow: false, }
    );
    const evsExpected2 = {
      evs: [
        {
        evTstamp: expect.any(Number),
        evTaskId: 'testev',
        },
        {
        evTstamp: expect.any(Number),
        evTaskId: 'testev',
        },
      ],
      begins: expect.any(Number),
    };

    expect(newEvs).toStrictEqual(evsExpected2);
  });
  // schedule parms ---------------
  //
  it("handles start parameter", () => {
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: '8:00,9:00',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [{evTaskId: 'testev'}],
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched.8:00',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
  });
  it("handles sound parameter", () => {
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: 'now',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [{evTaskId: 'testev'}],
            sound: {name: '_default_'},
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({sound: {name: '_default_'}, ...evsExpected});
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles sound parameter", () => {
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: 'now',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [{evTaskId: 'testev'}],
            warn: {sound: {name: '_default_'}},
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({warn: {sound: {name: '_default_'}}, ...evsExpected});
    expect(newEvs.begins).toBe(mockNow);
  });

  // malformed statement handling ---------------
  //
  it("handles bad command instead of begin or option", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['badcmd ++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({evs: [], begins: mockNow});
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles bad command not expected as now", () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin badcmd,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);

    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleWarnFn.mockRestore();
  });

  it("handles more than one bad command by ignoring it ", () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ++2,++2,badcmd,badcmd',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
    expect(consoleWarnFn).toHaveBeenCalledTimes(2);
    consoleWarnFn.mockRestore();
  });
  it("handles bad characters in two part tlang time", () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ++c:01,++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleWarnFn.mockRestore();
  });

  it("handles extra time parts as now", () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 01:12:00,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleWarnFn.mockRestore();
  });
  it("handles inital no time by ignoring it", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ,++2,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles null repeating time by ignoring it", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin ++2,,++2,++2',],
      }
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  // bad parms in call ---------------
  //
  it("handles bad event", () => {
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: 'now',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [{evTaskId: 'badev'}],
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({evs: [], begins: mockNow});
    expect(newEvs.begins).toBe(mockNow);
  });
  it("handles bad sched", () => {
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      testSchedGroup,
      'badsched',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({evs: []});
  });
  it("handles no events", () => {
    const specSchedGroup = {
        name: 'testgrp',
        descr: 'test group',
        schedNames: [{
            begins: 'now',
            buttonName: 'test1',
            descr: 'test sched',
            schedName: 'testsched',
            schedTasks: [],
            }]
    };
    const newEvs = buildFutureEvents(
      new Date(Date.now()),
      specSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false, }
    );
    expect(newEvs).toStrictEqual({
      evs: [
        {
        evTstamp: expect.any(Number),
        evTaskId: 'new',
        },
      ],
      begins:  expect.any(Number),
    });
    expect(newEvs.begins).toBe(mockNow);
  });


});


