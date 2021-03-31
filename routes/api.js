const router = require('express').Router();
const db = require('../db/db');

router.get('/*', ((req, res) => {
    res.redirect('/');
}))

router.post('/register', async (req, res) => {
    let base = req.baseUrl
    console.log();
    res.send('Register' + base);
});


router.post('/adminLogin', async (req, res, next) => {
    if(req.body){
        const dbRes = db.DB_adminLogin({
            username:req.body.username,
            password:req.body.password
        })

        if(dbRes) {
            req.session.adminUserID = dbRes.ID;
            res.send( {
                res: true,
                errMsg: "登录成功"
            });

        }
        else res.send({
            res:false,
            errMsg:"登录信息错误",
            dbRes: dbRes

        });
    }
    else res.send({
        res:false,
        errMsg:"参数错误"
    });
})

router.post('/login', async (req, res, next) => {
    if(req.body){
        const dbRes = db.DB_login({
            username:req.body.username,
            password:req.body.password
        })

        if(dbRes) {
            req.session.userID = dbRes.ID;
            res.send( {
                res: true,
                errMsg: "登录成功"
            });

        }
        else res.send({
            res:false,
            errMsg:"登录信息错误",
            dbRes: dbRes

        });
    }
    else res.send({
        res:false,
        errMsg:"参数错误"
    });
})

module.exports = router;