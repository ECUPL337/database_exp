const express = require('express');
const router = express.Router();

let postfix = ' - 超市会员管理系统'

router.get('/', function (req, res, next) {
    res.render('index', {title: '首页', postfix: postfix});
});

router.get('/login', (req, res, next) => {
    res.render('login', {title: '登录', postfix: postfix});
    res.end();
})

router.get('/register', (req, res, next) => {
    res.render('register', {title: '注册', postfix: postfix});
    res.end();
})

router.get('/about', (req, res, next) => {
    res.render('about', {title: '关于', postfix: postfix});
    res.end();
})

module.exports = router;
