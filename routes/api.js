/*
 API Router File
 Path: /api
*/

const router = require('express').Router();
const db = require('../db/db');

/*
    Middleware.
 */

const authenticateAdminLoggedIn = (req, res, next) => {
    if (!req.session.adminUserID && (req.app.get('env') !== 'dev')) {
        console.log("UNAUTHORIZED");
        res.status(401).json({
            res: false,
            errMsg: "UNAUTHORIZED"
        }).end();
    } else next();
}

const authenticateLoggedIn = (req, res, next) => {
    if (!!req.session.adminUserID || !!req.session.userID) {
        next();
    } else {
        res.status(401).json({
            res: false,
            errType: 'UNAUTHORIZED'
        }).end();
    }
}

const rejectEmptyReq = (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        console.log(req.ip);
        res.status(400);
    } else next();
}


const GeneralErrHandler = e => new Promise(resolve => {
    console.log(e);
    return e.message;
})
/*
    Redirect all GET requests to index.
 */

router.get('/*', ((req, res) => {
    res.redirect('/');
}))


/*
    API Routers.
 */

router.post('/logout', authenticateLoggedIn, (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            return res.status(403).send({
                res: false,
                errMsg: '退出失败，请重试'
            }).end();
        }
        res.clearCookie('sid');
        return res.json({
            res: true
        }).end();
    });

})

/*
    APIs that accept data.
 */
router.use(rejectEmptyReq);

router.post('/register', async (req, res) => {
    db.DB_registerPromise(req.body)
        .then(() => res.json({res: true}))
        .catch(e => db.SQL_RestraintErrHandler(e))
        .then(msg => res.json(msg).end())
        .catch(e => {
            console.log(e);
            res.status(500);
        })
});
router.post('/login', async (req, res) => {
    db.DB_login(req.body).then(DBRes => {
        req.session.username = DBRes.username;
        if (DBRes.type === 0) {
            req.session.adminLevel = DBRes.adminLevel;
            req.session.adminUserID = DBRes.adminUserID;
        }
        if (DBRes.type === 1) {
            req.session.userID = DBRes.userID;
        }
        res.json(DBRes)
    })
        .catch(e => res.send(db.SQL_RestraintErrHandler(e)).end())
})

/*
    APIs that need Admin authority.
 */
router.use(authenticateAdminLoggedIn);

router.post('/purchase', async (req, res) => {
    if (req.body.form.length < 1) return res.status(400).end();
    return db.DB_purchase(req.body)
        .then(DBRes => res.json(DBRes).end())
        .catch(e => res.json(db.SQL_RestraintErrHandler(e)).end())
        .catch(e => res.status(500).json(db.SQL_OtherErrHandler(e)).end())
})

router.post('/queryGood', async (req, res) => {
    if (isNaN(req.body.GID)) return res.status(400).end();
    db.DB_queryGoodPromise(req.body.GID)
        .then(DBRes => res.json(DBRes).end())
        .catch(e => res.json(db.SQL_RestraintErrHandler(e)).end())
        .catch(e => res.status(500).json(db.SQL_OtherErrHandler(e)).end())
})


module.exports = router;