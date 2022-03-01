import React from "react";
import { render } from "@testing-library/react";

import { CreateEvent } from '../../components/eventsutil';

const mockCallback = jest.fn();

const mytest = <CreateEvent onComplete={mockCallback} open={true} />;
describe("eventsutil - create", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


