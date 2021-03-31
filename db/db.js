const Database = require('better-sqlite3');
const path = require('path');
const debuglog = require('util').debuglog('dev');

const db_path = path.join(__dirname,'Supermarket.db');
const db = new Database(db_path, {verbose: debuglog, fileMustExist: true});


const login = db.prepare(
    'SELECT * FROM Customer WHERE CLogin = @Username AND CPassword = @Password'
);

const adminLogin = db.prepare(`SELECT * FROM "Admin" WHERE Login=@username AND Password=@password`);

// const table = db.prepare(`SELECT name FROM sqlite_master where type IS 'table' ORDER BY name`);

const register = db.prepare(`INSERT INTO Customer (CLogin, CPassword, CPhone, CBirthday, CWork, CRegDate) VALUES (@username, @password, @phone, @birthday, @workplace,@regDate);`);


const DB_adminLogin = form => {
    const res = adminLogin.get(
        {
            username: form.username,
            password: form.password
        }
    );
    return res;
}

const DB_login = form => {
    const res = login.get(
        {
            Username: form.username,
            Password: form.password
        }
    );
    return res;
}

const DB_register = form => {
    const res = register.exec();
}


module.exports = {DB_adminLogin, DB_login};
//DB_login, DB_adminLogin