import { app } from "./app.js";
import 'dotenv/config'
import connectDB from "./db/index.js";

// dotenv.config({
//     path: './env'
// })


connectDB()
.then(()=>{
    app.on("error", (err)=>{
        console.log("Error after database connection: ", err.message)
        throw err
    })
}

)
.then(()=>{
    console.log("Starting server listening")
    app.listen(process.env.PORT||5000, ()=>{
        console.log(`server running at ${process.env.PORT||5000}`)
    })
})
.catch((err)=>{
    console.log("failed to start server: ", err.message)
})

export default app