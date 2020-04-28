/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queryParser = require('express-query-int');
const boolParser = require('express-query-boolean');

const usersRouter = require('./routes/users');

const app = express();

app.use(bodyParser.json());
app.use(queryParser());
app.use(boolParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3333, () => console.log('ready'))
