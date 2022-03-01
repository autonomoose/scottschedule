import React from "react";
import { render } from "@testing-library/react";

import { CreateRule } from '../../components/eventsutil';

const mockCallback = jest.fn();

const mytest = <CreateRule evName='testevt' onComplete={mockCallback} open={true} />;

describe("eventsutil - newrule", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


