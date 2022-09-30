import React from "react"
import { render } from "@testing-library/react";

import Header from "../header"

// headerpub describes blank uname header
const mytest = <Header uname="" />;
describe("HeaderPub", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });
});
