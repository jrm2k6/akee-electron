import { useCallback, useEffect, useRef, useState } from 'react';
import EntryRepository from '../scopes/feed/entry.repository';
import { Entry } from '../scopes/feed/types';

export default () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const entryRepositoryRef = useRef(new EntryRepository());

  const fetchEntries = useCallback(async () => {
    if (entryRepositoryRef.current) {
      const fetchedEntries = await entryRepositoryRef.current.fetch({});
      setEntries(fetchedEntries);
      return fetchedEntries;
    }

    return [];
  }, [entryRepositoryRef]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, fetchEntries };
};
