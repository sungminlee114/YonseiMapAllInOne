var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.redirect('sinchon');
});

router.get('/sinchon', function(req, res, next) {
  res.render('index', { campus: 'Sinchon' });
});

router.get('/songdo', function(req, res, next) {
  res.render('index', { campus: 'Songdo' });
});

module.exports = router;
