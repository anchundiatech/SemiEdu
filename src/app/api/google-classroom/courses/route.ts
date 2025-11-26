import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    // Determinar si el usuario es estudiante o docente
    const userRole = session.user?.role || 'estudiante';
    let coursesResponse;

    if (userRole === 'estudiante') {
      coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses?studentId=me',{
        headers:{
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

    } else {
      coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses?teacherId=me',{
        headers:{
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });
    }


    if(!coursesResponse.ok){
      const errorText = await coursesResponse.text();
      console.error('Google Classroom API error: ', coursesResponse.status,)
    }



 
    
    

    console.log('Google Classroom API response:', {
      coursesCount: courses.length,
      courses: courses.map((c: any) => ({ id: c.id, name: c.name, courseState: c.courseState }))
    });

    // Obtener tareas para cada curso
    const coursesWithAssignments = await Promise.all(
      courses.map(async (course: any) => {
        try {
          const assignmentsResponse = await fetch(
            `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let assignments = [];
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            assignments = assignmentsData.courseWork || [];
          }

          return {
            ...course,
            assignments: assignments.map((assignment: any) => ({
              id: assignment.id,
              title: assignment.title,
              description: assignment.description,
              state: assignment.state,
              dueDate: assignment.dueDate,
              dueTime: assignment.dueTime,
              maxPoints: assignment.maxPoints,
              workType: assignment.workType,
              alternateLink: assignment.alternateLink,
              courseName: course.name
            }))
          };
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.id}:`, error);
          return {
            ...course,
            assignments: []
          };
        }
      })
    );

    // Calcular estadísticas
    const allAssignments = coursesWithAssignments.flatMap(course => course.assignments);
    const pendingAssignments = allAssignments.filter(assignment =>
      assignment.state === 'PUBLISHED' &&
      assignment.dueDate &&
      new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day) > new Date()
    );
    const completedAssignments = allAssignments.filter(assignment =>
      assignment.state === 'TURNED_IN' || assignment.state === 'RETURNED'
    );

    const totalAssignmentsCount = allAssignments?.length || 0;
    const completedAssignmentsCount = completedAssignments?.length || 0;
    const pendingAssignmentsCount = pendingAssignments?.length || 0;

    const statistics = {
      totalCourses: coursesResponse?.length || 0,
      totalAssignments: totalAssignmentsCount,
      pendingAssignments: pendingAssignmentsCount,
      completedAssignments: completedAssignmentsCount,
      lateSubmissions: 0,
      averageGrade: null,
      submissionRate: totalAssignmentsCount > 0 ? completedAssignmentsCount / totalAssignmentsCount : 0
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
          email: session.user?.email
        }
      }
    });

  } catch (error: unknown) {
    console.error("/api/google-classroom/courses error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
