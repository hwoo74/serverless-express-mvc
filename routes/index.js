var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 이건 동작 안하는듯 ... 필요 없는듯 ..
router.all('/', function(req, res, next) {
  res.render('index', { title: 'Express root is here' });
});

module.exports = router;
