import { useState } from 'react';
import { uuid } from 'helpers';

const logMessage = (...message: any[]) => {
  console.log(...message);
};

const LOG_THROTTLE = 5000;
const queuedLogMessages: Map<string, any[]> = new Map();
const logMessages = () => {
  Array.from(queuedLogMessages.values()).forEach(logMessage);
  queuedLogMessages.clear();
};
setInterval(logMessages, LOG_THROTTLE);

// TODO: I should refactor this to actually just use useTick lmaoooo I already have so much better scheduling features.
// I could make each call automatically get its own ID, but it might also be time to provide a version of useTick where you can give a
// static ID, almost exactly like what we did here with makeStaticUseLog
const useLogGuts = (id: string, message: any[]) => {
  const setupLog = (key: string) => (...msg: any[]) => {
    if (!queuedLogMessages.has(key)) {
      // If it's the first time through, log asap as well
      logMessage(...msg);
    }
    queuedLogMessages.set(key, msg);
  };

  setupLog(id)(message);
  return setupLog(id);
};

const useLog = (...message: any[]) => {
  const [ id ] = useState(uuid());

  return useLogGuts(id, message);
};

// Create a version of the useLog hook with a static ID which is also the prefix for the log messages.
// Great for sharing a single useLog entry for multiple instances of the same component.
export const makeStaticUseLog = (key: string) => (...message: any[]) => useLogGuts(key, [ key, ...message ]);

export default useLog;
