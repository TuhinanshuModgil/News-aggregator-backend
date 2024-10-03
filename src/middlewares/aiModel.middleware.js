import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser, CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import 'dotenv/config'

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,  
  model: "llama3-8b-8192",
  temperature: 0,
});

// const systemMessage = "You will recieve a comment from the user, only return a comma separated list of sentiments such as positive, negative, sugggestion, etc. based on the comment"
const systemMessageForTags = "You are a text parses, you will be given a text and you have to label the text using only the following labels and nothing else. The labels are positive, negative, sugggestion. Only return the labels that you think apply separated by comma. Dont return in any other format"


const tagPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemMessageForTags],
    ["user", "{userMessage}"]
])

const parser = new CommaSeparatedListOutputParser();

const tagChain = tagPromptTemplate.pipe(model).pipe(parser)



export const aiTagParser = async (req, res, next) => {
  try {
    const modelTags = await tagChain.invoke({userMessage: req.body.commentBody})
    // add a check that the arry only containse specified tags and not anything else
    req.body.tags = modelTags ;
    next();
  } catch (error) {
    console.log("error in model response: ", error.message)
  }  
};

const systemMessageForActionWords = "You are a text parses, you will be given text and you have to determine what action does the user want to take bases on the text. Return a short text that describes the action. If there are multiple action that user wants to take return them separated by commas. Dont return in any other format. "



const actionWordPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemMessageForActionWords],
    ["user", "{userMessage}"]
])
const actionWordChain = actionWordPromptTemplate.pipe(model).pipe(parser)


export const aiActionWords = async (req, res, next)=>{
  try {
    const modelActionWords = await actionWordChain.invoke({userMessage: req.body.commentBody})
    req.body.actionWords = modelActionWords ;
    next();
  } catch (error) {
    console.log("error in model response: ", error.message)
  }
}
