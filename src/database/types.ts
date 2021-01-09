export type ColumnKeyValue = Record<string, unknown>;
export type ColumnKeyValues = ColumnKeyValue[];

export type DBRecord = {
  id: string;
  values: Record<string, unknown>[];
};

export interface SqlitePayload {
  tableName: string;
  values: ColumnKeyValues;
}

export interface SelectSqlitePayload {
  tableName: string;
  where: Record<string, any>;
  offset?: number;
  limit?: number;
}
