// // AISummarizerExperimental.js
// import { GoogleGenAI } from "@google/genai";

// const apiKey = "AIzaSyDd00qqsLLpZ34nNQD_Ypa2ZdQGnpplPG8";

// if (!apiKey) {
//   console.error("❌ VITE_GEMINI_API_KEY is missing in .env file");
// }

// const genAI = new GoogleGenAI({
//   apiKey: apiKey,
// });

// export const generateSummary = async (inputText) => {
//   const prompt = `Summarize the following text into a concise, clear, and well-structured paragraph. Focus on the key points only:\n\n${inputText}`;

//   if (!inputText || inputText.trim().length < 50) {
//     return {
//       err: "Not enough text to summarize. Please write at least 50 characters!",
//       sum: "",
//     };
//   }

//   try {
//     const response = await genAI.models.generateContent({
//       model: "gemini-2.5-flash", // ← Updated to current model
//       contents: prompt,
//     });

//     const summary = response.text();

//     return {
//       err: "",
//       sum: summary || "No summary generated.",
//     };
//   } catch (e) {
//     console.error("Gemini API Error:", e);

//     // Better error message for user
//     let errorMessage = "Failed to generate summary.";

//     if (e.message?.includes("404") || e.message?.includes("not found")) {
//       errorMessage =
//         "Model not found. Please contact developer (model outdated).";
//     } else if (e.message?.includes("API key")) {
//       errorMessage = "Invalid or missing API key.";
//     } else if (e.message?.includes("quota")) {
//       errorMessage = "API quota exceeded. Try again later.";
//     }

//     return {
//       err: errorMessage,
//       sum: "",
//     };
//   }
// };

// AISummarizerExperimental.js
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyDd00qqsLLpZ34nNQD_Ypa2ZdQGnpplPG8";

if (!apiKey) {
  console.error("❌ VITE_GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenAI({
  apiKey: apiKey,
});

export const generateSummary = async (inputText) => {
  const prompt = `Summarize the following text into a concise, clear, and well-structured paragraph. Focus on the key points only:\n\n${inputText}`;

  if (!inputText || inputText.trim().length < 50) {
    return {
      err: "Not enough text to summarize. Please write at least 50 characters!",
      sum: "",
    };
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // FIX: response.text is a property string, not a method
    const summary = response.text;

    return {
      err: "",
      sum: summary || "No summary generated.",
    };
  } catch (e) {
    console.error("Gemini API Error:", e);

    // Better error message for user
    let errorMessage = "Failed to generate summary.";

    if (e.message?.includes("404") || e.message?.includes("not found")) {
      errorMessage =
        "Model not found. Please contact developer (model outdated).";
    } else if (e.message?.includes("API key")) {
      errorMessage = "Invalid or missing API key.";
    } else if (e.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Try again later.";
    }

    return {
      err: errorMessage,
      sum: "",
    };
  }
};
