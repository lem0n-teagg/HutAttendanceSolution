-- Run this SQL in your Supabase SQL Editor to set up the database tables
-- ⚠️  This script is now IDEMPOTENT - you can run it multiple times safely!
-- If tables already exist, it will only add missing columns
-- This means you can update your database schema without recreating your project

-- 📌 IMPORTANT: User Approval System
-- - New user signups default to approved = false and role = 'volunteer'
-- - Users cannot login until approved by a staff member
-- - Staff members can approve/deny users through the "User Approvals" page
-- - ONLY Supabase admins can change user roles from volunteer to staff
-- - Make sure to manually set approved = true for your first staff user!

-- 📌 IMPORTANT: Email Confirmation Settings
-- - You MUST disable email confirmation in Supabase Dashboard
-- - Go to Authentication > Providers > Email
-- - Turn OFF "Confirm email" setting
-- - This allows the custom approval system to work properly

-- Copy and paste everything BELOW THIS LINE to the SQL editor

-- ============================================
-- AUTHENTICATION & USER PROFILES
-- ============================================

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Drop old role constraint if it exists and add new one
DO $$ 
BEGIN
  -- Drop the existing constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  RAISE NOTICE 'Dropped old role constraint (if it existed)';
  
  -- Add new CHECK constraint with the three new roles
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('staff', 'manager', 'admin'));
  RAISE NOTICE 'Added new role constraint for staff, manager, admin';
  
  -- Update existing volunteer users to staff (migration from old system)
  UPDATE profiles SET role = 'staff' WHERE role = 'volunteer';
  RAISE NOTICE 'Migrated volunteer users to staff role';
END $$;

-- Enable Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Staff can update profiles for approvals" ON profiles;
  DROP POLICY IF EXISTS "Staff can delete unapproved profiles" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can update profiles for approvals"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'staff'
      AND approved = true
    )
  );

CREATE POLICY "Staff can delete unapproved profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'staff'
      AND approved = true
    )
  );

-- Create index for profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_approved_idx ON profiles(approved) WHERE approved = false;

-- Function to auto-create profile when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'volunteer'),
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON TABLE profiles IS 'Stores user profiles and role information';
COMMENT ON COLUMN profiles.id IS 'Unique identifier matching auth.users';
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.role IS 'User role: staff (limited access), manager (moderate access), or admin (full access)';
COMMENT ON COLUMN profiles.full_name IS 'User full name';
COMMENT ON COLUMN profiles.approved IS 'Whether the user account has been approved by an administrator';
COMMENT ON COLUMN profiles.created_at IS 'Timestamp when the profile was created';

-- ============================================
-- PARTICIPANTS, PROGRAMS & ENROLLMENTS
-- ============================================

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  post_code TEXT NOT NULL,
  council_region TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  additional_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to participants table if they don't exist
DO $$ 
BEGIN
  -- Add gender column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'gender'
  ) THEN
    ALTER TABLE participants ADD COLUMN gender TEXT NOT NULL DEFAULT 'Prefer not to say';
    -- Remove default after adding the column so new inserts require it
    ALTER TABLE participants ALTER COLUMN gender DROP DEFAULT;
  END IF;

  -- Add township column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'township'
  ) THEN
    ALTER TABLE participants ADD COLUMN township TEXT NOT NULL DEFAULT 'Other';
    -- Remove default after adding the column so new inserts require it
    ALTER TABLE participants ALTER COLUMN township DROP DEFAULT;
  END IF;

  -- Add township_other column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'township_other'
  ) THEN
    ALTER TABLE participants ADD COLUMN township_other TEXT;
  END IF;

  -- Add postal address columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'postal_address_line1'
  ) THEN
    ALTER TABLE participants ADD COLUMN postal_address_line1 TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'postal_address_line2'
  ) THEN
    ALTER TABLE participants ADD COLUMN postal_address_line2 TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'postal_postcode'
  ) THEN
    ALTER TABLE participants ADD COLUMN postal_postcode TEXT;
  END IF;

  -- Add preference columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'receive_newsletter'
  ) THEN
    ALTER TABLE participants ADD COLUMN receive_newsletter BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'receive_course_notifications'
  ) THEN
    ALTER TABLE participants ADD COLUMN receive_course_notifications BOOLEAN DEFAULT false;
  END IF;

  -- Add emergency contact details columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'emergency_contact_address'
  ) THEN
    ALTER TABLE participants ADD COLUMN emergency_contact_address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'emergency_contact_relationship'
  ) THEN
    ALTER TABLE participants ADD COLUMN emergency_contact_relationship TEXT;
  END IF;

  -- Add cultural background columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'identify_aboriginal_tsi'
  ) THEN
    ALTER TABLE participants ADD COLUMN identify_aboriginal_tsi TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'speak_other_language'
  ) THEN
    ALTER TABLE participants ADD COLUMN speak_other_language TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'other_language_details'
  ) THEN
    ALTER TABLE participants ADD COLUMN other_language_details TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'country_of_birth'
  ) THEN
    ALTER TABLE participants ADD COLUMN country_of_birth TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'cultural_identity'
  ) THEN
    ALTER TABLE participants ADD COLUMN cultural_identity TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'cultural_identity_details'
  ) THEN
    ALTER TABLE participants ADD COLUMN cultural_identity_details TEXT;
  END IF;

  -- Add referral sources column (stored as JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'referral_sources'
  ) THEN
    ALTER TABLE participants ADD COLUMN referral_sources JSONB;
  END IF;

  -- Add photo consent column (stored as JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'photo_consent'
  ) THEN
    ALTER TABLE participants ADD COLUMN photo_consent JSONB;
  END IF;

  -- Add program specific data column (stored as JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' AND column_name = 'program_specific_data'
  ) THEN
    ALTER TABLE participants ADD COLUMN program_specific_data JSONB;
  END IF;
END $$;

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  days TEXT[] NOT NULL DEFAULT '{}', -- Array of days (empty for one-time events)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER DEFAULT 20,
  recurrence_type TEXT DEFAULT 'weekly' CHECK (recurrence_type IN ('weekly', 'fortnightly', 'one-time')),
  event_date DATE, -- Date for one-time events
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add recurrence_type column to programs table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'recurrence_type'
  ) THEN
    ALTER TABLE programs ADD COLUMN recurrence_type TEXT DEFAULT 'weekly' CHECK (recurrence_type IN ('weekly', 'fortnightly', 'one-time'));
  END IF;
  
  -- Add event_date column for one-time events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE programs ADD COLUMN event_date DATE;
  END IF;
  
  -- Make days nullable/optional for one-time events
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'days' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE programs ALTER COLUMN days DROP NOT NULL;
    ALTER TABLE programs ALTER COLUMN days SET DEFAULT '{}';
  END IF;
END $$;

-- Create program_enrollments table (links participants to programs)
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, program_id)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program_staff table (assigns staff to programs)
CREATE TABLE IF NOT EXISTS program_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ BEGIN
  -- Participants policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON participants;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON participants;
  DROP POLICY IF EXISTS "Enable update access for all users" ON participants;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON participants;
  
  -- Programs policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON programs;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON programs;
  DROP POLICY IF EXISTS "Enable update access for all users" ON programs;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON programs;
  
  -- Program enrollments policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON program_enrollments;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON program_enrollments;
  DROP POLICY IF EXISTS "Enable update access for all users" ON program_enrollments;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON program_enrollments;
  
  -- Attendance records policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON attendance_records;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON attendance_records;
  DROP POLICY IF EXISTS "Enable update access for all users" ON attendance_records;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON attendance_records;
  
  -- Program staff policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON program_staff;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON program_staff;
  DROP POLICY IF EXISTS "Enable update access for all users" ON program_staff;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON program_staff;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create policies to allow all operations (for authenticated users)
-- Note: In production, you should restrict these based on user roles

-- Policies for participants
CREATE POLICY "Enable read access for all users" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON participants
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON participants
  FOR DELETE USING (true);

-- Policies for programs
CREATE POLICY "Enable read access for all users" ON programs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON programs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON programs
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON programs
  FOR DELETE USING (true);

-- Policies for program_enrollments
CREATE POLICY "Enable read access for all users" ON program_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON program_enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON program_enrollments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON program_enrollments
  FOR DELETE USING (true);

-- Policies for attendance_records
CREATE POLICY "Enable read access for all users" ON attendance_records
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON attendance_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON attendance_records
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON attendance_records
  FOR DELETE USING (true);

-- Policies for program_staff
CREATE POLICY "Enable read access for all users" ON program_staff
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON program_staff
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON program_staff
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON program_staff
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_participant ON program_enrollments(participant_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_program_id ON attendance_records(program_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant_id ON attendance_records(participant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_program_date ON attendance_records(program_id, date);

-- Prevent duplicate attendance records for the same participant, program, and date
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_attendance 
  ON attendance_records(participant_id, program_id, date);

-- Add helpful comments
COMMENT ON TABLE participants IS 'Stores participant information';
COMMENT ON COLUMN participants.gender IS 'Participant gender: Man, Woman, Non-binary, or Prefer not to say';
COMMENT ON COLUMN participants.township IS 'Adelaide Hills township or Other';
COMMENT ON COLUMN participants.township_other IS 'Custom township name if Other is selected';
COMMENT ON COLUMN participants.postal_address_line1 IS 'Postal address line 1 (if different from home address)';
COMMENT ON COLUMN participants.postal_address_line2 IS 'Postal address line 2 (if different from home address)';
COMMENT ON COLUMN participants.postal_postcode IS 'Postal postcode (if different from home postcode)';
COMMENT ON COLUMN participants.receive_newsletter IS 'Whether participant wants to receive newsletters';
COMMENT ON COLUMN participants.receive_course_notifications IS 'Whether participant wants to receive course/program notifications';
COMMENT ON COLUMN participants.emergency_contact_address IS 'Emergency contact full address';
COMMENT ON COLUMN participants.emergency_contact_relationship IS 'Relationship to emergency contact (e.g., spouse, parent)';
COMMENT ON COLUMN participants.identify_aboriginal_tsi IS 'Aboriginal or Torres Strait Islander identification';
COMMENT ON COLUMN participants.speak_other_language IS 'Whether participant speaks a language other than English at home';
COMMENT ON COLUMN participants.other_language_details IS 'Details of other languages spoken';
COMMENT ON COLUMN participants.country_of_birth IS 'Participant country of birth';
COMMENT ON COLUMN participants.cultural_identity IS 'Whether participant identifies with a cultural group';
COMMENT ON COLUMN participants.cultural_identity_details IS 'Details of cultural identity';
COMMENT ON COLUMN participants.referral_sources IS 'JSON array of how participant heard about The Hut';
COMMENT ON COLUMN participants.photo_consent IS 'JSON object of photo/media consent permissions';
COMMENT ON COLUMN participants.program_specific_data IS 'JSON object of program-specific requirements and information';

COMMENT ON TABLE attendance_records IS 'Stores attendance records for participants in programs';
COMMENT ON COLUMN attendance_records.id IS 'Unique identifier for the attendance record';
COMMENT ON COLUMN attendance_records.program_id IS 'Reference to the program';
COMMENT ON COLUMN attendance_records.participant_id IS 'Reference to the participant';
COMMENT ON COLUMN attendance_records.date IS 'Date of the attendance record';
COMMENT ON COLUMN attendance_records.status IS 'Attendance status: present or absent';
COMMENT ON COLUMN attendance_records.created_at IS 'Timestamp when the record was created';

COMMENT ON TABLE program_staff IS 'Assigns staff to programs';
COMMENT ON COLUMN program_staff.id IS 'Unique identifier for the assignment';
COMMENT ON COLUMN program_staff.program_id IS 'Reference to the program';
COMMENT ON COLUMN program_staff.user_id IS 'Reference to the staff user';
COMMENT ON COLUMN program_staff.assigned_at IS 'Timestamp when the assignment was created';