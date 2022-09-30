import React from "react";
import { render } from "@testing-library/react";

import { API } from 'aws-amplify';
import DisplayEvents, { fetchEventsDB } from '../../components/eventsutil';
jest.mock('aws-amplify');

const mockCallback = jest.fn();
const eventList = {
  'testevt': {
    descr: 'test event',
    schedRules: ['begin +2,++2,++2',],
  }
};

const eventSoundList = {
  'testevt': {
    descr: 'test event',
    schedRules: ['begin +2,++2,++2',],
    sound: {name: 'bigbell', repeat: 3},
  }
};


const mytest = <DisplayEvents tasks={eventList} select={mockCallback} />
describe("eventsutil - base", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("translates simple graphQL into events", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listEvents': {items: [
          {
          descr: 'test event',
          evnames: 'testevt!args',
          rules: null,
          },
          {
          descr: null,
          evnames: 'testevt!begin',
          rules: '+2,++2,++2',
          },

        ]}}
      })) as any;

      const newList = await fetchEventsDB();
      expect(newList).toStrictEqual(eventList);
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL events w/ sound", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listEvents': {items: [
          {
          descr: 'test event',
          evnames: 'testevt!args',
          rules: null,
          sound: 'bigbell',
          soundrepeat: '3',
          },
          {
          descr: null,
          evnames: 'testevt!begin',
          rules: '+2,++2,++2',
          sound: '_default_',
          soundrepeat: '0',
          },

        ]}}
      })) as any;

      const newList = await fetchEventsDB();
      expect(newList).toStrictEqual(eventSoundList);
      API.graphql = prevAPIgraphql;
  });

  it("handles graphQL errors", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;

      const newList = await fetchEventsDB();
      expect(newList).toStrictEqual({});
      API.graphql = prevAPIgraphql;
  });

});


