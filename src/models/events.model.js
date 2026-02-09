// src/models/events.model.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    
    event_rule:{
      type :String,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    description: { type: String, required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    venueName: { type: String, required: true },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },

    registrationDeadline: { type: Date, required: true },

    capacity: { type: Number, required: true, min: 1 },

    fee: { type: Number, default: 0, min: 0 },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    eventType: {
      type: String,
      enum: ["solo", "duo", "team"],
      required: true,
    },

    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
    },

    resultsLocked: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

eventSchema.pre("save", function () {
  if (this.endTime <= this.startTime) {
    throw new Error("endTime must be after startTime");
  }
  if (this.teamSize.min > this.teamSize.max) {
    throw new Error("Invalid team size range");
  }
});

//  pre save hook 
eventSchema.pre("save", function () {
  if (this.endTime <= this.startTime) {
    throw new Error("endTime must be after startTime");
  }

  if (this.teamSize.min > this.teamSize.max) {
    throw new Error("Invalid team size range");
  }

  if (this.eventType === "solo") {
    this.teamSize.min = 1;
    this.teamSize.max = 1;
  }

  if (this.eventType === "duo") {
    this.teamSize.min = 2;
    this.teamSize.max = 2;
  }
});
export const Event = mongoose.model("Event", eventSchema);
