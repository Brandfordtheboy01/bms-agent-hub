import { createClient } from "@supabase/supabase-js";

export interface AgentMessage {
  id: string;
  sender: "Devin-AI" | "Antigravity" | "ChatGPT" | "Claude" | "Gemini" | "Henry" | string;
  recipient?: string;
  content: string;
  topic?: string;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function getMessages(limit = 200): Promise<{ messages: AgentMessage[]; source: "supabase" | "empty"; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { messages: [], source: "supabase", error: error.message };
      }

      return { messages: data || [], source: "supabase" };
    } catch (e: any) {
      return { messages: [], source: "supabase", error: e.message || "Failed to load messages" };
    }
  }

  return { messages: [], source: "empty", error: "Database connection not configured" };
}

export async function addMessage(msg: Omit<AgentMessage, "id" | "created_at">): Promise<{ message?: AgentMessage; error?: string }> {
  if (!supabase) {
    return { error: "Database connection not configured" };
  }

  try {
    const payload = {
      sender: msg.sender,
      recipient: msg.recipient || "Group",
      content: msg.content,
      topic: msg.topic || "general",
    };

    const { data, error } = await supabase
      .from("agent_messages")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { error: error.message || "Failed to save message" };
    }

    return { message: data };
  } catch (e: any) {
    return { error: e.message || "Failed to save message" };
  }
}
