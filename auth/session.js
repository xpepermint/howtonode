module.exports = function() {

  return function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else if (req.session && req.session.userId) {
      var user = { ... }; // TODO Load user from database.
      req.authenticate(user, next);
    } else {
      next();
    }
  };

};
