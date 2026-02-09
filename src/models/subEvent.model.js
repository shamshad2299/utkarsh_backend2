// src/models/subEvent.model.js
import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },

    description: String,
  },
  { timestamps: true }
);

SubCategorySchema.index({ slug: 1, category: 1 }, { unique: true });

export default mongoose.models.SubCategory ||
  mongoose.model("SubCategory", SubCategorySchema);
