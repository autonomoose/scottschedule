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

const mytest = <DisplayEvents tasks={eventList} select={mockCallback} />
describe("eventsutil - base", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
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
      }));

      const newList = await fetchEventsDB();
      expect(newList).toStrictEqual(eventList);
      API.graphql = prevAPIgraphql;
  });
  it("handles graphQL errors", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.reject('mockreject'));

      const newList = await fetchEventsDB();
      expect(newList).toStrictEqual({});
      API.graphql = prevAPIgraphql;
  });

});


