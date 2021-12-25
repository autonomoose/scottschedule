import React from "react"
import { render } from "@testing-library/react";

import LayoutPub from "../layoutpub"

// headerpub describes blank uname header
describe("LayoutPub", () => {
  it("renders snapshot correctly", () => {
    const {container} = render(<LayoutPub><div>Test</div></LayoutPub>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
