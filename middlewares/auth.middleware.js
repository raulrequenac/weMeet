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
    res.redirect('/');
  } else {
    next();
  }
}

module.exports.canEditEvents = (req, res, next) => {
  if (req.session.user.role === 'company') {
    next();
  } else {
    req.session.genericError = 'You are not allowed to edit events!'
    res.redirect('/');
  }
}
