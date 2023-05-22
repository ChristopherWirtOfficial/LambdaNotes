// Import the useState and useEffect hooks from React
import { useState, useEffect } from 'react';

// Define the AutoClicker component
function AutoClicker(props: {clicksPerSecond: number}) {
  // Initialize the auto clicker count from localStorage
  const [autoClickerCount, setAutoClickerCount] = useState(parseInt(localStorage.getItem('autoClickerCount')) || 0);

  // Update the localStorage value whenever the auto clicker count changes
  useEffect(() => {
    localStorage.setItem('autoClickerCount', autoClickerCount.toString());
  }, [autoClickerCount]);

  // Return the component
  return (
    <div className='auto-clicker'>
      <h2>Auto Clicker Count: {autoClickerCount}</h2>
      <button onClick={() => setAutoClickerCount(autoClickerCount + 1)}>Buy Auto Clicker ({props.clicksPerSecond} clicks/sec)</button>
    </div>
  );
}

export default AutoClicker;