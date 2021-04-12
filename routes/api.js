/*
 API Router File
 Path: /api
*/

const router = require('express').Router();
const db = require('../db/db');

/*
    Middleware.
 */

const rejectEmptyPost = (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        console.log(req.ip);
        res.status(400).send({
            res: false,
            errType: "EMPTY_REQ",
        });
    } else next();
}

const authenticateAdminLoggedIn = (req, res, next) => {
    if (!!req.session.adminUserID) {
        next();
    } else {
        res.send({
            res: false,
            errMsg: "UNAUTHORIZED"
        })
        res.status(401).end();
    }
}

const authenticateLoggedIn = (req, res, next) => {
    if (!!req.session.adminUserID || !!req.session.userID) {
        next();
    } else {
        res.send({
            res: false,
            errMsg: '您还未登录',
            errType: 'UNAUTHORIZED'
        });
        res.status(401).end();
    }
}


/*
    Redirect all GET requests to index.
 */

router.get('/*', ((req, res) => {
    res.redirect('/');
}))


router.post('/logout', authenticateLoggedIn, (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            return res.send({
                res: false,
                errMsg: '退出失败，请重试'
            })
        }
        res.clearCookie('sid');
        return res.send({
            res: true
        })
    });

})

router.use(rejectEmptyPost);

router.post('/register', (req, res) => {
    res.send(db.DB_register(req.body));
});


router.post('/adminLogin', (req, res) => {
    const dbRes = db.DB_adminLogin(req.body)
    if (dbRes) {
        req.session.adminLevel = dbRes.Level;
        req.session.adminUserID = dbRes.ID;
        req.session.userName = dbRes.Login

        res.send({
            res: true,
            errMsg: "登录成功",
            adminUsername: dbRes.Login
        });
    } else res.send({
        res: false,
        errMsg: "登录信息错误",
        dbRes: dbRes
    });
})

router.post('/login', async (req, res) => {
    const dbRes = db.DB_login(req.body);
    if (dbRes) {
        req.session.userID = dbRes.CID;
        req.session.userName = dbRes.CName;

        res.send({
            res: true,
            errMsg: "登录成功",
            CName: dbRes.CName
        });
    } else res.send({
        res: false,
        errMsg: "登录信息错误",
        dbRes: dbRes
    });

})

router.post('/purchase', authenticateAdminLoggedIn, (req, res) => {
    // const dbRes = db.DB_purchase(req.body);
    let items = {
        CID: 'customerID',
        GID: 'goodID',
        PAmount: 'amount',
        PMoney: 'moneySum',
    }
    let c = {};
    c['PTime'] = String(Date.now());
    Object.keys(items).some(key => {
        if (!!req.body[items[key]]) {
            c[key] = req.body[items[key]];
            return true;
        } else return true;
    });
    console.log(c)
})


module.exports = router;