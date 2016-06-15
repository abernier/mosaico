'use strict'

function home(req, res, next) {
  return res.render('home', {
    templates: [
      'versafix-1',
      'tedc15',
      'tutorial',
    ]
  })
}

var translations = {
  en: JSON.stringify(require('../res/lang/mosaico-en.json')),
  fr: JSON.stringify(require('../res/lang/mosaico-fr.json')),
}

function editor(req, res, next) {
  return res.render('editor', {
    translations: translations,
  })
}

function adminLogin(req, res, next) {
  res.render('admin-login')
}

function login(req, res, next) {
  return res.render('password-login')
}

function forgot(req, res, next) {
  return res.render('password-forgot')
}

function reset(req, res, next) {
  return res.render('password-reset', {
    data: {token: req.params.token}
  })
}

function dashboard(req, res, next) {
  return res.render('admin-dashboard')
}

module.exports = {
  adminLogin: adminLogin,
  home:       home,
  editor:     editor,
  login:      login,
  forgot:     forgot,
  reset:      reset,
  dashboard:  dashboard,
}
