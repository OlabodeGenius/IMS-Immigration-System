-- Migration: 20260529000000_setup_messaging.sql
-- Description: Creates the conversations and messages tables for real-time secure messaging.

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, officer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Turn on Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS Policies for conversations
-- Students and Officers can view conversations they are part of
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id OR auth.uid() = officer_id);

-- Students and Officers can create a conversation if they are part of it
CREATE POLICY "Users can create conversations" 
ON public.conversations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id OR auth.uid() = officer_id);

-- Users can update conversations they are part of (e.g. updating updated_at)
CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
TO authenticated 
USING (auth.uid() = student_id OR auth.uid() = officer_id)
WITH CHECK (auth.uid() = student_id OR auth.uid() = officer_id);

-- RLS Policies for messages
-- Users can view messages of conversations they are part of
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.student_id = auth.uid() OR c.officer_id = auth.uid())
    )
);

-- Users can insert messages into conversations they are part of
CREATE POLICY "Users can insert messages" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.student_id = auth.uid() OR c.officer_id = auth.uid())
    )
);

-- Users can update messages (e.g. mark as read)
CREATE POLICY "Users can update messages in their conversations" 
ON public.messages FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.student_id = auth.uid() OR c.officer_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.student_id = auth.uid() OR c.officer_id = auth.uid())
    )
);

-- Trigger to update 'updated_at' on conversations when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
