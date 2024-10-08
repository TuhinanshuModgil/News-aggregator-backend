import mongoose, { Schema } from "mongoose";

// Define the schema for individual news items
const newsItemSchema = new Schema({
    topic_title: {
      type: String,  // Name of the news article (e.g., title or author)
    },
    article_title: {
      type: String,
      required: true, // The content of the news article
    },
    article_url: {
      type: String,
      required: true, // Source of the news article (e.g., website, publisher)
    },
    article_date: {
      type: String,  // Source of the news article (e.g., website, publisher)
    },
    upvotes:{
      type: Number
    },
    article_text: {
        type: [
          {type:String}
        ] 
    }
  });

const newsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    source: {
      type: [
        {
          type: String,
          index:true
        },
      ],
    },
    news: {
      type: [
        {
          type:  Schema.Types.ObjectId,
          ref: "NewsItem"
        },
      ],
    }
  },
  { timestamps: true }
);

export const News = mongoose.model("News", newsSchema);
export const NewsItem = mongoose.model("NewsItem", newsItemSchema);
