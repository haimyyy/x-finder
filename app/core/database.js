var mongoose = require('mongoose')
    , fs = require('fs')
    , models_path = process.cwd() + '/app/models'


fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js'))
        require(models_path + '/' + file)
});

var dbConfig = {
  mongoUrl:(process.env.PORT)?'mongodb://xfinder:xfinder@ds043168.mongolab.com:43168/heroku_app37431073':'mongodb://localhost:27017/xfinder',
  //mongoUrl:'mongodb://xfinder:xfinder@ds043168.mongolab.com:43168/heroku_app37431073',
  options : {
    db: { native_parser : true },
    server: {
      poolSize: 20,
      auto_reconnect:true,
      socketOptions:{ keepAlive : 1, connectTimeoutMS : 30000 }
    }
  }
};

mongoose.connect(dbConfig.mongoUrl, dbConfig.options);
db = mongoose.connection;

db.on('error', function (err) {
    console.error('MongoDB connection error:', err);
});
db.once('open', function callback() {
    console.info('MongoDB connection is established');
});
db.on('disconnected', function() {
    console.error('MongoDB disconnected!');
    mongoose.connect(dbConfig.mongoUrl, dbConfig.options);
});
db.on('reconnected', function () {
    console.info('MongoDB reconnected!');
});

