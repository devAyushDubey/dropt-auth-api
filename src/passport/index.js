import passport from "passport";
import LocalStrategy from "passport-local";
import * as crypto from "crypto"
import * as GoogleStrategy from "passport-google-oauth20"
import bcrypt from 'bcrypt'
import User from "../models/User.js";
import 'dotenv/config'

const fields = {
  usernameField: 'email',
  passwordField: 'password'
}

const validateLocalUserLogin = async (email, password, done) => {
  const user = await User.findOne({ email: email })
  if(user){
    if(bcrypt.compareSync(password,user.password)){
      done(null, user)
    }
    else{
      done('Passwords do not match', null)
    }
  }
  else{
    done('No account with the provided email exists.', null)
  }
}

const validateGoogleUserLogin = async (accessToken, refreshToken, profile, done) => {
  try{
    const user = await User.findOne({ googleId: profile.id })
    if(user)
      done(null,user)
    else{
      const newUser = await User.create({
        name: profile.displayName,
        picture: profile.photos[0].value,
        email: profile.email,
        username: profile.email,
        password: crypto.randomBytes(20).toString('hex'),
        googleId: profile.id
      })
      done(null,newUser)
    }
  }
  catch(err){
    done(err,null)
  }
}

passport.use(new LocalStrategy(fields, validateLocalUserLogin));

passport.use(new GoogleStrategy.Strategy({
  clientID: `${process.env.GOOGLE_CLIENT_ID}`,
  clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3035/auth/google/callback'
},
validateGoogleUserLogin
))

// Serialize User function with session cookies
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize User function, return user from id
passport.deserializeUser(async (user_id, done) => {
  try{
    const user = await User.findById(user_id)
    done(null, user)
  }catch(err) {
    done(err, null)
  }
});