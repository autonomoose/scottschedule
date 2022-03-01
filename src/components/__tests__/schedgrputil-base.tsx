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

const mytest = <DisplaySchedGroup group='default' groupSched={testSchedGroup} select={mockCallback} />
describe("schedgrputil - connect event", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("translates simple graphQL into schedgroups", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          {
          begins: null,
          button: null,
          chain: null,
          descr: 'test schedules',
          evnames: 'default!args',
          sound: null,
          soundrepeat: null,
          warn: null,
          },
          {
          begins: 'now',
          button: 'test1',
          chain: null,
          descr: 'test sched',
          evnames: 'default!testsched!args',
          sound: '_default_',
          soundrepeat: '0',
          warn: '_none_',
          },
          {
          begins: null,
          button: null,
          chain: null,
          descr: null,
          evnames: 'default!testsched!testev',
          sound: null,
          soundrepeat: null,
          warn: null,
          },
        ]}}
      }));
      // API.graphql = jest.fn(() => Promise.reject('mockRejected'));

      const schedGroups = await fetchSchedGroupsDB();
      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          schedNames: [{
              begins: 'now',
              buttonName: 'test1',
              descr: 'test sched',
              schedName: 'testsched',
              schedTasks: [{evTaskId: 'testev'}],
          }]
        }
      });
      API.graphql = prevAPIgraphql;
  });

});


