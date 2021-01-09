/* eslint-disable react/destructuring-assignment */
import React, { createContext, useContext, useEffect } from 'react';
import useCurrentEntry from '../hooks/useCurrentEntry';
import useEntries from '../hooks/useEntries';
import useEntryActions from '../hooks/useEntryActions';
import { Entry } from '../scopes/feed/types';

type ContextValue = {
  entries?: Entry[] | null;
  fetchEntries?: () => Promise<Entry[]>;
};

type LogEntriesActionsContextValue = Partial<typeof useEntryActions>;
type CurrentLogEntryContextValue = ReturnType<typeof useCurrentEntry>;

export const LogEntriesContext = createContext<ContextValue>({});

export const LogEntriesActionsContext = createContext<LogEntriesActionsContextValue>(
  {
    addNewEntry: () => Promise.resolve(undefined),
    updateEntryContent: () => Promise.resolve(undefined),
    deleteEntry: () => Promise.resolve(undefined),
  }
);

export const CurrentLogEntryContext = createContext<CurrentLogEntryContextValue>(
  {
    currentEntry: null,
    setEntryUuid: () => {},
  }
);

const LogEntriesProvider = (props: any) => {
  const { entries, fetchEntries } = useEntries();
  const { currentEntry, setEntryUuid } = useCurrentEntry();
  const {
    addNewEntry,
    updateEntryContent,
    consolidateEntries,
    deleteEntry,
  } = useEntryActions({
    refetch: fetchEntries,
  });

  useEffect(() => {
    const runConsolidateEntries = async () => {
      await consolidateEntries();
    };

    runConsolidateEntries();
  }, [consolidateEntries]);

  return (
    <LogEntriesContext.Provider value={{ entries, fetchEntries }}>
      <CurrentLogEntryContext.Provider value={{ currentEntry, setEntryUuid }}>
        <LogEntriesActionsContext.Provider
          value={{ addNewEntry, updateEntryContent, deleteEntry }}
        >
          {props.children}
        </LogEntriesActionsContext.Provider>
      </CurrentLogEntryContext.Provider>
    </LogEntriesContext.Provider>
  );
};

export const useLogEntries = () => {
  return useContext(LogEntriesContext);
};

export const useLogEntryActions = () => {
  return useContext(LogEntriesActionsContext);
};

export const useCurrentLogEntry = () => {
  return useContext(CurrentLogEntryContext);
};

export default LogEntriesProvider;
