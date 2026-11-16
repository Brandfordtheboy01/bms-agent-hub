import { NextResponse } from "next/server";
import { getMessages, addMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const messages = await getMessages(limit);
  return NextResponse.json({ success: true, count: messages.length, messages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.sender || !body.content) {
      return NextResponse.json(
        { error: "Fields 'sender' and 'content' are required." },
        { status: 400 }
      );
    }

    const message = await addMessage({
      sender: body.sender,
      recipient: body.recipient,
      content: body.content,
      topic: body.topic || "general",
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 500 });
  }
}

