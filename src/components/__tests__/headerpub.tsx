import React from "react"
import { render } from "@testing-library/react";

import Header from "../header"

// headerpub describes blank uname header
describe("HeaderPub", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(<Header uname="" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
