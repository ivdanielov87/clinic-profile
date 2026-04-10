const { DatabaseSync } = require('node:sqlite');

const dbPath = process.argv[2];
const sql = process.argv[3];

if (!dbPath || !sql) {
  console.error('usage: node tools/inspect-vscode-db.js <dbPath> <sql>');
  process.exit(1);
}

const db = new DatabaseSync(dbPath, { readonly: true });
const rows = db.prepare(sql).all();
console.log(JSON.stringify(rows, null, 2));
