import { Box, keyframes, BoxProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

type CrtScreenProps = BoxProps;

const scanLineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

export const CrtScreen: React.FC<CrtScreenProps> = ({ children, ...props }) => {
  const crtColor = useColorModeValue("crt.green", "crt.amber");

  return (
    <Box
      position="relative"
      backgroundColor="crt.background"
      color={crtColor}
      overflow="hidden"
      clipPath="ellipse(100% 50% at 50% 50%)"
      {...props}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        background={`radial-gradient(at center, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.75) 100%)`}
      />
      {children}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        background={`linear-gradient(0deg, transparent 50%, rgba(255, 255, 255, 0.02) 50%)`}
        backgroundSize="100% 4px"
        animation={`${scanLineAnimation} 16s linear infinite`}
      />
    </Box>
  );
};
