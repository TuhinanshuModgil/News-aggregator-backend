import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Test } from "../models/test.model.js";
const router = Router()
router.route('/test-get').get((req, res)=>{
    console.log("This is test get requesr")
    return res.status(200).json(new ApiResponse(200, "Tesing Get Succesfull", {message: "Test for get successfull"}))
})

router.route('/test-post').post(asyncHandler(async (req, res)=>{
    console.log("This is test post requesr")
    let newTest = await Test.create({
        testMessage: `This is test message ${Math.random()}`
    })
    return res.status(200).json(new ApiResponse(200, "Tesing Post Succesfull", {testMessage: newTest}))
}) )

export default router