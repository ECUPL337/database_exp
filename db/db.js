const Database = require('better-sqlite3');
const db = new Database('Supermarket.db', {verbose: console.log, fileMustExist: true});

// const DB_login = db.prepare(
//     'SELECT * FROM Customer WHERE CLogin = @Username AND CPassword = @Password'
// );

//  const DB_adminLogin = db.prepare(
//     'SELECT * FROM Admin WHERE Login = @Username AND Password = @Password'
// ).get();

const table = db.prepare('SELECT name FROM sqlite_master WHERE type = ?').all('table');
console.log(table);
// const DB_adminLogin = sql.prepare('SELECT * FROM "Admin" WHERE Login=@username AND Password=@password');
// const DB_login = sql.prepare('SELECT * FROM Customer WHERE CLogin=? AND CPassword=?');


module.exports = {};
//DB_login, DB_adminLogin