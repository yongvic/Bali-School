import { UserRole } from "@prisma/client";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}
