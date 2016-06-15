'use strict'

var passport      = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session       = require('express-session')
var flash         = require('express-flash')
var MongoStore    = require('connect-mongo')(session)

var config        = require('./config')
var DB            = require('./database')
var Users         = DB.Users

var adminUser = {
  isAdmin: true,
  id: -1,
  name: 'admin',
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    // admin
    if (username === config.admin.username) {
      if (password === config.admin.password) {
        return done(null , adminUser)
      }
      return done(null, false, { message: 'Incorrect password.' })
    }
    // user
    Users
    .findOne({ email: username })
    .then(function (user) {
      if (!user) return done(null, false, {message: 'no user'})
      var isPasswordValid = user.comparePassword(password)
      if (!isPasswordValid) return done(null, false, { message: 'Incorrect password.' })
      return done(null, user)
    })
    .catch(function (err) {
      return done(null, false, err)
    })
  }
))

passport.serializeUser(function(user, done) {
  console.log('serializeUser')
  console.log(user)
  // if (user.id === -1) return done(null, adminUser)
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  if (id === -1) return done(null, adminUser)
  Users
  .findById(id)
  .then(function (user) {
    done(null, user)
  })
  .catch(function (err) {
    return done(null, false, err)
  })
})


function init(app) {
  app.use(session({
    secret:             'keyboard cat',
    resave:             false,
    saveUninitialized:  false,
    store: new MongoStore({ mongooseConnection: DB.connection })
  }))
  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())
}

function guard(role) {
  if (!role) role = 'user'
  var isAdminRoute = role === 'admin'
  return function guardRoute(req, res, next) {
    var user = req.user
    if (!user) {
      if (isAdminRoute) return res.redirect('/admin')
      return res.redirect('/login')
    }
    if (isAdminRoute && !user.isAdmin) res.status(401).end()
    next()
  }
}

function logout(req, res, next) {
  var isAdmin = req.user.isAdmin;
  req.logout()
  res.redirect(isAdmin ? '/admin' : '/')
}

module.exports = {
  init:         init,
  session:      session,
  passport:     passport,
  // without bind, passport is failing
  authenticate: passport.authenticate.bind(passport),
  guard:        guard,
  logout:       logout,
}
