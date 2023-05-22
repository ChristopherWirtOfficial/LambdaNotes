import { Box, BoxProps, keyframes } from '@chakra-ui/react';
import React from 'react';

type ScanLineProps = BoxProps

const scanLineAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
`;

export const ScanLine: React.FC<ScanLineProps> = ({ ...props }) => {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      background={`linear-gradient(0deg, transparent 50%, rgba(255, 255, 255, 0.02) 50%)`}
      backgroundSize="100% 4px"
      animation={`${scanLineAnimation} 14s linear infinite`}
      zIndex={10}
      {...props}
    />
  );
};
