const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs')

const db_path = path.join(__dirname, 'Supermarket.db');
const db = new Database(db_path, {verbose: console.log, fileMustExist: false});

/*
    If the database does not exist, create one.
*/
try {
    const getTable = db.prepare("SELECT * FROM Admin").get();
    console.log(getTable);
} catch (e) {
    console.log(e.message)
    console.log('.db File does not exist. Create one.')
    const createDBSQL = fs.readFileSync(path.join(__dirname, 'Supermarket.db.sql'), 'utf8');
    db.exec(createDBSQL);
}

/*
    Terminate the database connection when main programme quits.
 */

process.on('exit', () => db.close());

const SQL_RestraintErrHandler = e => {
    console.log("SQL_RestraintErrHandler: " + e.message);
    let msg = {
        res: false,
        errColumn: e.message.replace(/.* /g, '').replace(/.*\./g, '')
    };
    if (e.message.includes('NOT NULL')) {
        msg['errType'] = 'NOT NULL'
    } else if (e.message.includes('UNIQUE')) {
        msg['errType'] = 'UNIQUE'
    } else if (e.message.includes('FOREIGN KEY') || e.message.includes("NOT EXIST")) {
        msg['errType'] = 'NOT EXIST'
    } else throw e;
    return msg;
}

const SQL_OtherErrHandler = e => {
    console.log("SQL_OtherErrHandler" + e.message);
    let msg = {
        res: false
    }
    if (e.message.includes('BUSY')) {
        msg['errType'] = 'BUSY'
    } else msg['errType'] = e.message
    return msg;
}
/*
   Called by api.js
 */

const DB_login = form => new Promise(resolve => {
    let type = Number(form.type), DBRes;
    switch (type) {
        case 0:
            const adminLogin = db.prepare("SELECT ID, Level FROM Admin WHERE Login = @Username AND Password = @Password");
            DBRes = adminLogin.get(form);
            if (!DBRes) throw new Error("NOT EXIST", "Username DOES NOT EXISTS");
            resolve({
                'res': true,
                'adminUserID': DBRes.ID,
                'adminLevel': DBRes.Level,
                'username': form.Username,
                'type': 0
            });
            break;
        case 1:
            const login = db.prepare("SELECT CID, CName FROM Customer WHERE CLogin = @Username AND CPassword = @Password");
            DBRes = login.get(form);
            if (!DBRes) throw new Error("NOT EXIST", "Username DOES NOT EXISTS");
            resolve({
                'res': true,
                'userID': DBRes.CID,
                'username': DBRes.CName,
                'type': 1
            })
            break;
        default:
            throw new Error("SYNTAX ERROR", "Login type is wrong.");
    }
})

/*
    Pre-handle data got from the database, and return error messages.
 */


const DB_registerPromise = form => {
    const register = db.prepare("INSERT INTO Customer (CLogin, CPassword, CPhone, CBirthday, CWork, CRegDate, CName) VALUES (@CLogin, @CPassword, @CPhone, @CBirthday, @CWork, @CRegDate, @CName)");
    let c = form;
    c['CRegDate'] = String(Date.now())
    // Object.keys(items).forEach(key => c[key] = form[items[key]]);
    return new Promise((resolve, reject) => {
        try {
            register.run(c);
            resolve({
                res: true,
                username: c.CName
            });
        } catch (e) {
            reject(e);
        }
    })
}

/*
    Database Transaction
 */

const purchases = db.transaction((form, CID, timestamp) => {
    const newPurchase = db.prepare(`INSERT INTO Purchase (CID, GID, PAmount, PTime, PMoney) VALUES (${CID}, @GID, @PAmount, ${timestamp}, (SELECT GPrice FROM Goods WHERE GID = @GID) * @PAmount)`)
    const updateUserCredit = db.prepare(`WITH PSUM AS (SELECT GPrice FROM Goods WHERE GID = @GID) UPDATE Customer SET CCredit = CCredit + (SELECT GPrice FROM PSUM)*@PAmount, CSum = CSum + (SELECT GPrice FROM PSUM)*@PAmount WHERE CID = ${CID}`)
    for (const item of form) {
        let obj = {
            GID: item[0],
            PAmount: item[1],
            CID: CID
        }
        newPurchase.run(obj);
        updateUserCredit.run(obj);
    }
})

const purchases_GUEST = db.transaction((form, timestamp) => {
    const newPurchase_GUEST = db.prepare(`INSERT INTO Purchase (GID, PAmount, PTime, PMoney) VALUES (@GID, @PAmount, ${timestamp}, (SELECT GPrice FROM Goods WHERE GID = @GID) * @PAmount)`)
    for (const item of form) {
        newPurchase_GUEST.run({
            GID: item[0],
            PAmount: item[1]
        });
    }
})

const DB_purchase = req => new Promise(resolve => {
    const querySum = db.prepare("SELECT SUM(PMoney) AS moneySum FROM Purchase WHERE PTime = ?")
    const queryCredit = db.prepare("SELECT CCredit AS Credit FROM Customer WHERE CID = ?");
    const queryMemberExist = db.prepare("SELECT CName FROM Customer WHERE CID = ?")
    const timestamp = String(Date.now());
    let res = {
        res: true,
    }
    if (!req.memberID) purchases_GUEST(req.form, timestamp);
    else {
        let memberExists = queryMemberExist.get(req.memberID)
        if (!memberExists) {
            res.res = true
            res.memberExists = false
            return resolve(res);
        }
        purchases(req.form, req.memberID, timestamp);
        res.credit = queryCredit.get(req.memberID).Credit.toFixed(2);
    }
    res.sum = querySum.get(timestamp).moneySum.toFixed(2);
    return resolve(res)
})
/*
    Query Info of Goods.
 */
const DB_queryGoodPromise = GoodID => new Promise(resolve => {
    const queryGood = db.prepare("SELECT GName, GPrice FROM Goods WHERE GID = @GID");
    let msg = {};
    let DBRes = queryGood.get({GID: GoodID});
    msg.res = true;
    msg.goodExists = !!DBRes;
    if (msg.goodExists) {
        msg.goodName = DBRes.GName;
        msg.goodPrice = DBRes.GPrice;
    }
    console.log(msg);
    resolve(msg);
})

const DB_queryType = (NumberPerPage, PageNumber) => new Promise(resolve => {
    const queryType = db.prepare("SELECT * FROM GoodsType ORDER BY TID ASC LIMIT $NumberPerPage OFFSET (($PageNumber - 1) * $NumberPerPage)")
    let dbRes = queryType.all({
        NumberPerPage: parseInt(NumberPerPage, 10),
        PageNumber: parseInt(PageNumber, 10)
    });
    resolve({
        res: true,
        dbRes: dbRes
    })
})

const DB_queryTypeCount = () => new Promise(resolve => {
    const queryTypeCount = db.prepare("SELECT COUNT(*) AS TypeCount FROM GoodsType");
    let dbRes = queryTypeCount.get();
    resolve({
        res: true,
        dbRes: dbRes
    })
})


const DB_appendType = type => new Promise((resolve, reject) => {
    const appendType = db.prepare("INSERT INTO GoodsType(TName) VALUES(?)");
    const info = appendType.run(type);
    console.log(info);
    if (info.changes === 1) {
        resolve({
            res: true
        })
    } else reject(info)
})

const DB_editType = ({TID, TName = ""}) => new Promise(resolve => {
    let dbRes;
    if (TName.length < 1) {
        const queryTNameByTID = db.prepare(`SELECT TName FROM GoodsType WHERE TID = (?)`);
        dbRes = queryTNameByTID.get(TID);

    } else {
        const updateTName = db.prepare(`UPDATE GoodsType SET TName = $TName WHERE TID = $TID`);
        dbRes = updateTName.get(TID)
    }
    resolve({
        res: true,
        dbRes: dbRes,
    })
})

const DB_removeType = ({TID}) => new Promise((resolve => {
    const removeType = db.prepare(`DELETE FROM GoodsType WHERE TID = (?)`);
    const dbRes = removeType.run(TID);
    if (dbRes.changes === 1) resolve({res: true});
    else resolve({res: false})
}))

module.exports = {
    DB_login,
    DB_registerPromise,
    DB_purchase,
    SQL_RestraintErrHandler,
    SQL_OtherErrHandler,
    DB_queryGoodPromise,
    DB_queryType,
    DB_queryTypeCount,
    DB_appendType,
    DB_editType,
    DB_removeType
};
