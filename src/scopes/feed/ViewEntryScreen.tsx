/* eslint-disable react/prop-types */
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import TopMenu from '../../components/TopMenu';
import {
  useCurrentLogEntry,
  useLogEntryActions,
} from '../../contexts/LogEntriesContext';
import useDebounce from '../../hooks/useDebounce';
import { useContentLoader } from './hooks/useContentLoader';

interface Props {
  location: any;
}

// eslint-disable-next-line no-shadow
const ViewEntryScreen = (props: Props) => {
  const { location } = props;
  const history = useHistory();
  const [showUpdatedStatus, setShowUpdatedStatus] = useState(false);
  const { updateEntryContent, deleteEntry } = useLogEntryActions();
  const { setEntryUuid, currentEntry } = useCurrentLogEntry();
  const { state = {} } = location;
  const { entries = [] } = state;
  const [isEditMode, setEditMode] = useState(false);
  const { fileContent: loadedContent, contentLoaded } = useContentLoader(
    entries
  );
  const [updatedContent, setUpdatedContent] = useState(loadedContent || '');
  const [autoSaveOnChangeStarted, setStartAutoSaveOnChange] = useState(false);
  const showUpdatedStatusVigil = useRef<number>(0);
  const updatedContentDebounced = useDebounce(updatedContent, 2000);

  useEffect(() => {
    if (entries.length) {
      setEntryUuid(entries[0].uuid);
    }
  }, [entries, setEntryUuid]);

  useEffect(() => {
    if (contentLoaded) setUpdatedContent(loadedContent);
  }, [loadedContent, contentLoaded]);

  const memoizedUpdateContent = useCallback(
    async (content) => {
      if (!currentEntry) return;
      await updateEntryContent(currentEntry, content);
      setShowUpdatedStatus(true);
      showUpdatedStatusVigil.current += 1;
    },
    [updateEntryContent, currentEntry, setShowUpdatedStatus]
  );

  const memoizedDeleteEntry = useCallback(async () => {
    if (!currentEntry) return;
    await deleteEntry(currentEntry);
    history.push({
      pathname: '/feed',
    });
  }, [deleteEntry, currentEntry, history]);

  useEffect(() => {
    const run = async () => {
      if (updatedContentDebounced && autoSaveOnChangeStarted) {
        await memoizedUpdateContent(updatedContentDebounced);
      }
    };

    run();
  }, [updatedContentDebounced, autoSaveOnChangeStarted, memoizedUpdateContent]);

  useEffect(() => {
    let handler: NodeJS.Timeout;
    if (showUpdatedStatus)
      handler = setTimeout(() => setShowUpdatedStatus(false), 2000);

    return () => {
      if (handler) clearTimeout(handler);
    };
  }, [showUpdatedStatusVigil, showUpdatedStatus]);

  return (
    <div>
      <TopMenu>
        {!isEditMode && (
          <button type="button" onClick={() => setEditMode(true)}>
            Edit
          </button>
        )}
        <button type="button" onClick={() => memoizedDeleteEntry()}>
          Delete
        </button>
        {showUpdatedStatus && <span>Updated</span>}
      </TopMenu>
      {!isEditMode && (
        <div style={{ flex: 1 }}>
          {loadedContent.length > 0 && (
            <MDEditor.Markdown source={loadedContent} />
          )}
        </div>
      )}
      {isEditMode && (
        <>
          <MDEditor
            value={updatedContent}
            onChange={(_content) => {
              if (_content) {
                setUpdatedContent(_content);
                setStartAutoSaveOnChange(true);
              }
            }}
            commands={[
              commands.bold,
              commands.italic,
              commands.strikethrough,
              commands.hr,
              commands.title,
              commands.divider,
              commands.link,
              commands.quote,
              commands.code,
              commands.image,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.checkedListCommand,
              commands.codeEdit,
              commands.codeLive,
              commands.codePreview,
            ]}
          />
          <div>
            <button
              type="button"
              onClick={() => memoizedUpdateContent(updatedContent)}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setUpdatedContent(loadedContent)}
            >
              Discard changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewEntryScreen;
