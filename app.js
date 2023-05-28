const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const config = require('./config');
const http = require('http');
const socketIO = require('./scripts/socketio');

mongoose
    .connect(config.MongoURL)
    .then(() => console.log('MONGODB connected!'))
    .catch(console.log);

const app = express();
const server = http.createServer(app);
socketIO.init(server);

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(express.static(`${__dirname}/public`));

const api = require('./routes');
app.use('/apis', api);

// Handle errors.
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server started on port : ${PORT}.`);
});
