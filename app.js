var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var usersRouter = require('./routes/admin');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: "100mb", parameterLimit: 100000000}));
app.use(express.urlencoded({limit: '100mb', extended: true, parameterLimit: 100000000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('./api/updateBuildngData')(app)
require('./api/updateFacilityData')(app)

app.use('/api', apiRouter);
app.use('/admin', usersRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
