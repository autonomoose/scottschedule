import React from "react";
import { render } from "@testing-library/react";

import { CreateGroup } from '../../components/schedgrputil';

const mockCallback = jest.fn();

const mytest = <CreateGroup onComplete={mockCallback} open={true} />;

describe("schedgrputil - create", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


