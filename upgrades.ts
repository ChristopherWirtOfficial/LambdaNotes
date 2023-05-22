export interface AdditiveUpgrade {
  name: string;
  cost: number;
  effect: number;
  level?: number;
}

export const additiveUpgrades: AdditiveUpgrade[] = [
  {
    name: 'Upgrade 1',
    cost: 10,
    effect: 1
  },
  {
    name: 'Upgrade 2',
    cost: 50,
    effect: 5
  },
  {
    name: 'Upgrade 3',
    cost: 100,
    effect: 10
  }
];

export const clickMultiplierUpgrades: AdditiveUpgrade[] = [
  {
    name: 'Click Upgrade 1',
    cost: 1000,
    effect: 0.5
  }
]
