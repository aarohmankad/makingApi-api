var
  mongoose = require('mongoose'),
  Student = require('./../../models/Student');

module.exports = function(router) {
  // A DELETE request to /api/students/:id will 
  // delete a student based on id in the url
  router.delete('/students/:id', function (req, res) {
    Student.remove({ id: req.params.id }, function (err, numAffected) {
      if (err) {
        return res.send(err.message);
      }

      return res.send(numAffected);
    });
  });
};