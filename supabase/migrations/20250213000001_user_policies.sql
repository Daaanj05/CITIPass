-- Drop existing policies for students and teachers
DROP POLICY IF EXISTS "Enable select for admin users" ON students;
DROP POLICY IF EXISTS "Enable insert for admin users" ON students;
DROP POLICY IF EXISTS "Enable update for admin users" ON students;
DROP POLICY IF EXISTS "Enable delete for admin users" ON students;
DROP POLICY IF EXISTS "Enable select for admin users" ON teachers;
DROP POLICY IF EXISTS "Enable insert for admin users" ON teachers;
DROP POLICY IF EXISTS "Enable update for admin users" ON teachers;
DROP POLICY IF EXISTS "Enable delete for admin users" ON teachers;
-- Create new policies for students
CREATE POLICY "Students can view their own profile" ON students FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all students" ON students FOR ALL USING (is_admin(auth.uid()));
-- Create new policies for teachers
CREATE POLICY "Teachers can view their own profile" ON teachers FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all teachers" ON teachers FOR ALL USING (is_admin(auth.uid()));