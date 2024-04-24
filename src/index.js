import express from 'express'
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import routes from './routes/index.js';
import './passport/index.js';
import 'dotenv/config'
import mongoose from 'mongoose';

const app = express();

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/dropt-auth'

try{
  await mongoose.connect(mongoURL)
  console.log("Database Connected!")
}catch(err) {
  console.log(err)
}

// Session Store for storing session data by express-sessions
const sessionStore = MongoStore.create({
  mongoUrl: mongoURL,
  collection: "sessions",
});

// Session Middleware
app.use(session({
  secret: 'ayush',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  autoRemove: 'native',
  cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1-Day
      name: 'login'
  }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes)

const PORT = process.env.PORT || 3035;

app.listen(PORT , (err) => {
  if(err){
    console.log(err);
  }else{
    console.log(`App is listening to port ` + PORT);
  }
});