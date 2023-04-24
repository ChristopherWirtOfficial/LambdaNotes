import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { FC } from 'react';

import { additiveUpgradesAtom, clickMultiplierUpgradesAtom, countAtom } from './store';
import { AdditiveUpgrade } from './upgrades';

const Upgrades: FC = () => {
  const [additiveUpgrades, setAdditiveUpgrades] = useAtom(additiveUpgradesAtom);
  const [ clickMultiplierUpgrades, setClickMultiplierUpgrades ] = useAtom(clickMultiplierUpgradesAtom);


  const [ count, setCount ] = useAtom(countAtom);

  const applyUpgrade = (upgrade: AdditiveUpgrade) => {
    setAdditiveUpgrades((upgrades) => {
      const index = upgrades.indexOf(upgrade);
      if (index === -1) return upgrades;

      const newUpgrades = [...upgrades];
      newUpgrades[index] = {
        ...upgrade,
        cost: upgrade.cost * 2,
        level: (upgrade.level ?? 0) + 1,
      };

      return newUpgrades;
    });
  };

  const applyClickMultiplierUpgrade = (upgrade: AdditiveUpgrade) => {
    setClickMultiplierUpgrades((upgrades) => {
      const index = upgrades.indexOf(upgrade);

      if (index === -1) return upgrades;

      const newUpgrades = [...upgrades];

      newUpgrades[index] = {
        ...upgrade,
        cost: upgrade.cost * 2,
        level: (upgrade.level ?? 0) + 1,
      };

      return newUpgrades;

    });
  };


  const handleUpgrade = (type: 'upgrade' | 'clickMulti') => (upgrade: AdditiveUpgrade) => {
    console.log(upgrade);

    // Charge the player for the upgrade
    if (count >= upgrade.cost) {
      setCount(c => c - upgrade.cost);

      // Apply the upgrade
      if (type === 'upgrade') applyUpgrade(upgrade);
      else if (type === 'clickMulti') applyClickMultiplierUpgrade(upgrade);
    } else {
      console.log("Not enough money!");
    }    
  };

  return (
    <VStack w="100%" flex={1}>
      <Text fontSize="2xl">Upgrades</Text>
      {additiveUpgrades.map((upgrade, index) => (
        <Box key={index} borderWidth="1px" borderRadius="lg" p="4">
          <Text>{upgrade.name} ({upgrade.level ?? 0})</Text>
          <Text>Cost: {upgrade.cost}</Text>
          <Button colorScheme="blue" onClick={() => handleUpgrade('upgrade')(upgrade)}>Buy</Button>
        </Box>
      ))}

      {clickMultiplierUpgrades.map((upgrade, index) => (
        <Box key={index} borderWidth="1px" borderRadius="lg" p="4">
          <Text>{upgrade.name} ({upgrade.level ?? 0})</Text>
          <Text>Cost: {upgrade.cost}</Text>
          <Button colorScheme="blue" onClick={() => handleUpgrade('clickMulti')(upgrade)}>Buy</Button>
        </Box>
      ))}

    </VStack>
  );
};

export default Upgrades;
