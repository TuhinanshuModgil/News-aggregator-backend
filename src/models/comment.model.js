import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    commentBody: {
      type: String,
      required: true,
    },
    tags: {
      type: [
        {
          type: String,
          index:true
        },
      ],
    },
    actionWords: {
      type: [
        {
          type: String,
        },
      ],
    },
    collectionIDs: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "CommentCollection",
        },
      ],
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
