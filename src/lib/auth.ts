import { Account, NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/classroom.courses.readonly",
            "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
            "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
            "https://www.googleapis.com/auth/classroom.rosters.readonly",
            "https://www.googleapis.com/auth/classroom.profile.emails",
            "https://www.googleapis.com/auth/classroom.profile.photos",
            "https://www.googleapis.com/auth/classroom.announcements.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: Account | null;
      profile?: { email?: string | null } | null;
    }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }

      // Add user role based on email domain or specific logic
      if (profile?.email) {
        token.email = profile.email;
        token.role = determineUserRole(profile.email);
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "estudiante" | "docente" | "coordinador";
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/landing",
  },
  session: {
    strategy: "jwt",
  },
};

// Function to determine user role based on email
function determineUserRole(
  email: string
): "estudiante" | "docente" | "coordinador" {
  // Customize this logic based on your requirements
  // You might want to check against a database or use specific email patterns

  // Example logic:
  if (email.includes("profesor") || email.includes("teacher") || email.includes("docente")) {
    return "docente";
  }
  if (email.includes("coordinador") || email.includes("admin") || email.includes("director")) {
    return "coordinador";
  }

  // Default to student
  return "estudiante";
}
