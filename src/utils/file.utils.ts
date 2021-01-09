import { remote } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';

export const USER_DATA_DIR = remote.app.getPath('userData');
export const ENTRIES_DIR = 'Entries';

let checkFolderExists = false;

export const saveFile = async (fileName: string, content: string) => {
  const folder = path.join(USER_DATA_DIR, ENTRIES_DIR);
  if (!checkFolderExists) {
    try {
      await fs.stat(folder);
    } catch {
      await fs.mkdir(folder);
      checkFolderExists = true;
    }
  }

  await fs.writeFile(
    path.join(USER_DATA_DIR, ENTRIES_DIR, fileName),
    content,
    'utf8'
  );
};

export const loadFile = (fileName: string) => {
  const folder = path.join(USER_DATA_DIR, ENTRIES_DIR);
  return fs.readFile(path.join(folder, fileName));
};

export const deleteFile = (fileName: string) => {
  const folder = path.join(USER_DATA_DIR, ENTRIES_DIR);
  return fs.unlink(path.join(folder, fileName));
};
