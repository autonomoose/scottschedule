import "@testing-library/jest-dom/extend-expect"

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

jest.mock("gatsby-plugin-image", () => {
    const React = require("react")
    const plugin = jest.requireActual("gatsby-plugin-image")

    const mockImage = ({imgClassName, ...props}) =>
        React.createElement("img", {
            ...props,
            className: imgClassName,
        })

    const mockPlugin = {
        ...plugin,
        GatsbyImage: jest.fn().mockImplementation(mockImage),
        StaticImage: jest.fn().mockImplementation(mockImage),
    }

    return mockPlugin
})

