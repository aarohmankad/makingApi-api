var
  mongoose = require('mongoose'),
  Student = require('./../../models/Student');

module.exports = function(router) {
  // A POST request to /api/students will 
  // create a student based on request body
  router.post('/students', function (req, res) {
    Student.create(req.body, function (err, student) {
      if (err) {
        return res.send(err);
      }

      return res.send(student);
    });
  });
};