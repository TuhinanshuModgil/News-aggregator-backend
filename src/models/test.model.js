import mongoose, { Schema } from "mongoose";

// Define the schema for individual news items
const testSchema = new Schema({
   testMessage: {
    type:String
   }
  });

export const Test = mongoose.model("Test", testSchema);
