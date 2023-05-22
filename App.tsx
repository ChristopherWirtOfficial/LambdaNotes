// Import the components
import { Box, ChakraProvider, VStack } from '@chakra-ui/react';
import Clicker from './Clicker';
import Upgrade from './Upgrade';
import theme from './theme';
import { CrtScreen } from './components/CRTScreen';
import LambdaNotes from './LambdaNotes/LambdaNotes';
import React from 'react';

// Define the App component
function App() {
  // Return the component
  return (
    <ChakraProvider theme={theme}>
      {/* <CrtScreen>
        <VStack>
          <Clicker />
          <Upgrade />
        </VStack>
      </CrtScreen> */}
      <LambdaNotes />
    </ChakraProvider>
  );
}

export default App;
