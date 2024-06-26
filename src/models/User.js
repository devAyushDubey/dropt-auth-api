import mongoose from "mongoose";

const sessionsSchema = new mongoose.Schema({
  sessionId: String,
  date: String
})

const userSchema = new mongoose.Schema({
  name: String,
  picture: String,
  username: String,
  email: String,
  googleId: String,
  password: String,
  tier: {
    type: String,
    default: 'free'
  },
  verified: Boolean,
  sessions: [sessionsSchema]
}, { timestamps: true })

const User = new mongoose.model('User', userSchema);

export default User