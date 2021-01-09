/* eslint-disable no-console */
// eslint-disable-next-line prettier/prettier
import { ColumnKeyValues, DBRecord, SelectSqlitePayload, SqlitePayload } from './types';

export default class BabyOrm {
  constructor(private readonly dbConnection) {}

  get lastInsertRowId(): number {
    const statement = this.dbConnection.prepare(
      'SELECT last_insert_rowid() as lastInsertRowId'
    );

    const row = statement.get();
    return row.lastInsertRowId;
  }

  save(payload: SqlitePayload): DBRecord[] | DBRecord | null {
    try {
      const { tableName, values } = payload;

      const columnNames = Object.keys(values);
      const insert = this.dbConnection.prepare(
        `INSERT INTO ${tableName} (${columnNames
          .map((columnName) => columnName)
          .join(', ')}) VALUES (${columnNames
          .map((columnName) => `@${columnName}`)
          .join(', ')})`
      );

      const insertMany = this.dbConnection.transaction(
        (entries: ColumnKeyValues) => {
          // eslint-disable-next-line no-restricted-syntax
          for (const entry of entries) {
            insert.run(entry);
          }
        }
      );

      insertMany([values]);
      const rows = this.fetch({
        tableName,
        where: { id: `${this.lastInsertRowId}` },
      });

      return rows;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  fetch(payload: SelectSqlitePayload): DBRecord[] | null {
    try {
      const { tableName, where, offset, limit } = payload;

      const statements = [`SELECT * FROM ${tableName}`];
      const bindings = [];

      if (where) {
        statements.push('WHERE');
        const whereClause = Object.keys(where)
          .map((key) => `${key} = ?`)
          .join(' AND ');
        statements.push(whereClause);
        bindings.push(Object.values(where));
      }

      if (limit) {
        statements.push('LIMIT ?');
        bindings.push(limit);
      }
      if (offset) {
        statements.push('OFFSET ?');
        bindings.push(offset);
      }

      const statement = this.dbConnection.prepare(statements.join(' '));
      const items = statement.all(...bindings);
      return items;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  runRawSql(sql: string): any {
    try {
      const statement = this.dbConnection.prepare(sql);

      const results = statement.all();
      return results;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  delete({
    tableName,
    columnName,
    columnValues,
  }: {
    tableName: string;
    columnName: string;
    columnValues: any[];
  }) {
    try {
      const bindings = new Array(columnValues.length).fill('?');
      const sql = `
        DELETE FROM ${tableName}
        WHERE ${columnName} IN (${bindings.join(',')})
      `;
      const statement = this.dbConnection.prepare(sql);

      return statement.run(...columnValues);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
