-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'contributor', 'viewer');

-- Create visibility enum
CREATE TYPE public.visibility_level AS ENUM ('private', 'shared', 'public');

-- Create resource type enum
CREATE TYPE public.resource_type AS ENUM ('pdf', 'video', 'image', 'audio', 'note', 'archive', 'software', 'code', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  color TEXT DEFAULT '#14b8a6',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_key TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type resource_type NOT NULL DEFAULT 'other',
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  checksum TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  semester TEXT,
  year TEXT,
  visibility visibility_level NOT NULL DEFAULT 'private',
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_shares table for sharing with specific users
CREATE TABLE public.resource_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (resource_id, shared_with_user_id)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'contributor' THEN 2 
      WHEN 'viewer' THEN 3 
    END
  LIMIT 1
$$;

-- Function to check if user can view resource
CREATE OR REPLACE FUNCTION public.can_view_resource(_user_id UUID, _resource_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.resources r
    WHERE r.id = _resource_id
    AND (
      r.visibility = 'public'
      OR r.owner_id = _user_id
      OR public.has_role(_user_id, 'admin')
      OR (r.visibility = 'shared' AND EXISTS (
        SELECT 1 FROM public.resource_shares rs 
        WHERE rs.resource_id = r.id AND rs.shared_with_user_id = _user_id
      ))
    )
  )
$$;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile and assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User roles policies (only admins can modify, users can view own)
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Courses policies
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Contributors can create courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'contributor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can update courses" ON public.courses FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can delete courses" ON public.courses FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Folders policies
CREATE POLICY "Anyone can view folders" ON public.folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Contributors can create folders" ON public.folders FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'contributor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can update folders" ON public.folders FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can delete folders" ON public.folders FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Resources policies
CREATE POLICY "Users can view accessible resources" ON public.resources FOR SELECT TO authenticated 
  USING (
    visibility = 'public' 
    OR owner_id = auth.uid() 
    OR public.has_role(auth.uid(), 'admin')
    OR (visibility = 'shared' AND EXISTS (
      SELECT 1 FROM public.resource_shares rs 
      WHERE rs.resource_id = id AND rs.shared_with_user_id = auth.uid()
    ))
  );
CREATE POLICY "Contributors can create resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'contributor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can update resources" ON public.resources FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Resource shares policies
CREATE POLICY "Users can view shares for their resources" ON public.resource_shares FOR SELECT TO authenticated 
  USING (shared_with_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND r.owner_id = auth.uid()));
CREATE POLICY "Owners can manage shares" ON public.resource_shares FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND r.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_resources_owner ON public.resources(owner_id);
CREATE INDEX idx_resources_folder ON public.resources(folder_id);
CREATE INDEX idx_resources_course ON public.resources(course_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_visibility ON public.resources(visibility);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_folders_parent ON public.folders(parent_id);
CREATE INDEX idx_folders_owner ON public.folders(owner_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- Enable realtime for resources
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;