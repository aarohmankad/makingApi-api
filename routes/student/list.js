var
  mongoose = require('mongoose'),
  Student = require('./../../models/Student');

module.exports = function(router) {
  // A GET request to /api/students will 
  // get all students
  router.get('/students', function (req, res) {
    Student.find({}, function (err, students) {
      if (err) {
        return res.send(err.message);
      }

      return res.send(students);
    });
  });
};