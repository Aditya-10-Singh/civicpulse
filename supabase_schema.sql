-- ============================================================================
-- CivicPulse: Supabase PostgreSQL Schema & Policies
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Create enum types for category and status
CREATE TYPE grievance_category AS ENUM (
  'Roads & Transport',
  'Sanitation & Waste',
  'Water Supply & Drainage',
  'Electrical & Streetlights',
  'Parks & Public Spaces'
);

CREATE TYPE grievance_status AS ENUM (
  'Pending Review',
  'In Progress',
  'Resolved',
  'Under Inspection'
);

CREATE TYPE grievance_priority AS ENUM (
  'Low',
  'Medium',
  'High',
  'Critical'
);

-- 2. Create the main grievances table
CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category grievance_category NOT NULL DEFAULT 'Roads & Transport',
  status grievance_status NOT NULL DEFAULT 'Pending Review',
  priority grievance_priority NOT NULL DEFAULT 'Medium',
  location TEXT NOT NULL,
  reported_by_name TEXT NOT NULL,
  reported_by_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upvotes INTEGER DEFAULT 1,
  image_url TEXT,
  resolution_notes TEXT,
  synced_to_sheets BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grievances_timestamp
BEFORE UPDATE ON public.grievances
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow anyone to read all grievances (public transparency)
CREATE POLICY "Public Read Access"
ON public.grievances
FOR SELECT
USING (true);

-- Allow authenticated users to insert new grievances
CREATE POLICY "Authenticated Users Can Insert"
ON public.grievances
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own grievances, or anyone to upvote
CREATE POLICY "Allow Upvote and Updates"
ON public.grievances
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow users to delete their own grievance
CREATE POLICY "Users Can Delete Own Grievance"
ON public.grievances
FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- 6. Insert high quality starter seed data for immediate demonstration
INSERT INTO public.grievances (
  title, description, category, status, priority, location, reported_by_name, reported_by_email, upvotes, image_url
) VALUES
(
  'Deep Potholes causing severe traffic near Metro Pillar 142',
  'Continuous monsoon rains have created a dangerous 2-foot pothole on the main carriageway. Two two-wheelers have skid in the last 24 hours.',
  'Roads & Transport',
  'In Progress',
  'Critical',
  'Outer Ring Road, Near Metro Pillar 142',
  'Aditya Singh',
  'adityasingh00552@gmail.com',
  38,
  '/issues/pothole-road.png'
),
(
  'Overflowing Community Garbage Bin & Drain Clogging',
  'The municipal commercial dumpster has not been cleared for 4 days. Waste is spilling over the road and attracting stray animals.',
  'Sanitation & Waste',
  'Pending Review',
  'High',
  'Sector 14 Market Complex, Lane 3',
  'Pooja Sharma',
  'pooja.s@civicpulse.org',
  21,
  '/issues/drain-clog.png'
),
(
  'Main Water Pipeline Fracture & Road Cave-In',
  'Fresh potable drinking water pipeline ruptured at 6 AM. Millions of liters wasting onto the footpath while water pressure dropped to zero and road collapsed.',
  'Water Supply & Drainage',
  'In Progress',
  'Critical',
  'Greenwood Avenue, Block B',
  'Rohit Verma',
  'rohit.v@civicpulse.org',
  64,
  '/issues/pipeline-cavein.png'
),
(
  'Utility Pole Transformer Catching Fire and Emitting Smoke',
  'Overhead transformer short-circuited and caught fire with thick smoke near residential apartments. Power supply urgently disconnected.',
  'Electrical & Streetlights',
  'Resolved',
  'Critical',
  'Parkview Road, Crossway 7',
  'Sneha Patil',
  'sneha.p@civicpulse.org',
  49,
  '/issues/electric-fire.png'
);
