-- Add approval_token column to profiles for secure email approval
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_token uuid DEFAULT gen_random_uuid();

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_approval_token ON public.profiles(approval_token);