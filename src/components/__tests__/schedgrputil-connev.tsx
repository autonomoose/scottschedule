import React from "react";
import { render } from "@testing-library/react";

import { ConnectTask } from '../../components/schedgrputil';

const mockCallback = jest.fn();

const mytest = <ConnectTask schedName='testgrp' onComplete={mockCallback} open={true} />

describe("schedgrputil - connect event", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

});


