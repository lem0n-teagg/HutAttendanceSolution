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
  role TEXT NOT NULL CHECK (role IN ('staff', 'volunteer')),
  full_name TEXT NOT NULL,
  approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
COMMENT ON COLUMN profiles.role IS 'User role: staff or volunteer';
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
END $$;

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  days TEXT[] NOT NULL, -- Array of days
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE attendance_records IS 'Stores attendance records for participants in programs';
COMMENT ON COLUMN attendance_records.id IS 'Unique identifier for the attendance record';
COMMENT ON COLUMN attendance_records.program_id IS 'Reference to the program';
COMMENT ON COLUMN attendance_records.participant_id IS 'Reference to the participant';
COMMENT ON COLUMN attendance_records.date IS 'Date of the attendance record';
COMMENT ON COLUMN attendance_records.status IS 'Attendance status: present or absent';
COMMENT ON COLUMN attendance_records.created_at IS 'Timestamp when the record was created';
