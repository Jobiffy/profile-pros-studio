-- Resumes table. Until now resume content lived only in browser localStorage
-- under un-namespaced keys (jobiffy-resumes / jobiffy-active-resume), so any
-- account that signed in on a given browser would inherit whatever resume
-- the previous account had been editing. This table moves resume content
-- server-side, scoped to auth.uid() with RLS, so each user's resumes follow
-- them across devices and never leak across accounts.

CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Resume',
  data JSONB NOT NULL,
  chat_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX resumes_user_updated_idx ON public.resumes(user_id, updated_at DESC);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- update_updated_at_column() is defined in the user_credits migration.
CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
