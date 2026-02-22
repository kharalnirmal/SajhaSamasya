import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    authority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    statusUpdate: {
      type: String,
      enum: ["in_progress", "completed"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Response ||
  mongoose.model("Response", ResponseSchema);
