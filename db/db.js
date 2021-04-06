const Database = require('better-sqlite3');
const path = require('path');

const db_path = path.join(__dirname, 'Supermarket.db');
const db = new Database(db_path, {verbose: console.log, fileMustExist: true});


/*
    If the database does not exist, create one.
    const getTable = db.prepare(`SELECT name FROM sqlite_master where type IS 'table' ORDER BY name`);

*/

/*
   Called by api.js
 */

const adminLogin = db.prepare(`SELECT * FROM "Admin" WHERE Login=@username AND Password=@password`);

const DB_adminLogin = form => {
    return adminLogin.get(
        {
            username: form.username,
            password: form.password,
        }
    );
}


const login = db.prepare(
    'SELECT * FROM Customer WHERE CLogin = @Username AND CPassword = @Password'
);
const DB_login = form => {
    return login.get(
        {
            Username: form.username,
            Password: form.password
        }
    );
}


/*
    Pre-handle data got from the database, and return error messages.
 */
const register = db.prepare(`INSERT INTO Customer (CLogin, CPassword, CPhone, CBirthday, CWork, CRegDate, CName)
                             VALUES (@CLogin, @CPassword, @CPhone, @CBirthday, @CWork, @CRegDate, @CName);`);

const DB_register = form => {
    let re = /.* /g;
    let re2 = /.*\./g
    let msg = {};
    let items = {
        CLogin: 'username',
        CPassword: 'password',
        CPhone: 'phone',
        CBirthday: 'birthday',
        CWork: 'workplace',
        CName: 'name'
    }
    let c = {};
    c['CRegDate'] = String(Date.now())
    Object.keys(items).forEach(key => {
        c[key] = form[items[key]];
    });
    try {
        register.run(c);
        msg['res'] = true;
    } catch (e) {
        msg['res'] = false;
        msg['errCode'] = e.errorCode;
        let item = e.message.replace(re, '').replace(re2, '');
        msg['errItem'] = items[item];
        if (e.message.includes('NOT NULL')) {
            msg['errType'] = 'NOTNULL'
        } else if (e.message.includes('UNIQUE')) {
            msg['errType'] = 'UNIQUE'
        } else {
            msg['errItem'] = e.message;
            msg['errType'] = 'OTHER'
        }

    } finally {
        return msg;
    }

}

/*
    Database Transaction
 */
const newPurchase = db.prepare(`INSERT INTO Purchase (CID, GID, PAmount, PTime, PMoney)
                                VALUES (@CID, @GID, @PAmount, @PTime, @PMoney)`)
const updateUserCredit = db.prepare(`UPDATE Customer
                                     SET CCredit = CCredit + @PMoney,
                                         CSum    = CSum + @PMoney
                                     WHERE CID = @CID`)
const purchase = db.transaction(form => {
    newPurchase.run(form);
    updateUserCredit.run(form);
})

const DB_purchase = form => {
    try {

    } catch {

    } finally {

    }
}

module.exports = {DB_adminLogin, DB_login, DB_register, DB_purchase};
