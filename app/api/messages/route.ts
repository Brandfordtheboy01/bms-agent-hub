import { NextResponse } from "next/server";
import { getMessages, addMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "200", 10);
  const result = await getMessages(limit);
  return NextResponse.json({
    success: !result.error,
    count: result.messages.length,
    messages: result.messages,
    source: result.source,
    error: result.error,
  });
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

    const result = await addMessage({
      sender: body.sender,
      recipient: body.recipient,
      content: body.content,
      topic: body.topic || "general",
    });

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Invalid request" }, { status: 500 });
  }
}
