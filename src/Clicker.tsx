import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';

import { clickIncomeAtom, countAtom, incomeAtom } from './store';
import Upgrades from './Upgrades.tsx';
import useTick from './useTick.ts';
import { useState } from 'react';

const ticksBetweenIncome = 60;

const useBaseIncomeTick = () => {
  const [countValue, setCount] = useAtom(countAtom);
  const incomeValue = useAtomValue(incomeAtom);

  const [ ticksLeftUntilIncome, setTicksLeftUntilIncome ] = useState(ticksBetweenIncome);

  useTick(() => {
    setTicksLeftUntilIncome(t => t - 1);
  }, 1);

  useTick(() => {
    setCount(c => c + Math.ceil(incomeValue));
    setTicksLeftUntilIncome(ticksBetweenIncome);
  }, ticksBetweenIncome);

  return ticksLeftUntilIncome;
}

function Clicker() {
  const [countValue, setCount] = useAtom(countAtom);
  const clickIncome = useAtomValue(clickIncomeAtom);
  const incomeValue = useAtomValue(incomeAtom);

  const handleClick = () => {
    setCount(c => c + clickIncome);
  };

  const ticksLeftUntilIncome = useBaseIncomeTick();

  const percentUntilIncome = ticksLeftUntilIncome / ticksBetweenIncome;
  const incomeBarWidth = `${(1 - percentUntilIncome) * 100}%`;

  return (
    <Flex w='100vw' h='100%' justifyContent='center' alignItems='center'>
      <HStack w='100%' gap={25} p={6} flex={1}>
        <VStack w='100%' h='100%' justifyContent='center'>
          <Text fontSize='6xl'>{countValue}</Text>
          <Text>{ incomeValue } per tick</Text>
          <Flex w='100%' h='10px' bg='gray.200' borderRadius='full'>
            <Flex w={incomeBarWidth} h='100%' bg='blue' borderRadius='full'>
              <Box>{ticksLeftUntilIncome.toPrecision(2)}</Box> / <Box>{ticksBetweenIncome} </Box>
            </Flex>
          </Flex>
          <Text fontSize='2xl'>+{clickIncome} per click</Text>
          <Button colorScheme='blue' onClick={handleClick}>Click me!</Button>
        </VStack>
        <Box flex={1} flexBasis='60%'>
        <Upgrades />
        </Box>
      </HStack>
    </Flex>
  );
}

export default Clicker;
