const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// ✅ Initialize Gemini client correctly
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/chat", async (req, res) => {
  const { message, userProfile } = req.body;

  const prompt = `
You are FitForge AI, a concise, practical fitness assistant.
User info: ${JSON.stringify(userProfile || {})}.
User says: ${message}.
Respond with short, clear, actionable fitness or nutrition advice under 200 words.
`;

  try {
    // ✅ Correct model loading
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // ✅ Correct generate content call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // ✅ Correct extraction of the text
    const reply = result?.response?.text() || "I couldn’t generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);

    res.status(500).json({
      error: "AI service failed",
      details: error?.message || "Unknown error",
    });
  }
});

module.exports = router;
