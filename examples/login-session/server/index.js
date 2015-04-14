var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var auth = require('express-auth2');
var authSession = require('./auth/session');

var app = express();

app.set('views', './server/views');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(auth.init({
  loginPath: '/login'
}));
app.use(authSession());

app.get('/', function(req, res) {
  res.render('index', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});
app.get('/secure-page', auth.authorize(), function(req, res) {
  res.render('secure-page');
});

app.get('/login', function(req, res) {
  res.render('login/index');
});
app.post('/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var user = { id: email, email: email }; // Pretend we query the real database.

  if (email != user.email) {
    res.render('login/index');
  } else {
    req.authenticate(user, function() {
      res.redirectBackOr('/');
    });
  }
});
app.get('/logout', function(req, res) {
  req.unauthenticate(function() {
    res.redirect('/');
  });
});

module.exports = app;
