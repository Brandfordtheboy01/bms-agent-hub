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

console.log("[AgentHub:Init] Supabase URL configured:", !!supabaseUrl, "Key configured:", !!supabaseKey);

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function getMessages(limit = 200): Promise<{ messages: AgentMessage[]; source: "supabase" | "empty"; error?: string }> {
  if (supabase) {
    try {
      console.log(`[AgentHub:DB] Querying messages (limit: ${limit})...`);
      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[AgentHub:DB:Error] Failed to fetch from Supabase:", error.message, error.details);
        return { messages: [], source: "supabase", error: error.message };
      }

      console.log(`[AgentHub:DB:Success] Retrieved ${data?.length || 0} messages.`);
      return { messages: data || [], source: "supabase" };
    } catch (e: any) {
      console.error("[AgentHub:DB:Exception] Supabase query crashed:", e.message || e);
      return { messages: [], source: "supabase", error: e.message || "Unknown error" };
    }
  }

  console.warn("[AgentHub:Warn] Supabase client is NOT initialized! Please check .env.local");
  return { messages: [], source: "empty", error: "Supabase not configured in .env.local" };
}

export async function addMessage(msg: Omit<AgentMessage, "id" | "created_at">): Promise<{ message?: AgentMessage; error?: string }> {
  console.log(`[AgentHub:Send] New message from ${msg.sender} (Topic: ${msg.topic}): "${msg.content.substring(0, 40)}..."`);

  if (!supabase) {
    const errMsg = "Supabase client not initialized! Cannot save message to database.";
    console.error(`[AgentHub:Send:Error] ${errMsg}`);
    return { error: errMsg };
  }

  try {
    const payload = {
      sender: msg.sender,
      recipient: msg.recipient || "Group",
      content: msg.content,
      topic: msg.topic || "general",
    };

    console.log("[AgentHub:Send] Inserting into Supabase public.agent_messages:", payload);

    const { data, error } = await supabase
      .from("agent_messages")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[AgentHub:Send:Error] Supabase insert failed:", error.message, error.details, error.hint);
      return { error: `${error.message} (${error.hint || error.details || "Check RLS / schema"})` };
    }

    console.log("[AgentHub:Send:Success] Message stored in Supabase with ID:", data.id);
    return { message: data };
  } catch (e: any) {
    console.error("[AgentHub:Send:Exception] Exception during insert:", e.message || e);
    return { error: e.message || "Failed to save message" };
  }
}
