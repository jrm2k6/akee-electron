/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer } from 'electron';

import BaseRepository from '../../database/BaseRepository';
import { DBRecord } from '../../database/types';
import { Entry } from './types';

export default class EntryRepository extends BaseRepository {
  constructor() {
    super('entries');
  }

  async save(payload: any): Promise<DBRecord> {
    const item = ipcRenderer.sendSync('save', {
      values: payload,
      tableName: this.tableName,
    });

    return item;
  }

  async fetch({
    where,
    limit,
    offset,
  }: {
    where?: Record<string, any>;
    limit?: number;
    offset?: number;
  }): Promise<Entry[]> {
    const items = ipcRenderer.sendSync('fetch', {
      tableName: this.tableName,
      where,
      limit,
      offset,
    });
    return items;
  }

  async fetchOne({
    where,
  }: {
    where?: Record<string, any>;
  }): Promise<Entry | null> {
    const items = await this.fetch({ where });
    return items && items.length ? items[0] : null;
  }

  deleteWithUuids(uuids: string[]) {
    ipcRenderer.sendSync('delete', {
      tableName: this.tableName,
      columnName: 'uuid',
      columnValues: uuids,
    });
  }

  static getItemsWithMultipleEntriesPerDate(): Record<string, string>[] {
    const sql = `
      SELECT date,
        FIRST_VALUE(uuid) OVER (PARTITION BY id ORDER BY id) as firstUuid,
        FIRST_VALUE(fileName) OVER (PARTITION BY id ORDER BY id) as firstFileName,
        GROUP_CONCAT(fileName, ',') as fileNames,
        GROUP_CONCAT(uuid, ',') as uuids,
        COUNT(*) as numItems
      FROM entries
      GROUP BY date
      HAVING numItems > 1
    `;
    const items = ipcRenderer.sendSync('runRawSql', sql);
    return items;
  }
}
