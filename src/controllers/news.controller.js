
import { asyncHandler } from "../utils/AsyncHandler.js";
// import techCrunch from '../../script/final_articles_techCrunch.json' assert { type: 'json' };
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleGeneratedFile, runPythonScript } from "../utils/PythonScriptRunner.js";
const updateNews = asyncHandler(async (req, res)=>{

})

export const addNews = asyncHandler(async (req, res)=>{
    // const json = await JSON.parse(techCrunch);
    // console.log("tech Crunch", techCrunch[0] )

    const pythonScript = 'script/Scraper_ventureBeat.py';  // Path to your Python script
    // const generatedFile = 'final_articles_ventureBeat.json';  // Path to the generated JSON file by the Python script
    const generatedFile = 'final_articles_ventureBeat.json';  // Path to the generated JSON file by the Python script

    runPythonScript(pythonScript, () => {
        console.log("Python script finished. Now processing the JSON file... testtt");
        handleGeneratedFile(generatedFile);
    });
    return res.status(200).json(new ApiResponse(200, "news successfully", {}))
})