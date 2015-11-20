We're going to make our own API for a school database.

1.  Start by making a package.json and including our dependencies.

  {
    "dependencies": {
      "body-parser": "^1.14.1",
      "express": "^4.13.3",
      "mongoose": "^4.1.11"
    }
  }

2.  Now in Git Bash in the current folder, run `npm install`. 
    It should take a while to install all the dependencies.

3.  Make a server.js file and include all our dependencies, and configure them.

    var
      express = require('express'),
      mongoose = require('mongoose'),
      app = express(),
      bodyParser = require('body-parser'),
      port = process.env.PORT || 8000;

    // Allow us to return json to client
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use(bodyParser.json());

4.  That code makes sure we can send form data (urlencoded) and json 
    data to our server and send it back. Now we want to create a
    middleware, this makes sure the data we're receiving isn't malicious.

  // Add headers for http requests
  app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,origin,content-type,accept');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);

      // Pass to next layer of middleware
      next();
  });

5.  Now we can connect to our mongo database.

  // Connect to our mongo database
  mongoose.connect('mongodb://localhost/school');

6.  To access and send data, we need to create `routes`. Create a 
    folder named routes and put an `index.js` file in it.

  var
    express = require('express'),
    fs = require('fs'),
    path = require('path'),
    router = express.Router();

  /**
   * returns all folder names in `srcpath` directory
   * @param srcpath {String} Directory you want to get folder names from
   * @return {Array} all folder names in `srcpath` directory
   */
  function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
      path.resolve(__dirname, file);
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  };

  /**
   * function is called when file is `required`
   */
  module.exports = function(app) {
    // Use /api prefix for all routes
    app.use('/api', router);

    // Get all folder names in current directory
    var folders = getDirectories(__dirname);
    for (var i = folders.length - 1; i >= 0; i--) {
      // Call every route file in each folder
      fs.readdirSync(__dirname + '/' + folders[i]).forEach(function(file) {
        if (file == 'index.js') return;
        
        var name = file.substr(0, file.indexOf('.'));
        require('./' + folders[i] + '/' + name)(router);
      });
    };
  };

7.  You don't have to worry about that code too much, basically 
    you can now create any and as many routes as you want without having to 
    manually instantiate them. Your folder structure with routes will 
    look something like this:

  project folder
    -- routes
      -- student
        -- create.js
        -- update.js
        -- etc.
      -- index.js

8.  Now before we make any routes, we need a Student model. Create a
    models folder so the folder structure looks like this:

  project folder
    -- routes
    -- models

9.  Create a `Student.js` file resembling this:

  var mongoose = require('mongoose');

  /**
   * Student model
   * @type {Schema}
   */
  var Student = new mongoose.Schema({
    createdDate: {
      type: Date,
      default: Date.now,
    },
    id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: [
        'Male',
        'Female',
      ],
    },
  });

  // Allow us to export model to other files (e.x. routes)
  module.exports = mongoose.model('Student', Student);

10. The code is pretty self-explanatory. We create a Schema (model)
    that has some instance variables, assign types, defaults, and 
    whether or not it's required or unique.

11. Now we can make some routes. In the routes folder, make a folder
    called `student` and make a `create.js` file.

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

12. Notice how we require the Student model from earlier and specify 
    the route at which we can create a student. Our `req.body` is the
    data that is sent from the client. This is the data we want to
    populate the student with. Similar files can be created for
    list, delete, update, and find.

  --  list.js
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

  -- find.js
  var
    mongoose = require('mongoose'),
    Student = require('./../../models/Student');

  module.exports = function(router) {
    // A GET request to /api/students/:id will 
    // get a student based on id in url
    router.get('/students/:id', function (req, res) {
      Student.find({ id: req.params.id }, function (err, student) {
        if (err) {
          return res.send(err.message);
        } else if (!student) {
          return res.send('No Student with id ' + req.params.id + ' was found.');
        }

        return res.send(student);
      });
    });
  };

  --  delete.js
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

  --  update.js (we have to find AND update a student)
  var
    mongoose = require('mongoose'),
    Student = require('./../../models/Student');

  module.exports = function(router) {
    // A PUT request to /api/students/:id will 
    // update a student based on id in url to
    // match request body
    router.put('/students/:id', function (req, res) {
      Student.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, function (err, student) {
        if (err) {
          return res.send(err.message);
        }

        return res.send(student);
      });
    });
  };

13. Now in the server.js file, instantiate your routes and
    start the server.

  // Instantiate all our routes
  require('./routes/index')(app);

  // Start server
  app.listen(port);
  console.log('Magic happens on port:', port);

14. In the Git Bash anywhere, run `mongod` (do not close this
    whenever you are testing your api!). In the Git Bash in
    the current directory, run `node server.js`.

15. Use a program like Postman in Chrome to test the api. 