import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt'
import User from '../models/User.js';
import { sendVerificationMail } from '../services/EmailService.js';
import { getDateString, decipherString } from '../utils/helper.js';

const router = express.Router();

router.post('/register',
  isLoggedIn,
  verifyRegisterPayload, 
  async (req, res) => {
    
    const user = await User.findOne({ email: req.body.email })

    if(!user){
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      await User.create({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        verified: false
      })
      
      if(await sendVerificationMail(req.body))
        res.send('Please check your email for verification.');
      else
        res.send('Unable to send verification email. Please try again later.');
    }
    else if(!user.verified){
      res.send('Please check your email and complete verification.');
    }
    else{
      res.status(409)
      res.send('An account with the same email already exists! Please Login.')
    }
  }
)

router.get('/register/verify', 
  async (req,res) => {
    const user = await User.findOne({ email: decipherString(req.query.user) })    
    if(user){
      user.verified = true;
      await user.save()
      res.send('User verified successfully! Please continue to login.')
    }
  }
)

router.post('/login', 
  isLoggedIn, 
  passport.authenticate('local'),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    user.sessions.push({
      sessionId: req.sessionID, 
      date: getDateString() 
    })
    await user.save()
    res.send('You were authenticated & logged in!');
  }
);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email']}))

router.get('/auth/google/callback', passport.authenticate('google'), async (req,res) => {
  res.send("LoggedIn")
})

router.get('/', (req,res) => {
  res.send("Auth API for Dropt");
})

export default router;

function verifyRegisterPayload(req,res,next) {
  const payload  = req.body;
  
  if(req.query.user && !decipherString(req.query.user)){
    res.status(400)
    res.send('[400] Bad Request: Please provide valid user query params.')
  }
  else if(!payload.email){
    res.status(400)
    res.send('[400] Bad Request: Please provide a valid email.')
  }
  else if(!payload.password) {
    res.status(400)
    res.send('[400] Bad Request: Please provide a valid password.')
  }
  else if(!payload.username) {
    res.status(400)
    res.send('[400] Bad Request: Please provide a valid username.')
  }
  else{
    next();
  }
}

function isLoggedIn(req,res,next) {
  if(req.user)
      res.redirect('/')
    else
      next()
}