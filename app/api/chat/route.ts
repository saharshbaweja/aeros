import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildContext } from "@/lib/ai/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        message:
          "Running in demo mode - no OpenAI API key configured.\n\nTo enable AI responses, add OPENAI_API_KEY to your .env.local file.",
      });
    }

    const systemPrompt = buildContext();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiMessage = completion.choices[0]?.message?.content || "I couldn't process that request.";

    return NextResponse.json({ message: aiMessage });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Error: ${message}` },
      { status: 500 }
    );
  }
}
