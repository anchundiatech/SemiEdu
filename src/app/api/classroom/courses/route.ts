import { authOptions } from "@/lib/auth";
import { getCoursesWithRoles, setAccessToken } from "@/lib/google-classroom";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Missing user email in session" },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    const courses = await getCoursesWithRoles(userEmail);

    return NextResponse.json({
      courses,
      total: courses.length,
      userRole: session.user.role
    });
  } catch (error: unknown) {
    console.error("/api/classroom/courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
