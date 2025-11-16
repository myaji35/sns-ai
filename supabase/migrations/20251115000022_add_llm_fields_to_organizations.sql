-- Add LLM configuration fields to organizations table

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS llm_provider TEXT CHECK (llm_provider IN ('chatgpt', 'gemini', 'claude')),
ADD COLUMN IF NOT EXISTS llm_api_key TEXT;

COMMENT ON COLUMN public.organizations.llm_provider IS 'LLM provider selection (chatgpt, gemini, or claude)';
COMMENT ON COLUMN public.organizations.llm_api_key IS 'API key for the selected LLM provider';
