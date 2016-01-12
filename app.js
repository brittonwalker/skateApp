// require dependencies ==========================
var express   = require('express');
var app       = express();
var mongoose  = require('mongoose');
var passport  = require('passport');
var flash     = require('connect-flash');

var morgan        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');

var configDB = require('./config/database.js');



// configuration ==================================
mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration
// require('./config/passport')

// set up the express application =================
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get infro from html forms
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'hbs'); // set up handlebars for templating
app.use(express.static('public'))
// required for passport
app.use(session({ secret: 'ilovebboys' })); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistant login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ==========================================
// require('./app/routes.js')(app, passport);
require('./app/routes.js')(app, passport);
var router = express.Router();

var Location     = require('./app/models/location');

router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
    // res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/locations')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {

        var location = new Location({ name: req.body.name, address: req.body.address, lat: req.body.lat, long: req.body.long});      // create a new instance of the Bear model

        // save the bear and check for errors
        location.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Location created!' });
        });

    })
    .get(function(req, res) {
    Location.find(function(err, locations) {
        if (err)
            res.send(err);

        res.json(locations);
        });
    });

    // on routes that end in /locations/:location_id
    // ----------------------------------------------------
    router.route('/locations/:location_id')

        // get the location with that id (accessed at GET http://localhost:3000/api/locations/:location_id)
        .get(function(req, res) {
            Location.findById(req.params.location_id, function(err, location) {
                if (err)
                    res.send(err);
                res.json(location);
            });
        })

        // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
        .put(function(req, res) {

            // use our bear model to find the bear we want
            Location.findById(req.params.location_id, function(err, location) {

                if (err)
                    res.send(err);

                location.name = req.body.name;  // update the bears info

                // save the bear
                location.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Location updated!' });
                });

            });
        })
        .delete(function(req, res) {
            Location.remove({
                _id: req.params.location_id
            }, function(err, location) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });




app.use('/api', router);

//routes that end in /locations

// launch ==========================================
app.listen(3000, function(){
  console.log('Listening on localhost 3000');
})
