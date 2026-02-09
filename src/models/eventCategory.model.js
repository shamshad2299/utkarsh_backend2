// src/models/eventCategory.model.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    rules: String,

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    slug: { type: String, lowercase: true, unique: true },
  },
  { timestamps: true }
);


export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
