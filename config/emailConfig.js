import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'
const EMAIL_HOST = 'smtp.gmail.com'
const EMAIL_PORT = 587
const EMAIL_USER = 'saleem@gmail.com'
const EMAIL_PASS = '123456'
const EMAIL_FROM= 'saleem@gmail.com'

let transporter = nodemailer.createTransport({
   host:EMAIL_HOST,
   port:EMAIL_PORT,
   secure:false,//true for 465,false for other ports
   auth:{
    user:EMAIL_USER, // Admin Gmail ID
    pass:EMAIL_PASS //  Admin Gmail Password
   }
})

export default transporter