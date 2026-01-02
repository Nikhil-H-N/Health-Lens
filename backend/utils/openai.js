const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askHealthAI(userMessage) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",   // ✅ fast + cheap + stable
    messages: [
      {
        role: "system",
        content:
          "You are a health assistant. Give general health information only. Do not diagnose. If symptoms are serious, advise seeing a doctor.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = askHealthAI;
