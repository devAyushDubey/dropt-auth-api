import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from 'bcrypt'
import User from "../models/User.js";

const fields = {
  usernameField: 'email',
  passwordField: 'password'
}

const validateUserLogin = async (email, password, done) => {
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

passport.use(new LocalStrategy(fields, validateUserLogin));

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