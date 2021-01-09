import { useCallback, useRef } from 'react';
import EntryRepository from '../scopes/feed/entry.repository';
import { Entry } from '../scopes/feed/types';
import { saveFile, deleteFile } from '../utils/file.utils';
import { useMergeFileContent } from './useMergeFileContent';

type UseEntryActionsHookParams = {
  refetch: () => Promise<Entry[]>;
};

function useEntryAction({ refetch }: UseEntryActionsHookParams) {
  const entryRepositoryRef = useRef(new EntryRepository());
  const mergeFileContent = useMergeFileContent();
  const addNewEntry = useCallback(
    async ({ uuid, title, content, date }) => {
      if (entryRepositoryRef.current) {
        const fileName = `${date}-${uuid}.md`;

        await saveFile(fileName, content);

        const res = await entryRepositoryRef.current.save({
          title,
          uuid,
          fileName,
          date,
        });

        await refetch();
        return res;
      }

      return null;
    },
    [entryRepositoryRef, refetch]
  );

  const updateEntryContent = useCallback(
    async (entry, content) => {
      if (entryRepositoryRef.current && entry) {
        await saveFile(entry.fileName, content);
      }

      await refetch();
    },
    [entryRepositoryRef, refetch]
  );

  const consolidateEntries = useCallback(async () => {
    const multipleEntriesPerDateItems = EntryRepository.getItemsWithMultipleEntriesPerDate();

    // eslint-disable-next-line no-restricted-syntax
    for (const entry of multipleEntriesPerDateItems) {
      const { fileNames, uuids, firstUuid, firstFileName } = entry;
      // eslint-disable-next-line no-await-in-loop
      const mergedContent = await mergeFileContent(fileNames.split(','));

      // eslint-disable-next-line no-await-in-loop
      await saveFile(firstFileName, mergedContent);

      entryRepositoryRef.current.deleteWithUuids(
        uuids.split(',').filter((uuid) => uuid !== firstUuid)
      );
    }

    refetch();
  }, [refetch, mergeFileContent]);

  const deleteEntry = useCallback(
    async (entry: Entry) => {
      await deleteFile(entry.fileName);
      entryRepositoryRef.current.deleteWithUuids([entry.uuid]);

      refetch();
    },
    [refetch]
  );

  return { addNewEntry, deleteEntry, updateEntryContent, consolidateEntries };
}

export default useEntryAction;
