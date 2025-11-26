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
     
      if (account) {
        token.accessToken = account.access_token;
      }

      // añadir redireccionamiento basado en el rol
      if (profile?.email) {
        token.email = profile.email;
        token.role = determineUserRole(profile.email);
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      
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

// Funcion para determinar el rol del usuario
function determineUserRole(
  email: string
): "estudiante" | "docente" | "coordinador" {
  const emailLower = email.toLowerCase();

  // Lista de palabras clave para cada rol
  const coordinadorKeywords = [
    "coordinador", "coordinadora", "coordinacion",
    "admin", "administrador", "administradora", "administracion",
    "director", "directora", "direccion",
    "supervisor", "supervisora", "supervision",
    "manager", "management", "gerente",
    "jefe", "jefa", "jefatura",
    "lider", "liderazgo", "liderazgo",
    "responsable", "responsabilidad",
    "head", "chief", "principal",
    "coordinador@", "admin@", "director@", "supervisor@"
  ];

  const docenteKeywords = [
    "profesor", "profesora", "profesores",
    "teacher", "teachers", "teaching",
    "docente", "docentes", "docencia",
    "instructor", "instructora", "instructores",
    "educador", "educadora", "educadores",
    "maestro", "maestra", "maestros",
    "tutor", "tutora", "tutores",
    "faculty", "staff", "personal",
    "prof@", "teacher@", "docente@", "instructor@"
  ];

  // Verificar si es coordinador
  const isCoordinador = coordinadorKeywords.some(keyword =>
    emailLower.includes(keyword)
  );

  // Verificar si es docente
  const isDocente = docenteKeywords.some(keyword =>
    emailLower.includes(keyword)
  );

  // Priorizar coordinador sobre docente
  if (isCoordinador) {
    return "coordinador";
  }

  if (isDocente) {
    return "docente";
  }

  // Verificar dominios específicos 
  const domain = emailLower.split('@')[1];
  if (domain) {
    // Si el dominio contiene palabras clave
    if (coordinadorKeywords.some(keyword => domain.includes(keyword))) {
      return "coordinador";
    }
    if (docenteKeywords.some(keyword => domain.includes(keyword))) {
      return "docente";
    }
  }

  

  // Default to student
  return "estudiante";
}
