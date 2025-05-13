import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

// Replace with your Supabase URL and keys
const supabaseUrl = "https://qmluhhozbnamtfnsqnvm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbHVoaG96Ym5hbXRmbnNxbnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzMwNjAsImV4cCI6MjA2MjYwOTA2MH0.ZG3mKGaSY2rSKyoIIgxbOe8h0rhgn1HV5MAsKkKZqoM"

// TODO: Replace this with your actual service role key from Supabase dashboard
// Project Settings -> API -> Project API keys -> service_role
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbHVoaG96Ym5hbXRmbnNxbnZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAzMzA2MCwiZXhwIjoyMDYyNjA5MDYwfQ.beG7jUlRPvRY2gABpIcqyJPDK-6ukYAu8DYEWTgqEfw"

// Create two clients - one for admin operations and one for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// User management functions
export const createStudent = async (email, password, studentData) => {
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      role: "student"
    })

    if (profileError) throw profileError

    // Create student record
    const { error: studentError } = await supabase.from("students").insert({
      id: authData.user.id,
      student_id: studentData.id,
      strand_id: studentData.strandId,
      year_level: studentData.yearLevel,
      section_id: studentData.sectionId
    })

    if (studentError) throw studentError

    return { success: true, data: authData.user }
  } catch (error) {
    console.error("Error creating student:", error)
    return { success: false, error }
  }
}

export const createTeacher = async (email, password, teacherData) => {
  try {
    // First check if a user with this email already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single()

    if (existingProfile) {
      throw new Error("A user with this email already exists")
    }

    // Check if teacher_id already exists
    const { data: existingTeacher } = await supabaseAdmin
      .from("teachers")
      .select("teacher_id")
      .eq("teacher_id", teacherData.id)
      .single()

    if (existingTeacher) {
      throw new Error("A teacher with this ID already exists")
    }

    // Create new user in auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'teacher'  // Always set as teacher
      }
    })

    if (authError) throw authError

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email,
      first_name: teacherData.first_name,
      last_name: teacherData.last_name,
      role: 'teacher'  // Always set as teacher
    })

    if (profileError) throw profileError

    // Create teacher record
    const { error: teacherError } = await supabaseAdmin.from("teachers").insert({
      id: authData.user.id,
      teacher_id: teacherData.id,
      department: teacherData.department,
      position: teacherData.position
    })

    if (teacherError) throw teacherError

    return { success: true, data: authData.user }
  } catch (error) {
    console.error("Error creating teacher:", error)
    return { success: false, error }
  }
}

// Section management functions
export const createSection = async (sectionData) => {
  try {
    const { data, error } = await supabase
      .from("sections")
      .insert({
        name: sectionData.name,
        grade_level_id: sectionData.gradeLevelId,
        academic_year_id: sectionData.academicYearId,
        room_number: sectionData.roomNumber,
        advisor_id: sectionData.advisorId,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating section:", error)
    return { success: false, error }
  }
}

export const getSections = async () => {
  try {
    // First get the sections with basic info
    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select(`
        id,
        name,
        grade_level_id,
        academic_year_id,
        advisor_id,
        created_at,
        grade_levels:grade_level_id (
          id,
          name
        ),
        academic_years:academic_year_id (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (sectionsError) throw sectionsError

    // Then get the advisor information for each section
    const sectionsWithAdvisors = await Promise.all(
      sections.map(async (section) => {
        if (!section.advisor_id) {
          return { ...section, advisor: null }
        }

        const { data: advisor, error: advisorError } = await supabase
          .from("teachers")
          .select(`
            id,
            teacher_id,
            department,
            position,
            profiles:teachers_id_fkey (
              first_name,
              last_name,
              email
            )
          `)
          .eq("id", section.advisor_id)
          .single()

        if (advisorError) {
          console.error("Error fetching advisor:", advisorError)
          return { ...section, advisor: null }
        }

        return {
          ...section,
          advisor: advisor
        }
      })
    )

    return { success: true, data: sectionsWithAdvisors }
  } catch (error) {
    console.error("Error fetching sections:", error)
    return { success: false, error }
  }
}

export const updateSection = async (id, sectionData) => {
  try {
    const { data, error } = await supabase
      .from("sections")
      .update({
        name: sectionData.name,
        grade_level_id: sectionData.gradeLevelId,
        academic_year_id: sectionData.academicYearId,
        room_number: sectionData.roomNumber,
        advisor_id: sectionData.advisorId,
      })
      .eq("id", id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating section:", error)
    return { success: false, error }
  }
}

export const deleteSection = async (id) => {
  try {
    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting section:", error)
    return { success: false, error }
  }
}

// Subject management functions
export const createSubject = async (subjectData) => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        teacher_id: subjectData.teacherId,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating subject:", error)
    return { success: false, error }
  }
}

export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select(`
        *,
        teachers:subjects_teacher_id_fkey (
          id,
          teacher_id,
          profiles:teachers_id_fkey (
            first_name,
            last_name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return { success: false, error }
  }
}

export const updateSubject = async (id, subjectData) => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .update({
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        teacher_id: subjectData.teacherId,
      })
      .eq("id", id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating subject:", error)
    return { success: false, error }
  }
}

export const deleteSubject = async (id) => {
  try {
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting subject:", error)
    return { success: false, error }
  }
}

// Schedule management functions
export const createSchedule = async (scheduleData) => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .insert({
        subject_id: scheduleData.subjectId,
        section_id: scheduleData.sectionId,
        teacher_id: scheduleData.teacherId,
        day: scheduleData.day,
        start_time: scheduleData.startTime,
        end_time: scheduleData.endTime,
        room: scheduleData.room,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating schedule:", error)
    return { success: false, error }
  }
}

export const getSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        *,
        subjects:schedules_subject_id_fkey (*),
        sections:schedules_section_id_fkey (*),
        teachers:schedules_teacher_id_fkey (
          id,
          teacher_id,
          profiles:teachers_id_fkey (
            first_name,
            last_name
          )
        )
      `)
      .order("day", { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return { success: false, error }
  }
}

export const updateSchedule = async (id, scheduleData) => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .update({
        subject_id: scheduleData.subjectId,
        section_id: scheduleData.sectionId,
        teacher_id: scheduleData.teacherId,
        day: scheduleData.day,
        start_time: scheduleData.startTime,
        end_time: scheduleData.endTime,
        room: scheduleData.room,
      })
      .eq("id", id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating schedule:", error)
    return { success: false, error }
  }
}

export const deleteSchedule = async (id) => {
  try {
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return { success: false, error }
  }
}

// Student and teacher management functions
export const getStudents = async () => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        profiles:students_id_fkey (
          first_name,
          last_name,
          email,
          avatar_url
        ),
        sections:students_section_id_fkey (
          name,
          grade_levels:grade_level_id (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching students:", error)
    return { success: false, error }
  }
}

export const getTeachers = async () => {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select(`
        *,
        profiles!teachers_id_fkey (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return { success: false, error }
  }
}

// Strand management functions
export const createStrand = async (strandData) => {
  try {
    const { data, error } = await supabase
      .from("strands")
      .insert({
        name: strandData.name,
        description: strandData.description,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating strand:", error)
    return { success: false, error }
  }
}

export const getStrands = async () => {
  try {
    console.log('Executing getStrands query...')
    const { data, error } = await supabase
      .from("strands")
      .select(`
        id,
        name,
        description,
        created_at
      `)
      .order("name", { ascending: true })

    console.log('getStrands response:', { data, error })

    if (error) {
      console.error('Error in getStrands:', error)
      throw error
    }

    // Ensure we always return an array, even if empty
    const strands = data || []
    return { success: true, data: strands }
  } catch (error) {
    console.error("Error fetching strands:", error)
    return { success: false, error, data: [] }
  }
}

export const updateStrand = async (id, strandData) => {
  try {
    const { data, error } = await supabase
      .from("strands")
      .update({
        name: strandData.name,
        description: strandData.description,
      })
      .eq("id", id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating strand:", error)
    return { success: false, error }
  }
}

export const deleteStrand = async (id) => {
  try {
    const { error } = await supabase.from("strands").delete().eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting strand:", error)
    return { success: false, error }
  }
}

// Grade Level functions
export const getGradeLevels = async () => {
  try {
    const { data, error } = await supabase.from("grade_levels").select("*").order("name", { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching grade levels:", error)
    return { success: false, error }
  }
}

// Academic Year functions
export const getAcademicYears = async () => {
  try {
    const { data, error } = await supabase.from("academic_years").select("*").order("name", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return { success: false, error }
  }
}

// Add this function to your supabase.js file
export const uploadAvatar = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}.${fileExt}`

    // Upload to Supabase Storage
    let { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return { success: true, data: data.publicUrl }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return { success: false, error }
  }
}

export const updateProfileAvatar = async (userId, avatarUrl) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error updating avatar URL:", error)
    return { success: false, error }
  }
}

export const updateTeacher = async (id, teacherData) => {
  try {
    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: teacherData.first_name,
        last_name: teacherData.last_name,
        email: teacherData.email,
        role: teacherData.isAdmin ? "admin" : "teacher"
      })
      .eq("id", id)

    if (profileError) throw profileError

    // Update teacher record
    const { error: teacherError } = await supabaseAdmin
      .from("teachers")
      .update({
        teacher_id: teacherData.id,
        department: teacherData.department,
        position: teacherData.position
      })
      .eq("id", id)

    if (teacherError) throw teacherError

    // Update auth email if it has changed
    if (teacherData.email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { email: teacherData.email }
      )
      if (authError) throw authError
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating teacher:", error)
    return { success: false, error }
  }
}

export const deleteTeacher = async (id) => {
  try {
    // Delete teacher record
    const { error: teacherError } = await supabaseAdmin
      .from("teachers")
      .delete()
      .eq("id", id)

    if (teacherError) throw teacherError

    // Delete profile (this will cascade delete the teacher record)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id)

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return { success: false, error }
  }
}

export const updateStudent = async (id, studentData) => {
  try {
    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: studentData.first_name,
        last_name: studentData.last_name,
      })
      .eq("id", id)

    if (profileError) throw profileError

    // Update student record
    const { error: studentError } = await supabase
      .from("students")
      .update({
        student_id: studentData.id,
        strand_id: studentData.strandId,
        year_level: studentData.yearLevel,
        section_id: studentData.sectionId
      })
      .eq("id", id)

    if (studentError) throw studentError

    return { success: true }
  } catch (error) {
    console.error("Error updating student:", error)
    return { success: false, error }
  }
}

export const deleteStudent = async (id) => {
  try {
    // Delete student record
    const { error: studentError } = await supabase
      .from("students")
      .delete()
      .eq("id", id)

    if (studentError) throw studentError

    // Delete profile (this will cascade delete the student record)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error("Error deleting student:", error)
    return { success: false, error }
  }
}

// Attendance management functions
export const recordAttendance = async (scheduleId, studentId, status, notes = null) => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    
    // Check if user exists
    if (!user) {
      throw new Error('No authenticated user found')
    }

    console.log('Current user:', user) // Debug log

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        schedule_id: scheduleId,
        student_id: studentId,
        teacher_id: user.id,
        date: new Date().toISOString().split('T')[0],
        status,
        notes,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return { success: false, error: error.message || error }
  }
}

export const getScheduleAttendance = async (scheduleId, date = null) => {
  try {
    let query = supabase
      .from("attendance")
      .select(`
        *,
        students:student_id (
          id,
          first_name,
          last_name
        ),
        schedules:schedule_id (
          id,
          subjects:subject_id (
            name,
            code
          ),
          sections:section_id (
            name
          )
        )
      `)
      .eq("schedule_id", scheduleId)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error getting schedule attendance:", error)
    return { success: false, error }
  }
}

export const updateAttendance = async (attendanceId, status, notes = null) => {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .update({
        status,
        notes,
        scanned_at: new Date().toISOString()
      })
      .eq("id", attendanceId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating attendance:", error)
    return { success: false, error }
  }
}

export const deleteAttendance = async (attendanceId) => {
  try {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("id", attendanceId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return { success: false, error }
  }
}
