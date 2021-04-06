/*
 API Router File
 Path: /api
 */

const router = require('express').Router();
const db = require('../db/db');


const authenticateAdmin = (req, res, next) => {
    if (!!req.session.adminUserID) {
        next();
    } else {
        res.send({
            res: false,
            errMsg: "User is not logged in."
        })
        res.end();
    }
}

/*
    Redirect all GET requests to index.
 */
router.get('/*', ((req, res) => {
    res.redirect('/');
    res.end();
}))


router.post('/register', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.send({
            res: false,
            errType: "EMPTY"
        });
    } else res.send(db.DB_register(req.body));
});


router.post('/adminLogin', async (req, res) => {
    if (req.body) {
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
    } else res.send({
        res: false,
        errMsg: "参数错误"
    });
})

router.post('/login', async (req, res) => {
    if (!!req.body) {
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

/*
    Error Handler
 */

router.post('/*', (req, res) => {
    res.status(404);
    res.send({
        res: false,
        errMsg: "404 Not Found"
    })
    res.end();
})

module.exports = router;