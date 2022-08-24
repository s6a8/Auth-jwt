import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || '8000'
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017"



app.use(cors())
connectDB(DATABASE_URL)
app.use(express.json())
app.use("/api/user",userRoutes)

app.listen(port,()=>{
  console.log(`server listening at http://localhost:${port}`)
})