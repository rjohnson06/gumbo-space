// README
// to run :
// node .\app.js
// http://localhost:3000/

const SecureConf = require('secure-conf');
const sconf      = new SecureConf();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
//var cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const routes = require("./routes/routes");

//var indexRouter = require('./routes/index');
//var blogRouter = require('./routes/blog');

const app = express();

// TODO : find a better package for doing connection string management
const test = sconf.decryptFile(
  "./app_config/dbConnect.enc",
  function(err, file, content) {
    if (err) {
        console.log('Unable to retrieve the configuration contents.');
    } else {
        var config = JSON.parse(content);

        var mongoDB = config.Sandbox.db.connectionString;
        mongoose
          .connect( mongoDB, { useNewUrlParser: true , useUnifiedTopology: true})
          .then(() => {

            var db = mongoose.connection;
            db.on(
              'error',
              console.error.bind(console, 'MongoDB connection error:'));

            // TOOD: set proper CORS policy
            const corsConfig = {
              //origin: 'http://localhost:3000'
            }

            app.use(cors(corsConfig));

            // view engine setup
            app.set('views', path.join(__dirname, 'views'));
            app.set('view engine', 'jade');

            app.use(logger('dev'));
            app.use(express.json());
            app.use(express.urlencoded({ extended: false }));
            //app.use(cookieParser());
            //app.use('/static', express.static(path.join(__dirname, 'public')));
            app.use('/', express.static(path.join(__dirname, 'build')));

            app.use("/api", routes);

            //app.use('/', indexRouter);
            //app.use('/blog', blogRouter);

            // catch 404 and forward to error handler
            app.use(function(req, res, next) {
              next(createError(404));
            });

            // error handler
            app.use(function(err, req, res, next) {
              // set locals, only providing error in development
              res.locals.message = err.message;
              res.locals.error = req.app.get('env') === 'development' ? err : {};

              // render the error page
              res.status(err.status || 500);
              res.render('error');
            });

            const port = 3000;

            app.listen(port, () => {
              console.log(`Example app listening at http://localhost:${port}`)
            });
          });
    }
});

console.log("decrypt result: " + test);

module.exports = app;
