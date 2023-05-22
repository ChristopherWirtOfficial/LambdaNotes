import { atom } from 'jotai';
import { additiveUpgrades, clickMultiplierUpgrades } from './upgrades';

export const countAtom = atom(100);

export const additiveUpgradesAtom = atom(additiveUpgrades);
export const clickMultiplierUpgradesAtom = atom(clickMultiplierUpgrades);


export const baseMultiplierAtom = atom(1);

export const upgradeEffectsAtom = atom(get => {
  const additiveUpgrades = get(additiveUpgradesAtom);
  const baseMultiplier = get(baseMultiplierAtom);
  return additiveUpgrades.reduce((acc, upgrade) => {
    const upgradeEffect = (upgrade.level ?? 0) * upgrade.effect;
    return acc + upgradeEffect;
  }, baseMultiplier);
});

export const clickMultiplierUpgradeEffectsAtom = atom(get => {
  const clickMultiplierUpgrades = get(clickMultiplierUpgradesAtom);
  const baseMultiplier = get(baseMultiplierAtom);

  return clickMultiplierUpgrades.reduce((acc, upgrade) => {
    const upgradeEffect = (upgrade.level ?? 0) * upgrade.effect;
    return acc + upgradeEffect;
  }, baseMultiplier);
});

export const incomeAtom = atom(get => {
  const baseMultiplier = get(baseMultiplierAtom);
  const upgradeEffects = get(upgradeEffectsAtom);

  const val = baseMultiplier * upgradeEffects;

  return Math.ceil(val);
});

export const clickIncomeAtom = atom(get => {
  const upgradeEffects = get(clickMultiplierUpgradeEffectsAtom);
  const income = get(incomeAtom);

  const val = income * upgradeEffects;

  return Math.ceil(val);
});
