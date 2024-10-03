import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
   
    commentIDs: {
        type: Schema.Types.ObjectId,
        ref: "CommentCollection"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment", commentSchema)