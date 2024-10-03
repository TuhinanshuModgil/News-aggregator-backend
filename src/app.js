import express from 'express'
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express()

// this is to configure the incoming JSON to the server 
// we also used the options to set a limit to the amount of JSON
app.use(express.json({
    limit:"16kb"
}))

// the app.use is genreally used to connect the middle wares

// the cross origin resource sharing package
// the cors package can take in some options too in form of an object
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// to get the data through the url we have configured using the url encoded meathod
// the extended option just means that we can use nested objects and the limit again is set
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

// using this we create and define a place (basically a folder) to keep our public assets and files etc
app.use(express.static("public"))

// cookie parser middle ware to add .cookies to our request in which we can access the cookies in a users browser
app.use(cookieParser())

app.get('/', (req, res)=>{
    res.send('Hello from Backend')
})

import commentRouter from './routes/comment.route.js'
import userRouter from './routes/user.route.js'

app.use('/comment', commentRouter)
app.use('/user', userRouter)



export {app}