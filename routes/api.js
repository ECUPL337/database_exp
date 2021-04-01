const router = require('express').Router();
const db = require('../db/db');
const session = require('express-session');

router.use(session({
    name: 'sid',
    secret: 'ECUPL',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        // maxAge: max_cookie_life,
        sameSite: true // 'strict'
    }
}))

router.get('/*', ((req, res) => {
    res.redirect('/');
}))

router.post('/register', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.send({
            res: false,
            errType: "EMPTY"
        });
    } else res.send(db.DB_register(req.body));
});


router.post('/adminLogin', async (req, res, next) => {
    if (req.body) {
        const dbRes = db.DB_adminLogin(req.body)
        if (dbRes) {
            req.session.adminUserID = dbRes.ID;
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
    } else res.send({
        res: false,
        errMsg: "参数错误"
    });
})

router.post('/login', async (req, res) => {
    if (req.body) {
        const dbRes = db.DB_login({
            username: req.body.username,
            password: req.body.password
        })

        if (dbRes) {
            req.session.userID = dbRes.CID;
            req.session.CName = dbRes.CName;
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
    } else res.send({
        res: false,
        errMsg: "参数错误"
    });
})

router.post('/logout', (req, res) => {

    if (!req.session.adminUserID && !req.session.userID) {
        return res.send({
            logout: false,
            errMsg: '您还未登录'
        });
    } else {
        req.session.destroy(function (err) {
            if (err) {
                return res.send({
                    logout: false,
                    errMsg: '退出失败，请重试'
                })
            }
            res.clearCookie('sid');
            return res.send({
                logout: true
            })
        });
    }
})
module.exports = router;