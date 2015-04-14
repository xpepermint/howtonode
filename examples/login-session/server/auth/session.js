module.exports = function() {

  return function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else if (req.session && req.session.userId) {
      var user = { id: req.session.userId, email: req.session.userId }; // Pretend we query the real database.
      req.authenticate(user, next);
    } else {
      next();
    }
  };

};
