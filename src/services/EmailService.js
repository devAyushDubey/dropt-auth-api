import Mailgun from "mailgun.js";
import { cipherString } from "../utils/helper.js";
import 'dotenv/config'

const mailgun = new Mailgun(FormData)

const mg = mailgun.client({username: 'api', key: `${process.env.MAILGUN_API_KEY}`});

export async function sendVerificationMail(user) {

  const baseUrl = process.env.BASE_URL || 'http://localhost:3035'
  const verifyUrl = new URL(baseUrl  + '/register/verify')
  verifyUrl.searchParams.set('user', cipherString(user.email));

  try{
    const res = await mg.messages.create(`${process.env.MAILGUN_DOMAIN}`, 
      {
        from: `Dropt Auth <${process.env.MAILGUN_EMAIL}>`,
        to: [user.email],
        subject: "Verify your Dropt acount!",
        text: "Testing some Mailgun awesomeness!",
        html: `<h1>Hey ${user.username}, verify your Dropt account by clicking on the following:</h1> <a href="${verifyUrl.toString()}">${verifyUrl.toString()}</a>`
      }
    )
    return res.status === 200;
  }
  catch(err){
    console.log("Error", err);
    return false;
  }
}
