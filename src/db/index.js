import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_CONNECTION}/${DB_NAME}`)
        // console.log("Database connected with connection instance: ", connectionInstance)
    }
    catch(error){
        console.log("Database connection error: ", error.message)
    }
}

export default connectDB

