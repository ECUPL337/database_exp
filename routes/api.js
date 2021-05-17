// noinspection JSUnresolvedVariable

/*
 API Router File
 Path: /api
*/

const router = require('express').Router();
const db = require('../db/db');

/*
    Middleware.
 */

const authenticateAdminLoggedIn = async (req, res, next) => {
    if (!req.session.adminUserID && (req.app.get('env') !== 'dev')) {
        console.log("UNAUTHORIZED");
        res.status(401).json({
            res: false,
            errMsg: "UNAUTHORIZED"
        }).end();
    } else next();
}

const authenticateLoggedIn = async (req, res, next) => {
    if (!!req.session.adminUserID || !!req.session.userID ||(req.app.get('env') === 'dev') ) {
        next();
    } else {
        res.status(401).json({
            res: false,
            errType: 'UNAUTHORIZED'
        }).end();
    }
}

const rejectEmptyReq = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 || Object.values(req.body).some(e => (e.length === 0))) {
        console.log(req.ip);
        res.status(400).json({
            res: false,
            errType: "EMPTY_REQ"
        }).end();
    } else next();
}

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
        .then(dbRes => res.json(dbRes).end())
        .catch(e => res.json(db.SQL_RestraintErrHandler(e)).end())
        .catch(e => res.status(500).json(db.SQL_OtherErrHandler(e)).end())
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
    return await db.DB_purchase(req.body)
        .then(DBRes => res.json(DBRes).end())
        .catch(e => res.json(db.SQL_RestraintErrHandler(e)).end())
        .catch(e => res.status(500).json(db.SQL_OtherErrHandler(e)).end())
})

router.post('/queryType', async (req,res) => {
    if (isNaN(req.body.offset)) return res.code(400).end();
    return await db.DB_queryType(parseInt(req.body.offset))
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