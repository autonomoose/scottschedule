import React from "react"
import { render } from "@testing-library/react";

import LayoutPub from "../layoutpub"

// headerpub describes blank uname header
const mytest = <LayoutPub><div data-testid='test'>Test</div></LayoutPub>;
describe("LayoutPub", () => {
  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });
});
