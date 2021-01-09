export type NewEntryPayload = {
  title: string;
  content: string;
  date: string;
};

export type PersistedEntry = {
  id: number;
  uuid: string;
  title: string;
  fileName: string;
  date: string;
  createdOn: string;
  updatedOn: string;
};

export type Entry = {
  uuid: string;
  title: string;
  content: string;
  date: string;
  fileName: string;
};

export type FeedReducerState = {
  entries: Entry[];
};
