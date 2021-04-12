const express = require('express');
const path = require('path');
const logger = require('morgan'); //Since v1.5.0, cookie-parser no longer needs to be used.
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const app = express();
const session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.postfix = ' - 超市会员管理系统';

app.use(session({
    secret: 'ECUPL',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: true
    }
}))

app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use('/mdui', express.static(path.join(__dirname, '/node_modules/mdui/dist/')));
app.use('/statics', express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json()); // Replace "bodyParser"
app.use(express.urlencoded({extended: true}));
app.use('/api', apiRouter);
app.use('/', indexRouter);

app.use(function (req, res, next) {
    let err = new Error('页面未找到');
    err.status = 404;
    err.name = "Not Found"
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error details in dev environment.
    res.locals.message = err.message || '服务器内部错误';
    res.locals.error = req.app.get('env') === 'dev' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        title: err.status + ' - ' + err.name
    });
});

module.exports = app;
