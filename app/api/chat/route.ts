import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a business decision assistant for a hackathon dashboard called "Business Gap Finder".
Your job:
- Answer short and clear
- Compare locations and businesses if asked
- Give reasoning + score out of 100 if possible
- Do NOT hallucinate fake numbers. If unsure, say "based on available data".

User: ${message}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Chat API failed", details: err.message },
      { status: 500 }
    );
  }
}
