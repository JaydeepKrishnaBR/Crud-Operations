const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const session = require('express-session')

require('dotenv').config();

const port = process.env.PORT;

const app = express();



app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Using static Applications;
app.use(express.static('public'));
app.use('/css' , express.static(__dirname + 'public/css'));
app.use('/images' , express.static(__dirname + 'public/images'));


//using Express-handlebar template engine
app.engine('hbs', exphbs( { extname : '.hbs' }));
app.set('view engine' , 'hbs')

app.use(session({
    secret: 'ABCDefg',
    resave: false,
    saveUninitialized: true
}))

//routing
const route = require('./server/routes/user');
app.use('/' , route);

app.listen(port , console.log('App Running on port: ' , port));