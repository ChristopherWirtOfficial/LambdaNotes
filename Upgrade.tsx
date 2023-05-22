// Import the useState and useEffect hooks from React
import { useState, useEffect } from 'react';

// Define the Upgrade component
function Upgrade() {
  // Initialize the upgrade level from localStorage
  const [upgradeLevel, setUpgradeLevel] = useState(parseInt(localStorage.getItem('upgradeLevel')) || 0);

  // Update the localStorage value whenever the upgrade level changes
  useEffect(() => {
    localStorage.setItem('upgradeLevel', upgradeLevel.toString());
  }, [upgradeLevel]);

  // Return the component
  return (
    <div className='upgrade'>
      <h2>Upgrade Level: {upgradeLevel}</h2>
      <button onClick={() => setUpgradeLevel(upgradeLevel + 1)}>Upgrade</button>
    </div>
  );
}

export default Upgrade;