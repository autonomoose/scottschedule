import React from "react";
import { render } from "@testing-library/react";

import { DisplayFutureCard, buildFutureEvents } from '../../components/futurevents';

const mockNow = 1482363367071;
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
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("creates simple futurevents", () => {
    const newEvs = buildFutureEvents(
      testSchedGroup,
      'testsched',
      eventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

  it("uses tomorrow option", () => {
    const newEvs = buildFutureEvents(
      testSchedGroup,
      'testsched',
      eventList,
      {tomorrow: true}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBeGreaterThan(mockNow);
  });

  it("handles hour offsets and constants", () => {
    const specEventList = {
      'testev': {
        descr: 'test event',
        schedRules: ['begin 20:00,++1:00,++1:00',],
      }
    };
    const newEvs = buildFutureEvents(
      testSchedGroup,
      'testsched',
      specEventList,
      {tomorrow: false}
    );
    expect(newEvs).toStrictEqual(evsExpected);
    expect(newEvs.begins).toBe(mockNow);
  });

});


