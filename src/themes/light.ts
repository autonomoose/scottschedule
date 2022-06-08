import { ThemeOptions } from "@mui/material";

declare module '@mui/material/styles' {
  interface Palette {
    site: Palette['primary'];
    idle: Palette['primary'];
    ack: Palette['primary'];
    pending: Palette['primary'];
  }
  interface PaletteOptions {
    site: PaletteOptions['primary'];
    idle: PaletteOptions['primary'];
    ack: PaletteOptions['primary'];
    pending: PaletteOptions['primary'];
  }
}
export const lightTheme: ThemeOptions = {
  palette: {
    mode: "light",
    site: {
      main: "#e9ebeb",
      contrastText: "#000000",
      },
    idle: {
      main: "#e0e0e0",
      contrastText: "#000000",
      },
    ack: {
      main: "#d2b4de",
      contrastText: "#000000",
      },
    pending: {
      main: "#fcf3cf",
      contrastText: "#000000",
      },
    background: {
      paper: "#f1f3f3",
      default: "#d3d7d8",
    },
  },
};
