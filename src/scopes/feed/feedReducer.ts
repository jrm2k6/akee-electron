import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { saveFile } from '../../utils/file.utils';
import EntryRepository from './entry.repository';
import { Entry } from './types';

export enum Status {
  Saved,
  Failed,
  Saving,
}

const entryRepository = new EntryRepository();

export const saveNewEntry = createAsyncThunk(
  'feed/saveNewEntry',
  async ({
    uuid,
    title,
    content,
    date,
  }: Readonly<Record<string, string>>): Promise<unknown | void> => {
    const fileName = `${date}-${uuid}.md`;

    await saveFile(fileName, content);

    const savedEntry = await entryRepository.save({
      title,
      uuid,
      fileName,
      date,
    });

    return savedEntry;
  }
);

export type FeedSliceState = {
  currentEntryUuid: string | null;
  entries: Entry[];
  statuses: Record<string, Status>;
};

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    currentEntryUuid: null,
    entries: [],
    statuses: {},
  } as FeedSliceState,
  reducers: {
    setCurrentUuid: (state, action) => {
      const uuid = action.payload;
      state.currentEntryUuid = uuid;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveNewEntry.fulfilled, (state, action) => {
      const { uuid, title, content, date, fileName } = action.payload;
      state.entries.push({ uuid, title, content, date, fileName });
      state.statuses = { ...state.statuses, [uuid]: Status.Saved };
    });
    builder.addCase(saveNewEntry.rejected, (state, action) => {
      const uuid = action.meta?.arg?.uuid;
      state.statuses[uuid] = Status.Failed;
    });
    builder.addCase(saveNewEntry.pending, (state, action) => {
      const uuid = action.meta?.arg?.uuid;
      state.statuses[uuid] = Status.Saving;
    });
  },
});

export const { setCurrentUuid } = feedSlice.actions;
export default feedSlice.reducer;
