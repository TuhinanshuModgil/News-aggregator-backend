
import { asyncHandler } from "../utils/AsyncHandler.js";
// import techCrunch from '../../script/final_articles_techCrunch.json' assert { type: 'json' };
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleGeneratedFile, runPythonScript } from "../utils/PythonScriptRunner.js";
import { ApiError } from "../utils/ApiError.js";
import { News, NewsItem } from "../models/newsCollection.model.js";
const updateNews = asyncHandler(async (req, res)=>{

})
export const addNewsChannel = asyncHandler(async (req, res)=>{
    const {name, source} = req.body
    if([name, source].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedChannel = await News.findOne({
        $or: [{ name }, { source }]
    })
    
    if (existedChannel) {
        throw new ApiError(409, "News Source already exists")
    }

    const newsChannel = await News.create(
        {
            name,
            source
        }
    )
    return res.status(200).json(new ApiResponse(200, "News channel created successfully", {}))


})
export const addNews = asyncHandler(async (req, res)=>{
    // const json = await JSON.parse(techCrunch);
    // console.log("tech Crunch", techCrunch[0] )

    // ------ Code For Venture Beats ------
    const pythonScript1 = 'script/Scraper_ventureBeat.py';  // Path to your Python script
    const generatedFile1 = 'final_articles_ventureBeat.json';  // Path to the generated JSON file by the Python script
    const newsProvider1 = 'venture_beat'
    runPythonScript(pythonScript1, () => {
        console.log("Python script finished. Now processing the JSON file... testtt");
        handleGeneratedFile(generatedFile1,newsProvider1);
    });
    
    // const pythonScript2 = 'script/Scraper_techCrunch.py';  // Path to your Python script
    // const generatedFile2 = 'final_articles_techCrunch.json';  // Path to the generated JSON file by the Python script
    // runPythonScript(pythonScript2, () => {
    //     console.log("Python script finished. Now processing the JSON file... testtt");
    //     handleGeneratedFile(generatedFile2);
    // });
    return res.status(200).json(new ApiResponse(200, "news successfully", {}))
})

export const getNews = asyncHandler(async (req, res)=>{
    // Step 1: Fetch all channels
    const channels = await News.find();

    if (!channels || channels.length === 0) {
        return res.status(404).json({ message: 'No channels found.' });
    }

    // Step 2: Extract all news_ids from all channels
    let allNewsIds = [];
    channels.forEach(channel => {
        allNewsIds = [...allNewsIds, ...channel.news];
    });

    // Step 3: Fetch all news objects using the news_ids
    const allNews = await NewsItem.find({ _id: { $in: allNewsIds } });


    // Step 4: Return the combined news objects in a single array
    res.status(200).json({
        message: 'All news from all channels retrieved successfully.',
        news: allNews
    });
})

export const upvoteNews = asyncHandler(async (req, res)=>{
    const {newsItemId} = req.body
    const newsItem = await NewsItem.findById(newsItemId)
    if(!newsItem){
        throw new ApiError(404, "Cant find news article with id")
    }
    console.log('reached upvote route')
    newsItem.upvotes = newsItem.upvotes?newsItem.upvotes + 1: 1;
    await newsItem.save()

    res.status(200).json({
        message: 'Article upvotes successfully',
        upvotes: newsItem.upvotes
    });
    

})