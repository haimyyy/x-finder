var os = require('os');
var express = require('express')
  , passport = require('passport')
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , fs = require('fs-extra');


var controllers = {} , controllers_path = process.cwd() + '/app/controllers'
fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file)
    }
});

var app = express();
var port = process.env.PORT || 8080;
app.locals.name = "x-find";
// configure Express
app.set('port', port);
app.use(express.static(process.cwd() + '/app/public'));
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// user queries
app.post("/user/updateUser", controllers.user.updateUser);
app.post("/user/addFollowList",controllers.user.authenticateUser, controllers.user.addFollowList);
app.post("/user/removeFollowList",controllers.user.authenticateUser, controllers.user.removeFollowList);
app.post("/user/getFollowedUsersData",controllers.user.authenticateUser, controllers.user.getFollowedUsersData);

app.get('/*', function(req, res) {
  r={};
  r.status=0;
  r.message = [app.locals.name+" page not found"];
  res.json(r)
});

//uncaught exception will be caught here
process.on("uncaughtException", function(err) { 
  console.log(err.stack);
});

app.listen(app.get('port'), function(err) {
  console.log(app.locals.name+' Server running...' + app.get('port')+os.EOL+ new Date() );
});