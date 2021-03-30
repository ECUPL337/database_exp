const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/test', function (req, res, next) {
    res.render('test', {'title': '你好酷！'});

})
module.exports = router;
