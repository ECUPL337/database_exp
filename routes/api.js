const express = require('express');
const Database = require('better-sqlite3');
const router = express.Router();


router.post('/register', async (req, res) => {
    let base = req.baseUrl
    console.log();
    res.send('Register' + base);
});

router.post('/login', async (req, res) => {
    const login = req.body
    console.log(login);
    res.send('login');
});

router.post('/adminLogin', async (req, res) => {
    res.send('adminLogin');
});

router.get('/debug', (req, res, next) => {

})

module.exports = router;