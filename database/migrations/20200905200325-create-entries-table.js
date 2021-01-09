exports.up = function (db, callback) {
  db.createTable(
    'entries',
    {
      columns: {
        id: {
          type: 'int',
          primaryKey: true,
          autoIncrement: true,
        },
        uuid: {
          type: 'string',
          notNull: true,
        },
        title: {
          type: 'string',
          notNull: true,
        },
        fileName: {
          type: 'string',
          notNull: true,
        },
        date: {
          type: 'string',
          notNull: true,
        },
        createdOn: {
          type: 'timestamp',
          // eslint-disable-next-line no-new-wrappers
          defaultValue: new String('CURRENT_TIMESTAMP'),
        },
        // TODO: add trigger on this column once we have multiple tables
        updatedOn: {
          type: 'timestamp',
        },
      },
      ifNotExists: true,
    },
    callback
  );
};

exports.down = function (db, callback) {
  db.dropTable('entries', callback);
};
