import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token in session" },
        { status: 400 }
      );
    }

    // Determina si es estudiante o docente
    const userRole = session.user?.role || "estudiante";

    let coursesResponse;
    if (userRole === "estudiante") {
      coursesResponse = await fetch(
        "https://classroom.googleapis.com/v1/courses?studentId=me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      coursesResponse = await fetch(
        "https://classroom.googleapis.com/v1/courses?teacherId=me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!coursesResponse.ok) {
      const errorText = await coursesResponse.text();
      console.error("Google Classroom Courses Error:", errorText);

      return NextResponse.json(
        {
          error: "Failed to fetch courses from Google Classroom",
          details: errorText,
        },
        { status: 500 }
      );
    }

    // ✅ Aquí si definimos courses
    const coursesData = await coursesResponse.json();
    const courses = coursesData.courses || [];

    console.log("Google Classroom API response:", {
      coursesCount: courses.length,
      sample: courses.slice(0, 3),
    });

    // Obtener tareas
    const coursesWithAssignments = await Promise.all(
      courses.map(async (course: any) => {
        try {
          const assignmentsResponse = await fetch(
            `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          let assignments = [];
          if (assignmentsResponse.ok) {
            const data = await assignmentsResponse.json();
            assignments = data.courseWork || [];
          }

          return {
            ...course,
            assignments: assignments.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              state: a.state,
              dueDate: a.dueDate,
              dueTime: a.dueTime,
              maxPoints: a.maxPoints,
              workType: a.workType,
              alternateLink: a.alternateLink,
              courseName: course.name,
            })),
          };
        } catch (error) {
          console.error(
            `Error fetching assignments for course ${course.id}:`,
            error
          );
          return {
            ...course,
            assignments: [],
          };
        }
      })
    );

    // Estadísticas
    const allAssignments = coursesWithAssignments.flatMap(
      (course) => course.assignments
    );

    const pendingAssignments = allAssignments.filter((assignment) => {
      if (
        assignment.state === "PUBLISHED" &&
        assignment.dueDate &&
        typeof assignment.dueDate.year === "number"
      ) {
        const due = new Date(
          assignment.dueDate.year,
          assignment.dueDate.month - 1,
          assignment.dueDate.day
        );
        return due > new Date();
      }
      return false;
    });

    const completedAssignments = allAssignments.filter((assignment) =>
      ["TURNED_IN", "RETURNED"].includes(assignment.state)
    );

    const statistics = {
      totalCourses: courses.length,
      totalAssignments: allAssignments.length,
      pendingAssignments: pendingAssignments.length,
      completedAssignments: completedAssignments.length,
      lateSubmissions: 0,
      averageGrade: null,
      submissionRate:
        allAssignments.length > 0
          ? completedAssignments.length / allAssignments.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithAssignments,
        assignments: allAssignments,
        statistics,
        userProfile: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
        },
      },
    });
  } catch (error: any) {
    console.error("/api/google-classroom/courses error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
