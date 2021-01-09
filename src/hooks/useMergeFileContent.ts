/* eslint-disable import/prefer-default-export */
import { useCallback } from 'react';

import { loadFile } from '../utils/file.utils';

export const useMergeFileContent = () => {
  const mergeFileContent = useCallback(async (fileNames: string[]) => {
    const promises = fileNames.map((fileName: string) => loadFile(fileName));
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

    return finalBuffer.toString();
  }, []);

  return mergeFileContent;
};
