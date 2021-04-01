const router = require('express').Router();
// const postfix = ' - 超市会员管理系统'
const session = require('express-session');

router.use(session({
    secret: 'ECUPL',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: true
    }
}))

const redirectHome = (req, res, next) => {
    if (req.session.adminUserID) {
        console.log("has adminUserID")
        return res.redirect('/dashboard');
    } else if (req.session.userID) {
        console.log("has userID")
        return res.redirect('/')
    } else {
        next();
    }
}

const redirectLogin = (req, res, next) => {
    if (!req.session.adminUserID && !req.session.userID) {
        console.log('User is not logged in.')
        return res.redirect('/login?dm=1');
    } else next();
}

const renderEle = (req, res, next) => {
    res.locals = {
        postfix: ' - 超市会员管理系统',
        isLogin: req.session.userID ? true : false,
        isAdminLogin: req.session.adminUserID ? true : false
    };
    next();
}

router.get('/', renderEle, function (req, res, next) {
    res.render('index', {
        title: '首页',

    });
});

router.get('/login', redirectHome, renderEle, (req, res, next) => {
    res.render('login', {title: '登录'});
    res.end();
})

router.get('/register', redirectHome, renderEle, (req, res, next) => {
    res.render('register', {title: '注册'});
    res.end();
})

router.get('/about', renderEle, (req, res) => {
    res.render('about', {title: '关于'});
    res.end();
})

router.get('/dashboard', redirectLogin, renderEle, ((req, res) => {
    res.send('You\'re in!')
}))

module.exports = router;
