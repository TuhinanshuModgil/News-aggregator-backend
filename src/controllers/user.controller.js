import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const generateAccessAndRefereshTokens = async(user) =>{
    try {    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}
        // ------ TEST ----------
        // console.log("1", user.generateAccessToken)
        // console.log("2")
        // console.log("3")
        // console.log("4")
        // console.log("5")

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}



const registerUser = asyncHandler(async (req, res)=>{
    console.log("user req body", req.body)
    const {email, username, password } = req.body
    // ------ TEST --------
    console.log("Full name, email, username, password", email, username, password )
    if (
        [ email, username, password].some((field) => field?.trim() === "")
    ) {

        throw new ApiError(400, "All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    const user = await User.create(
        {
            email,
            password,
            username
        }
    )
    return res.status(200).json(new ApiResponse(200, "User registerd successfully", {}))

})

const loginUser = asyncHandler(async (req,res) => {
    
    const {email, password} = req.body
    if (!password || !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({email})
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user)  
    
    const loggedInUser = await User.findById(user).select("-password -refreshToken -commentCollections ")
    
    // set cookies options
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, "User logged in successfully", loggedInUser)
    )
})

const logoutUser = asyncHandler(async (req, res)=>{
    // check for user 
    // clear refresh token from user in database
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1 // remove the field from doc
        }, 
    }, {
        new:true
    })
    
    const options = {
        httpOnly: true,
        secure: true
    }
    
    // clear cookies from browesr
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully",{}))


})

const currentUser = asyncHandler(async (req, res)=>{
    res.status(200).json(new ApiResponse(200, "Current User", req.user))
})

export {registerUser, loginUser, logoutUser, currentUser}