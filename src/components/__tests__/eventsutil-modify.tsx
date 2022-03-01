import React from "react";
import { render } from "@testing-library/react";

import { ModifyEvent } from '../../components/eventsutil';

const mockCallback = jest.fn();
const mockEvents = {testevt: {descr: 'testing', schedRules: ["begin +2,++2,++2"]}};

const mytest = <ModifyEvent evid='testevt' tasks={mockEvents} onComplete={mockCallback} open={true} />;

describe("eventsutil - modify", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


