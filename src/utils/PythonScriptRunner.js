import  { exec } from 'child_process'
import { promises as fs } from "fs"
// Function to run the Python script
export function runPythonScript(scriptPath, callback) {
    // exec("pwd")
    // exec(`python ${scriptPath}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error executing Python script: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.error(`Python script error: ${stderr}`);
    //         return;
    //     }
    //     console.log(`Python script output: ${stdout}`);
    //     callback();  // Once the script is done, execute the callback function
    // });

    callback()
}




import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser, CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import 'dotenv/config'
import { News, NewsItem } from '../models/newsCollection.model.js';

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,  
  model: "llama3-8b-8192",
  temperature: 0,
});

const systemMessageForSummary = "You will be given an article and you have to create a summary of that article in 5 to 10 scentences and separate each sentence with '|#' symbol. Return ONLY the summary with no introduction, no explaintation. Do not add any helping text from that shows that this is an AI generated summary"


const tagPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemMessageForSummary],
    ["user", "{userMessage}"]
])

// const parser = new CommaSeparatedListOutputParser();
const parser = new StringOutputParser();

const summaryModel = tagPromptTemplate.pipe(model).pipe(parser)
// const summaryModel = tagPromptTemplate.pipe(model)

// Function to load and manipulate the generated JSON file
export async function handleGeneratedFile(filePath, newsProviderName) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        console.log("Type of data", typeof data)
        if(!data){
    
            throw new Error("File not found");
        }
        const jsonData = JSON.parse(data);
        console.log("Parsed JSON data:", jsonData[0]);
        
        let numAtricles = 10
        if(jsonData?.length < numAtricles){
            numAtricles = jsonData.length;
        }
        let newsObjectIDs = [];
        for(let i = 0; i < numAtricles; i++){
            const modelSummary = await summaryModel.invoke({userMessage: jsonData?.[i]?.article_text?? ''})
            let modelOutput = modelSummary.split('|#') 
            let newNews = new NewsItem({
                topic_title: jsonData[i].topic_title,
                article_title: jsonData[i].article_title,
                article_url: jsonData[i].article_url,
                article_date: jsonData[i].article_date,
                article_text: modelOutput
            })

            console.log("This is article ", i , " :", newNews)
            newNews.save();
            newsObjectIDs.push(newNews._id)
        }
        console.log("These are ids", newsObjectIDs)
        // now find the news source provider
        let newsChannel  = await News.findOne({name: newsProviderName})
        if(!newsChannel){
            throw new Error("Failed to add news as no news channel for found")
        }

        // Loop through all news_ids and delete corresponding News entries
        for (const newsId of newsChannel.news) {
            await NewsItem.findByIdAndDelete(newsId);  // Delete each news document by its ID
        }

        // set the channel news to new ids
        newsChannel.news = newsObjectIDs;

        await newsChannel.save()
        // console.log("This is model split", modelOutput)
        
    } catch (error) {
        console.error(`Error in generated file handler: ${error.message}`);
        return;
    }

}
