const router = require('express').Router();

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
/*
 A middleware to render title and some variables.
*/
const renderEle = (req, res, next) => {
    res.locals = {
        isLogin: !!req.session.userID,
        isAdminLogin: !!req.session.adminUserID,
        adminLevel: (!!req.session.adminLevel) ? req.session.adminLevel : 0,
        username: (!!req.session.username) ? req.session.username : ''
    };
    next();
}
router.use(renderEle);


router.get('/', (req, res) => {
    res.render('index', {title: '首页',});
    res.end();
});

router.get('/login', redirectHome, (req, res) => {
    res.render('login', {title: '登录'});
    res.end();
})

router.get('/register', redirectHome, (req, res) => {
    res.render('register', {title: '注册'});
    res.end();
})

router.get('/about', (req, res) => {
    res.render('about', {title: '关于'});
    res.end();
})

router.get('/dashboard', redirectLogin, ((req, res) => {
    res.send('You\'re in!')
}))


/*
    If the request misses all middlewares above, or an error are thrown.
 */

// catch 404 and forward to error handler
router.use(function (req, res, next) {
    let err = new Error('页面未找到');
    err.status = 404;
    next(err);
});


// error handler
router.use(function (err, req, res, next) {
    // set locals, only providing error details in dev environment.
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};
    res.locals.error.status = err.status;
    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        title: err.status + ' - ' + err.message
    });
});

module.exports = router;
