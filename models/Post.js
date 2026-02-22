import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, default: "" },
    location: {
      address: { type: String, default: "" },
      lat: { type: Number },
      lng: { type: Number },
    },
    category: {
      type: String,
      enum: ["road", "water", "electricity", "garbage", "safety", "other"],
      required: true,
    },
    samasyaStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    targetGroup: {
      type: String,
      enum: ["volunteer", "authority", "both"],
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Authority response
    authorityResponse: { type: String, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
    // Deadline for authority (24hrs from creation if targeted to authority)
    deadline: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
