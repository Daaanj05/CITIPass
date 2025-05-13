-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    notes TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, schedule_id, date)
);
-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule_id ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
-- Create RLS policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- Teachers can view attendance for their schedules
CREATE POLICY "Teachers can view attendance for their schedules" ON attendance FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM schedules
            WHERE schedules.id = attendance.schedule_id
                AND schedules.teacher_id = auth.uid()
        )
    );
-- Teachers can insert attendance for their schedules
CREATE POLICY "Teachers can insert attendance for their schedules" ON attendance FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM schedules
            WHERE schedules.id = attendance.schedule_id
                AND schedules.teacher_id = auth.uid()
        )
    );
-- Teachers can update attendance for their schedules
CREATE POLICY "Teachers can update attendance for their schedules" ON attendance FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM schedules
            WHERE schedules.id = attendance.schedule_id
                AND schedules.teacher_id = auth.uid()
        )
    );
-- Add notes column if it doesn't exist
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS notes TEXT;
-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule_id ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);