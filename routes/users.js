var express = require('express');
var router = express.Router();

const TestController = require('../controllers/test-controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/iam', async function(req, res, next) {
    const data = {
      'param' : 'iam page',
      'message' : 'this is static response'
    }
    res.jsonp(data);
});

router.get('/:user', (req, res, next) => {
    var myTestController = new TestController();
    myTestController.getUser(req, res).catch(next);
});

module.exports = router;
