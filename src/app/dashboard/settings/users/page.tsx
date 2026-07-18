import { requireAuth } from "@/lib/require-auth";
import UsersClient from "./users-client";

export default async function UsersPage() {
  await requireAuth();
  return <UsersClient />;
}
