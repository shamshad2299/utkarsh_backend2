import mongoose from "mongoose";

const WebsiteTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

    role: {
      type: String,
      required: true,
      enum: ["frontend", "backend", "fullstack", "designer"],
    },

    college: {
      type: String,
      trim: true,
    },

    course: {
      type: String,
      trim: true,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    portfolio: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export const WebsiteTeam = mongoose.model(
  "WebsiteTeam",
  WebsiteTeamSchema
);
