import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  OPERATOR_SESSION_COOKIE,
  isOperatorAccessConfigured,
  isValidOperatorSession,
} from "@/lib/auth/operator-access";
import { OperatorDisabled } from "../operator-disabled";

export default async function OperatorConsoleLayout({ children }: { children: ReactNode }) {
  if (!isOperatorAccessConfigured()) return <OperatorDisabled />;

  const cookieStore = await cookies();
  if (!isValidOperatorSession(cookieStore.get(OPERATOR_SESSION_COOKIE)?.value))
    redirect("/operator/access");

  return children;
}
