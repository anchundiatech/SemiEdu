import type { classroom_v1 } from "googleapis";
import { google } from "googleapis";

const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

let currentAccessToken: string | null = null;

export function setAccessToken(token: string) {
  currentAccessToken = token;
  oauth2Client.setCredentials({ access_token: token });
}

export type CourseWithRole = {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: {
    id?: string;
    title?: string;
    alternateLink?: string;
  };
  guardiansEnabled?: boolean;
  calendarId?: string;
  role: "teacher" | "student";
};

export type StudentData = {
  userId: string;
  name: string;
  email?: string;
  photoUrl?: string;
};

export type TeacherData = {
  userId: string;
  name: string;
  email?: string;
  photoUrl?: string;
};

export type CourseWork = {
  id?: string;
  courseId: string;
  title?: string;
  description?: string;
  materials?: any[];
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  dueTime?: {
    hours?: number | null;
    minutes?: number | null;
  };
  maxPoints?: number;
  workType?: string;
  submissionModificationMode?: string;
};

export type StudentSubmission = {
  id?: string;
  userId?: string;
  courseId: string;
  courseWorkId: string;
  state: string;
  assignedGrade?: number;
  draftGrade?: number;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  late?: boolean;
};

function requireAuth() {
  if (!currentAccessToken) {
    throw new Error(
      "Google OAuth access token is not set. Call setAccessToken(token) first."
    );
  }
}

function getClassroom(): classroom_v1.Classroom {
  return google.classroom({ version: "v1", auth: oauth2Client });
}

// Helper function to safely convert Google API string values that can be null to undefined
function convertNullToUndefined(
  value: string | null | undefined
): string | undefined {
  return value ?? undefined;
}

export async function getCurrentUserProfile() {
  requireAuth();
  const classroom = getClassroom();

  try {
    const res = await classroom.userProfiles.get({
      userId: "me",
    });

    return {
      userId: convertNullToUndefined(res.data.id),
      name: convertNullToUndefined(res.data.name?.fullName),
      email: convertNullToUndefined(res.data.emailAddress),
      photoUrl: convertNullToUndefined(res.data.photoUrl),
    };
  } catch (error) {
    console.error("Failed to get current user profile:", error);
    throw error;
  }
}

export async function getCourses() {
  requireAuth();
  const classroom = getClassroom();

  // List active courses for the authenticated user
  const res = await classroom.courses.list({
    courseStates: ["ACTIVE"],
    pageSize: 100,
  });
  return res.data.courses ?? [];
}

export async function getStudents(courseId: string): Promise<StudentData[]> {
  requireAuth();
  const classroom = getClassroom();
  const students: StudentData[] = [];
  let pageToken: string | undefined;
  
  do {
    const res = await classroom.courses.students.list({
      courseId,
      pageSize: 100,
      pageToken,
    });
    const items = res.data.students ?? [];
    
    for (const s of items) {
      const userId = s.userId || s.profile?.id;
      const name =
        s.profile?.name?.fullName ||
        s.profile?.name?.givenName ||
        "Desconocido";
      const email = convertNullToUndefined(s.profile?.emailAddress);
      const photoUrl = convertNullToUndefined(s.profile?.photoUrl);
      
      if (userId) {
        students.push({ userId, name, email, photoUrl });
      }
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  
  return students;
}

export async function getTeachers(courseId: string): Promise<TeacherData[]> {
  requireAuth();
  const classroom = getClassroom();
  const teachers: TeacherData[] = [];
  let pageToken: string | undefined;
  
  do {
    const res = await classroom.courses.teachers.list({
      courseId,
      pageSize: 100,
      pageToken,
    });
    const items = res.data.teachers ?? [];
    
    for (const t of items) {
      const userId = t.userId || t.profile?.id;
      const name =
        t.profile?.name?.fullName ||
        t.profile?.name?.givenName ||
        "Desconocido";
      const email = convertNullToUndefined(t.profile?.emailAddress);
      const photoUrl = convertNullToUndefined(t.profile?.photoUrl);
      
      if (userId) {
        teachers.push({ userId, name, email, photoUrl });
      }
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  
  return teachers;
}

export async function getUserRole(
  courseId: string,
  userEmail: string
): Promise<"teacher" | "student" | null> {
  requireAuth();

  try {
    // Check if user is a teacher
    const teachers = await getTeachers(courseId);
    const isTeacher = teachers.some((t) => t.email === userEmail);
    if (isTeacher) return "teacher";

    // Check if user is a student
    const students = await getStudents(courseId);
    const isStudent = students.some((s) => s.email === userEmail);
    if (isStudent) return "student";

    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

export async function getCoursesWithRoles(
  userEmail: string
): Promise<CourseWithRole[]> {
  requireAuth();
  const courses = await getCourses();
  const coursesWithRoles: CourseWithRole[] = [];
  
  for (const course of courses) {
    if (!course.id) continue;
    const role = await getUserRole(course.id, userEmail);
    if (role) {
      coursesWithRoles.push({
        id: course.id,
        name: course.name || "Curso sin nombre",
        section: convertNullToUndefined(course.section),
        description: convertNullToUndefined(course.description),
        room: convertNullToUndefined(course.room),
        ownerId: convertNullToUndefined(course.ownerId),
        creationTime: convertNullToUndefined(course.creationTime),
        updateTime: convertNullToUndefined(course.updateTime),
        enrollmentCode: convertNullToUndefined(course.enrollmentCode),
        courseState: convertNullToUndefined(course.courseState),
        alternateLink: convertNullToUndefined(course.alternateLink),
        teacherGroupEmail: convertNullToUndefined(course.teacherGroupEmail),
        courseGroupEmail: convertNullToUndefined(course.courseGroupEmail),
        teacherFolder: course.teacherFolder
          ? {
              id: convertNullToUndefined(course.teacherFolder.id),
              title: convertNullToUndefined(course.teacherFolder.title),
              alternateLink: convertNullToUndefined(
                course.teacherFolder.alternateLink
              ),
            }
          : undefined,
        guardiansEnabled: course.guardiansEnabled ?? undefined,
        calendarId: convertNullToUndefined(course.calendarId),
        role,
      });
    }
  }

  return coursesWithRoles;
}

export async function getCourseWork(courseId: string): Promise<CourseWork[]> {
  requireAuth();
  const classroom = getClassroom();
  const res = await classroom.courses.courseWork.list({
    courseId,
    pageSize: 100,
  });
  
  const courseWork = res.data.courseWork ?? [];
  return courseWork.map((work) => ({
    id: convertNullToUndefined(work.id),
    courseId,
    title: convertNullToUndefined(work.title),
    description: convertNullToUndefined(work.description),
    materials: work.materials || [],
    state: convertNullToUndefined(work.state),
    alternateLink: convertNullToUndefined(work.alternateLink),
    creationTime: convertNullToUndefined(work.creationTime),
    updateTime: convertNullToUndefined(work.updateTime),
    dueDate: work.dueDate,
    dueTime: work.dueTime,
    maxPoints: work.maxPoints ?? undefined,
    workType: convertNullToUndefined(work.workType),
    submissionModificationMode: convertNullToUndefined(work.submissionModificationMode),
  }));
}

export async function getStudentSubmissions(
  courseId: string,
  courseworkId: string,
  userId?: string
): Promise<StudentSubmission[]> {
  requireAuth();
  const classroom = getClassroom();
  const res = await classroom.courses.courseWork.studentSubmissions.list({
    courseId,
    courseWorkId: courseworkId,
    userId: userId ?? undefined,
    pageSize: 100,
  });

  const submissions = res.data.studentSubmissions ?? [];

  return submissions.map((sub) => ({
    id: convertNullToUndefined(sub.id),
    userId: convertNullToUndefined(sub.userId),
    courseId,
    courseWorkId: courseworkId,
    state: sub.state || "NEW",
    assignedGrade: sub.assignedGrade ?? undefined,
    draftGrade: sub.draftGrade ?? undefined,
    alternateLink: convertNullToUndefined(sub.alternateLink),
    creationTime: convertNullToUndefined(sub.creationTime),
    updateTime: convertNullToUndefined(sub.updateTime),
    late: sub.late ?? undefined,
  }));
}
