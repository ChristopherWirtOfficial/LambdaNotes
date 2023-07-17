// Import the components
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import QualityRefiner from './LambdaNotes/QualityRefiner/QualityRefiner';

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
      {/* <LambdaNotes /> */}
      {/* <ChessMoves /> */}
      <QualityRefiner />
    </ChakraProvider>
  );
}

export default App;
