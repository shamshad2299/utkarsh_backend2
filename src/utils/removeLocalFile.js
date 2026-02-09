// src/utils/removeLocalFile.js
import fs from "fs";

export const removeLocalFile = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete local file:", err.message);
    }
  });
};
