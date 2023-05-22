import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    crt: {
      green: "#33ff33",
      amber: "#ffbf00",
      background: "#1e1e1e",
    },
  },
  components: {
    Box: {
      baseStyle: {
        fontFamily: "'Inconsolata', monospace",
      },
    },
  },
});

export default theme;
