'use strict'

var config                  = require('./config')
var DB                      = require('./database')
var Users                   = DB.Users
var Wireframes              = DB.Wireframes
var handleValidationErrors  = DB.handleValidationErrors

function list(req, res, next) {
  Users
  .find({})
  .then(function onUsers(users) {
    return res.render('user-list', {
      data: { users: users, }
    })
  })
  .catch(next)
}

function show(req, res, next) {
  var userId        = req.params.userId
  if (!userId) return res.render('user-new-edit')
  var getUser       = Users.findById(userId)
  var getWireframes = Wireframes.find({userId: userId})

  Promise
  .all([getUser, getWireframes])
  .then(function (dbResponse) {
    var user        = dbResponse[0]
    var wireframes  = dbResponse[1]
    if (!user) return res.status(404).end()
    res.render('user-new-edit', {data: {
      user:       user,
      wireframes: wireframes,
    }})
  })
  .catch(next)
}

function update(req, res, next) {
  var userId = req.params.userId
  var dbRequest = userId ?
    Users.findByIdAndUpdate(wireId, req.body, {runValidators: true})
    : new Users(req.body).save()

  dbRequest
  .then(function (user) {
    res.redirect(`/users/${user._id}`)
  })
  .catch(onError)

  function onError(err) {
    handleValidationErrors(err)
    .then(function (errorMessages) {
      req.flash('error', errorMessages)
      res.redirect(req.path)
    })
    .catch(next)
  }
}

function remove(req, res, next) {
  var userId = req.params.userId
  Users
  .findOneAndRemove(userId)
  .then( function () { res.redirect('/users')} )
  .catch(next)
}

function adminResetPassword(req, res, next) {
  var id = req.body.id
  Users
  .findById(id)
  .exec()
  .then(function (user) {
    return user.resetPassword()
  })
  .then(function () {
    res.redirect('/users')
  })
  .catch(next)
}

function userResetPassword(req, res, next) {
  // TBD
  res.redirect('/')
}

function setPassword(req, res, next) {
  Users
  .findOne({
    token: req.params.token,
    email: req.body.username,
  })
  .then(function (user) {
    console.log(user)
    if (!user) {
      req.flash('error', {message: 'no token or bad email address'})
      res.redirect(req.path)
      return Promise.resolve(false)
    }
    return user.setPassword(req.body.password)
  })
  .then(function (user) {
    console.log(user)
    if (!user) return
    res.redirect('/login')
  })
  .catch(next)
}

module.exports = {
  list:               list,
  show:               show,
  update:             update,
  delete:             remove,
  adminResetPassword: adminResetPassword,
  userResetPassword:  userResetPassword,
  setPassword:        setPassword,
}