import React from "react";
import { render } from "@testing-library/react";

import { API } from 'aws-amplify';
import DisplaySchedGroup, { fetchSchedGroupsDB } from '../../components/schedgrputil';
jest.mock('aws-amplify');

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

const testDBgroupArgs = {
    begins: null,
    button: null,
    chain: null,
    descr: 'test schedules',
    evnames: 'default!args',
    sound: null,
    soundrepeat: null,
    warn: null,
};
const testDBschedArgs = {
    begins: 'now',
    button: 'test1',
    chain: null,
    descr: 'test sched',
    evnames: 'default!testsched!args',
    sound: '_default_',
    soundrepeat: '0',
    warn: '_none_',
};
const testDBevent = {
    begins: null,
    button: null,
    chain: null,
    descr: null,
    evnames: 'default!testsched!testev',
    sound: null,
    soundrepeat: null,
    warn: null,
};

const expectSchedNames = {
    begins: 'now',
    buttonName: 'test1',
    descr: 'test sched',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
};

const mytest = <DisplaySchedGroup group='default' groupSched={testSchedGroup} select={mockCallback} />
describe("schedgrputil - base DisplaySchedGroup event", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles graphQL thrown error", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.reject('mockRejected')) as any;

      const schedGroups = await fetchSchedGroupsDB();
      expect(schedGroups).toStrictEqual({});
      API.graphql = prevAPIgraphql;
  });
  it("translates simple graphQL into schedgroups", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          testDBschedArgs,
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [expectSchedNames],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups wo events", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          testDBschedArgs,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{...expectSchedNames, schedTasks: [], }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups wo optionals", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          { evnames: 'default!testsched!args',},
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{schedName: 'testsched', descr: '', schedTasks: [], }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w sound", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, sound: 'bigbell',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{...expectSchedNames, sound: {name: 'bigbell',}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w repeated sound", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, sound: 'bigbell', soundrepeat: '2'},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{...expectSchedNames, sound: {name: 'bigbell', repeat: 2}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w warn", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, warn: '_default_',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{...expectSchedNames, warn: {}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w chain", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, chain: 'testsched',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{...expectSchedNames, chain: 'testsched', }],
        }
      });
      API.graphql = prevAPIgraphql;
  });

});


