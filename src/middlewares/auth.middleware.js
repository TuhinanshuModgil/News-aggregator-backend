import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWTToken = asyncHandler(async (req, _, next)=>{
    try {
        // get the access token from user or auth token in the header if there are no cookies (like in a native app (native is fancy way to say mobile))
        console.log("Cookies", req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token ){
            throw new ApiError(401, "Unauthorized request")

        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded token", decodeToken)
        const user = await User.findById(decodeToken._id)
        
        // throw error if the user is not there
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
        
        req.user = user

        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid accesss token")
    }
})