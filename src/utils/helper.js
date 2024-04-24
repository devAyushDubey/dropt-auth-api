import Cryptr from "cryptr";
import 'dotenv/config'

const cryptr = new Cryptr(process.env.SECRET_KEY, { saltLength: 5 });

export function cipherString(text) {
  return cryptr.encrypt(text)
}

export function decipherString(text) {
  return cryptr.decrypt(text)
}

export function getDateString() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}