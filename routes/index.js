const router = require('express').Router();

const redirectHome = (req, res, next) => {
    if (req.session.adminUserID) {
        return res.redirect('/dashboard');
    } else if (req.session.userID) {
        return res.redirect('/')
    } else {
        next();
    }
}

const redirectLogin = (req, res, next) => {
    if (!req.session.adminUserID && !req.session.userID) {
        res.redirect('/login?dm=1');
    } else next();
}

const redirectIfNotAdmin = (req, res, next) => {
    if (!!req.session.adminUserID || req.app.get('env') === 'dev') {
        next();
    } else {
        if (!!req.session.userID) {
            let err = new Error('权限不足');
            err.status = 401;
            err.name = "Unauthorized";
            next(err);
        } else {
            res.redirect('/');
        }
    }
}
/*
 A middleware to render title and some variables.
*/
router.use((req, res, next) => {
    res.locals = {
        isLogin: !!req.session.userID,
        isAdminLogin: !!req.session.adminUserID,
        adminLevel: (!!req.session.adminLevel) ? req.session.adminLevel : 0,
        username: (!!req.session.username) ? req.session.username : ''
    };
    next();
});


router.get('/', (req, res) => {
    res.render('index', {title: '首页',});
});

router.get('/login', redirectHome, (req, res) => {
    res.render('login', {title: '登录'});
})

router.get('/register', redirectHome, (req, res) => {
    res.render('register', {title: '注册'});
})

router.get('/about', (req, res) => {
    res.render('about', {title: '关于'});
})

router.get('/dashboard', redirectLogin, ((req, res) => {
    res.send('You\'re in!')
}))

router.get('/cashier', redirectIfNotAdmin, (req, res) => {
    res.render('cashier', {title: '收银台'});
})

/*
    If the request misses all middlewares above, or an error are thrown.
 */

// catch 404 and forward to error handler


module.exports = router;
