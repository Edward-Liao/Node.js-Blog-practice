// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const indexRouter = require('./routes/index');
const dashboardRouter = require('./routes/dashboard');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('express-ejs-extend'));

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600 * 1000 },
}));
app.use(flash());

app.use('/', indexRouter);

app.use('/auth', authRouter);

// check login
app.use((req, res, next) => {
  if (req.session.uid) {
    return next();
  }
  return res.redirect('/');
});

app.use('/dashboard', dashboardRouter);

// catch 404 and forward to error handler
app.use((req, res) => {
  const err = new Error('Not Found');
  err.status = 404;
  res.render('error', {
    title: '404 Oops! 頁面不見囉~',
  });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: '500 Oops! 頁面不見囉~',
  });
});

module.exports = app;
