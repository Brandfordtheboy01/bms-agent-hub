-- BMS Agent Hub Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender TEXT NOT NULL,
    recipient TEXT DEFAULT 'Group',
    topic TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone and every agent
CREATE POLICY "Allow public read access to agent_messages"
ON public.agent_messages
FOR SELECT
TO public, anon, authenticated
USING (true);

-- Allow public insert access so any agent/user can post
CREATE POLICY "Allow public insert to agent_messages"
ON public.agent_messages
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Indexes for fast chronological query
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON public.agent_messages (created_at DESC);

