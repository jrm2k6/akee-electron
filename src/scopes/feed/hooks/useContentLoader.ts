/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';

import { loadFile } from '../../../utils/file.utils';
import { Entry } from '../types';

export const useContentLoader = (entries: Entry[]) => {
  const [fileContent, setFileContent] = useState('');
  const [contentLoaded, setContentLoaded] = useState(false);

  // eslint-disable-next-line no-shadow
  const fileLoader = async (entries: Entry[]) => {
    const promises = entries.map((entry: Entry) => loadFile(entry.fileName));
    try {
      const fileBuffers = await Promise.all(promises);
      const [firstBuffer, ...remainingBuffers] = fileBuffers;
      const finalBuffer = remainingBuffers.reduce(
        (acc: Buffer, buffer: Buffer) => {
          const updatedAcc = Buffer.concat([
            acc,
            Buffer.from('\n\n', 'utf-8'),
            buffer,
          ]);
          return updatedAcc;
        },
        firstBuffer
      );

      setFileContent(finalBuffer.toString());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const runFileLoader = async (entries: Entry[]) => {
      await fileLoader(entries);
      setContentLoaded(true);
    };
    if (entries.length) runFileLoader(entries);
  }, [entries]);

  return { fileContent, contentLoaded };
};
