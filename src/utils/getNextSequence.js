// src/utils/getNextSequence.js
import { Counter } from "../models/counter.model.js";

export const getNextSequence = async (name, session) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return counter.seq;
};