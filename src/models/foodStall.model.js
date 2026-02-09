// src/models/foodStall.model.js
import mongoose from "mongoose";

const foodStallSchema = new mongoose.Schema(
  {
    businessName: {type: String,required: true,trim: true,},
    email: {type: String,required: true,lowercase: true,trim: true,match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],index: true,},
    foodItems: {type: String,required: true,trim: true,},
    ownerName: {type: String,required: true,trim: true,},
    phoneNumber: {type: String,required: true,trim: true},
    permanentAddress: {type: String,required: true,trim: true,},
    numberOfStalls: {type: Number,required: true,min: [1, "Number of stalls must be at least 1"],},
    status: {type: String,enum: ["pending", "approved", "rejected"],default: "pending",index: true,},
    isDeleted: {type: Boolean,default: false,index: true,},
  },
  { timestamps: true }
);

export const FoodStall = mongoose.model("FoodStall", foodStallSchema);
