import { useCallback, useEffect, useRef, useState } from 'react';
import EntryRepository from '../scopes/feed/entry.repository';
import { Entry } from '../scopes/feed/types';

export default () => {
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [currentEntryUuid, setCurrentEntryUuid] = useState<string | null>(null);
  const entryRepositoryRef = useRef(new EntryRepository());

  useEffect(() => {
    const updateCurrentEntry = async () => {
      if (entryRepositoryRef.current && currentEntryUuid) {
        const entry = await entryRepositoryRef.current.fetchOne({
          where: {
            uuid: currentEntryUuid,
          },
        });
        setCurrentEntry(entry);
      }
    };

    updateCurrentEntry();
  }, [entryRepositoryRef, currentEntryUuid]);

  const setEntryUuid = useCallback((uuid) => {
    setCurrentEntryUuid(uuid);
  }, []);

  return { currentEntry, setEntryUuid };
};
