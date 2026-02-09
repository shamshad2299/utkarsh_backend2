import mongoose from "mongoose";

const ThrowbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    cloudinaryId: {
      type: String,
      required: true,
    },

    rank: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export const Throwback = mongoose.model("Throwback", ThrowbackSchema);
