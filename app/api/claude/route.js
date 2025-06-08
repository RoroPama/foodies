import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: message }],
    });

    return Response.json({ response: response.content[0].text });
  } catch (error) {
    return Response.json({ error: "Erreur API" }, { status: 500 });
  }
}
