import mongoose from "mongoose";

const foodStallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stallName: { type: String, required: true },
    foodType: { type: String, required: true }, // Veg/Nonveg etc

    email: { type: String, required: true },
    phone: { type: String, required: true },

    address: { type: String, default: "" },
    message: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const FoodStall = mongoose.model("FoodStall", foodStallSchema);
