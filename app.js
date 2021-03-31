const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan'); //Since v1.5.0, cookie-parser no longer needs to be used.
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/jquery', express.static(path.join(__dirname,'/node_modules/jquery/dist/')));
app.use('/mdui', express.static(path.join(__dirname, '/node_modules/mdui/dist/')));
app.use('/statics',express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json()); // Replace "bodyParser"
app.use(express.urlencoded({extended: true}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use(session({
    secret: 'ECUPL',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        // maxAge: max_cookie_life,
        sameSite:true // 'strict'
    }
}))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req,res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
