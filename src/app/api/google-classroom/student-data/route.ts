import { authOptions } from "@/lib/auth";
import { getStudents, setAccessToken } from "@/lib/google-classroom";
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId parameter is required" },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    const students = await getStudents(courseId);

      return NextResponse.json({
      students,
      total: students.length
    });
  } catch (error: unknown) {
    console.error("/api/google-classroom/student-data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
