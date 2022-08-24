import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
const JWT_SECRET_KEY = "DFH13QJKDJKQ131JNDKJQ2"

class UserController {
  static userRegistration = async (req, res) => {
    console.log(req.body);

    const { name, email, password, password_confirmation, tc } = req.body;

    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email alredy exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            
            const saved_user = await UserModel.findOne({ email: email });

            //Generat JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              JWT_SECRET_KEY,
              { expiresIn: "8d" }
            );

            res
              .status(200)
              .send({
                status: "Success",
                message: " Registration Success",
                token: token,
              });
          } catch (error) {
            console.log(error)
            res.send({ status: "failed", message: "Unable to Register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password dosen't match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);

          if (user.email === email && isMatch) {
            //Generat JWT Token
            const token = jwt.sign(
              { userID: user._id },
              JWT_SECRET_KEY,
              { expiresIn: "8d" }
            );
            res.send({
              status: "success",
              message: "Login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email and  Password is not valid ",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password and Confirm New Password dosen't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.body._id, {
          $set: { password: newHashPassword },
        });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({"user":req.user})
  };

  static sendUserPasswordResetEmail = async(req,res)=>{
    const {email} = req.body
    if(email){
    const user = await UserModel.findOne({email:email})
    
    if(user){
      const secret = user._id + JWT_SECRET_KEY
    const token = jwt.sign({userID:user._id},secret,{expiresIn:'15m'})
    const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
    console.log(link)
    // send email
    let info = await transporter.sendMail({
      from:EMAIL_FROM,
      to: user.email,
      subject:"Saleem - Password Reset Link",
      html:`<a href=${link}> Click Here</a> to Reset Your Password`
    })
    res.send({"status":"success","message":"Password Reset Email Sent... Please Check Email","info":info})
    }else{
      res.send({"status":"failed","message":"Email dosen't exists"})
    }
    }else{
      res.send({"status":"failed","message":"Email Field is Required"})
    }
  }

  static userPasswordReset = async(req,res)=>{
    const{password, password_confirmation}=req.body
    const {id,token}=req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + JWT_SECRET_KEY
    try {
      jwt.verify(token,new_secret)
      if(password && password_confirmation){
      if(password!==password_confirmation){
      res.send({"status":"failed","message":"New Password and Confirm New Password dosen't match"})
      }else{
      const salt = await bcrypt.genSalt(10)
      const newHashPassword = await bcrypt.hash(password,salt)
      await UserModel.findByIdAndUpdate(req.user._id,{$set:{password:newHashPassword}})
      res.send({"status":"Success","message":"Password Reset Successfully"})
      }
      }else{
        res.send({"status":"failed","message":"All Fields are Required"})
      }
    } catch (error) {
      res.send({ "status": "failed", "message": "Invalid Token" });
    }

  }
}

export default UserController;
