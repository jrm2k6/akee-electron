import { DBRecord } from './types';

export default abstract class BaseRepository {
  constructor(readonly tableName: string) {
    this.tableName = tableName;
  }

  abstract async save(payload: any): Promise<DBRecord>;
}
