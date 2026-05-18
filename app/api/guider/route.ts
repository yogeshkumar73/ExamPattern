import { type NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // Initialize LangChain ChatOpenAI configured for OpenRouter
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      modelName: "meta-llama/llama-3.3-70b-instruct",
      temperature: 0.5,
      maxTokens: 500,
    });

    // Format the messages for LangChain
    const langChainMessages = [
      new SystemMessage(
        "You are the Aura AI Academic Guider. Provide concise, highly actionable resources, syllabus insights, or exam strategies for students. Avoid fluff or long paragraphs (minimal use of AI tokens, focused guidance)."
      ),
      ...messages.map((m: any) => 
        m.isAi 
          ? new SystemMessage(m.text) 
          : new HumanMessage(m.text)
      )
    ];

    const response = await chat.invoke(langChainMessages);
    const replyText = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);

    return NextResponse.json({ text: replyText });
  } catch (error: any) {
    console.error("Guider API Error:", error);
    return NextResponse.json(
      { error: "Error generating response", details: error.message },
      { status: 500 }
    );
  }
}
