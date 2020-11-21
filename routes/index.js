var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.redirect('sinchon');
});

router.get('/report', function(req, res, next) {
  res.render('report');
});

router.get('/credit', function(req, res, next) {
  res.render('credit');
});

router.get('/info', function(req, res, next) {
  res.render('credit');
});

router.get('/sinchon', function(req, res, next) {
  res.render('index');
});

router.get('/songdo', function(req, res, next) {
  res.render('index');
});

module.exports = router;
