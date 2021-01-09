/* eslint-disable react/prop-types */
import MDEditor, { commands } from '@uiw/react-md-editor';
import { format } from 'date-fns';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Flatpickr from 'react-flatpickr';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';

import TopMenu from '../../components/TopMenu';
import routes from '../../constants/routes.json';
import { useLogEntryActions } from '../../contexts/LogEntriesContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

// eslint-disable-next-line no-shadow
const AddNewEntryScreen: FunctionComponent<Props> = () => {
  const history = useHistory();
  const { addNewEntry } = useLogEntryActions();
  const { location } = history;
  const { state = { date: null } } = location;
  const [title, setTitle] = useState<string | undefined>('');
  const [content, setContent] = useState<string | undefined>('');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd')
  );

  const memoizedSaveNewEntry = useCallback(async () => {
    const uuid = v4();
    const res = await addNewEntry({ uuid, title, content, date: selectedDate });
    return res;
  }, [title, content, selectedDate, addNewEntry]);

  useEffect(() => {
    if (state && state.date) setSelectedDate(state.date);
    else setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  }, [state]);

  return (
    <div>
      <TopMenu />
      <div style={{ flex: 1 }}>
        <input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          placeholder="Title"
        />
        <Flatpickr
          options={{
            enableTime: false,
            maxDate: format(new Date(), 'yyyy-MM-dd'),
          }}
          value={selectedDate}
          onChange={(dates, dateStr) => setSelectedDate(dateStr)}
        />
        <MDEditor
          value={content}
          onChange={(_content) => setContent(_content)}
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
      </div>
      <div>
        <button type="button" onClick={memoizedSaveNewEntry}>
          Save
        </button>
        <button type="button" onClick={() => history.push(routes.FEED)}>
          Discard
        </button>
      </div>
    </div>
  );
};

export default AddNewEntryScreen;
