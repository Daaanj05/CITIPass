-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Create profiles table (for both students and teachers)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create strands table
CREATE TABLE strands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create grade_levels table
CREATE TABLE grade_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create academic_years table
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade_level_id UUID REFERENCES grade_levels(id) ON DELETE RESTRICT,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT,
    room_number TEXT,
    advisor_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        UNIQUE(name, academic_year_id)
);
-- Create students table
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL UNIQUE,
    strand_id UUID REFERENCES strands(id) ON DELETE RESTRICT,
    year_level TEXT NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE
    SET NULL,
        qr_code TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    position TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    teacher_id UUID REFERENCES teachers(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Create schedules table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    day TEXT NOT NULL CHECK (
        day IN (
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        )
    ),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(
        subject_id,
        section_id,
        day,
        start_time,
        end_time
    )
);
-- Create attendance table with teacher scanning
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, schedule_id, date)
);
-- Insert default grade levels
INSERT INTO grade_levels (name)
VALUES ('Grade 11'),
    ('Grade 12');
-- Insert default academic year
INSERT INTO academic_years (name)
VALUES ('2024-2025');
-- Create function to generate sequential IDs
CREATE OR REPLACE FUNCTION generate_sequential_id(prefix TEXT, table_name TEXT) RETURNS TEXT AS $$
DECLARE next_id INTEGER;
BEGIN -- Get the current year
next_id := EXTRACT(
    YEAR
    FROM CURRENT_DATE
);
-- Get the next sequence number
EXECUTE format(
    'SELECT COALESCE(MAX(CAST(SUBSTRING(%I FROM ''[0-9]+$'') AS INTEGER)), 0) + 1 FROM %I',
    CASE
        WHEN table_name = 'students' THEN 'student_id'
        WHEN table_name = 'teachers' THEN 'teacher_id'
    END,
    table_name
) INTO next_id;
-- Return the formatted ID
RETURN prefix || next_id::TEXT;
END;
$$ LANGUAGE plpgsql;
-- Create triggers for automatic ID generation
CREATE OR REPLACE FUNCTION set_student_id() RETURNS TRIGGER AS $$ BEGIN IF NEW.student_id IS NULL THEN NEW.student_id := generate_sequential_id('STU', 'students');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION set_teacher_id() RETURNS TRIGGER AS $$ BEGIN IF NEW.teacher_id IS NULL THEN NEW.teacher_id := generate_sequential_id('TCH', 'teachers');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create triggers
CREATE TRIGGER set_student_id_trigger BEFORE
INSERT ON students FOR EACH ROW EXECUTE FUNCTION set_student_id();
CREATE TRIGGER set_teacher_id_trigger BEFORE
INSERT ON teachers FOR EACH ROW EXECUTE FUNCTION set_teacher_id();
-- Create updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strands_updated_at BEFORE
UPDATE ON strands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grade_levels_updated_at BEFORE
UPDATE ON grade_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE
UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE
UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE
UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE
UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE
UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE
UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE
UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin(uid UUID) RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
SELECT role = 'admin'
FROM profiles
WHERE id = uid $$;
-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE strands ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable users to read their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable select for admin users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for admin users" ON profiles;
DROP POLICY IF EXISTS "Enable update for admin users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for admin users" ON profiles;
-- Create simplified profiles policies using the helper function
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (is_admin(auth.uid()));
-- Update other table policies to use the helper function
CREATE POLICY "Enable select for admin users" ON students FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON students FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON students FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON students FOR DELETE USING (is_admin(auth.uid()));
-- Update teachers policies
CREATE POLICY "Enable select for admin users" ON teachers FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON teachers FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON teachers FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON teachers FOR DELETE USING (is_admin(auth.uid()));
-- Update sections policies
CREATE POLICY "Enable select for admin users" ON sections FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON sections FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON sections FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON sections FOR DELETE USING (is_admin(auth.uid()));
-- Update subjects policies
CREATE POLICY "Enable select for admin users" ON subjects FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON subjects FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON subjects FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON subjects FOR DELETE USING (is_admin(auth.uid()));
-- Update schedules policies
CREATE POLICY "Enable select for admin users" ON schedules FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON schedules FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON schedules FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON schedules FOR DELETE USING (is_admin(auth.uid()));
-- Update attendance policies
CREATE POLICY "Enable select for admin users" ON attendance FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON attendance FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON attendance FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON attendance FOR DELETE USING (is_admin(auth.uid()));
-- Update strands policies
CREATE POLICY "Enable select for admin users" ON strands FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON strands FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON strands FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON strands FOR DELETE USING (is_admin(auth.uid()));
-- Update grade_levels policies
CREATE POLICY "Enable select for admin users" ON grade_levels FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON grade_levels FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON grade_levels FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON grade_levels FOR DELETE USING (is_admin(auth.uid()));
-- Update academic_years policies
CREATE POLICY "Enable select for admin users" ON academic_years FOR
SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Enable insert for admin users" ON academic_years FOR
INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable update for admin users" ON academic_years FOR
UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Enable delete for admin users" ON academic_years FOR DELETE USING (is_admin(auth.uid()));
-- Create policies for teachers
CREATE POLICY "Enable insert for teachers" ON attendance FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'teacher'
        )
    );
CREATE POLICY "Enable update for teachers" ON attendance FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'teacher'
        )
    );
-- Create indexes for better performance
CREATE INDEX idx_students_section_id ON students(section_id);
CREATE INDEX idx_students_strand_id ON students(strand_id);
CREATE INDEX idx_teachers_department ON teachers(department);
CREATE INDEX idx_sections_grade_level_id ON sections(grade_level_id);
CREATE INDEX idx_sections_academic_year_id ON sections(academic_year_id);
CREATE INDEX idx_sections_advisor_id ON sections(advisor_id);
CREATE INDEX idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX idx_schedules_subject_id ON schedules(subject_id);
CREATE INDEX idx_schedules_section_id ON schedules(section_id);
CREATE INDEX idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_schedule_id ON attendance(schedule_id);
CREATE INDEX idx_attendance_date ON attendance(date);
-- Subjects policies
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR
SELECT USING (true);
CREATE POLICY "Only admins can insert subjects" ON subjects FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Only admins can update subjects" ON subjects FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete subjects" ON subjects FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Strands policies
CREATE POLICY "Strands are viewable by everyone" ON strands FOR
SELECT USING (true);
CREATE POLICY "Only admins can insert strands" ON strands FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Only admins can update strands" ON strands FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Only admins can delete strands" ON strands FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
ALTER TABLE profiles
ADD COLUMN avatar_url TEXT;
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');