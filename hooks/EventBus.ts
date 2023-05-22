import { GameState } from './GameState';

// TODO: Nail this down
export type EventBusCallback = (...args: any[]) => GameState;

export type EventBusRegisteryRecord = {
  event: string;
  callback: EventBusCallback;
  entity?: string;
  runOnce?: boolean;
  lastFired?: {
    time?: number;
    count?: number;
    args?: any[];
  }
};

export type EventBusRegistry = {
  [key: string]: EventBusRegisteryRecord[];
};

export type EventDef = {
  event: string;
  entity?: string;
};

export type EventBus = {
  registry: EventBusRegistry;
  register: (registerArgs: EventDef, callback: EventBusCallback) => void;
  unregister: (unregisterArgs: EventDef) => void;
  registerOnce: (registerArgs: EventDef, callback: EventBusCallback) => void;
  emit: (dispatchArgs: EventDef, ...args: any[]) => void;
};

const createEventBus = () => {
  const eventBus: EventBus = {
    registry: {},
    register: (registerArgs: EventDef, callback: EventBusCallback) => {
      const { event, entity } = registerArgs;

      const record = {
        event,
        callback,
        entity,
      };

      // Lmao does this really work like that? Very fucking cool if so, that's way better than classes or `this`
      eventBus.registry[event] = [ ...(eventBus.registry[event] || []), record ];

      return record;
    },
    unregister: (unregisterArgs: EventDef) => {
      const { event, entity } = unregisterArgs;

      const records = eventBus.registry[event];

      eventBus.registry[event] = records.filter(record => record.entity !== entity);
    },
    registerOnce: (registerArgs: EventDef, callback: EventBusCallback) => {
      const { event, entity } = registerArgs;

      const record: EventBusRegisteryRecord = {
        event,
        callback,
        entity,
        runOnce: true,
      };

      eventBus.registry[event] = [ ...(eventBus.registry[event] || []), record ];
    },
    emit: (dispatchArgs: EventDef, ...args: any[]) => {
      const { event, entity } = dispatchArgs;

      const records = eventBus.registry[event];

      records?.forEach(({ runOnce, callback, entity: recordEntity }) => {
        if (recordEntity === entity) {
          callback(...args);
          if (runOnce) {
            eventBus.unregister(dispatchArgs);
          }
        }
      });
    },
  };

  return eventBus;
};

export default createEventBus;
