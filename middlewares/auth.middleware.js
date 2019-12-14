module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.genericError = 'User is not authenticated!'
    res.redirect('/login');
  }
}

module.exports.isNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "user"){
      res.redirect('/users');
    } else {
      res.session.user.redirect('/companies');
    }
  } else {
    next();
  }
}

module.exports.isCurrentUser = (req, res, next) => {
  if (req.session.user.id === req.params.id) {
    next();
  } else {
    res.redirect('/')
  }
}
