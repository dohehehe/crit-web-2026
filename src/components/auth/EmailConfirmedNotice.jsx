"use client";

import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/auth/AlertDialog";
import { EMAIL_CONFIRMED_ALERT } from "@/lib/auth/constants";

export function EmailConfirmedNotice() {
  const router = useRouter();

  function handleConfirm() {
    router.push("/login");
  }

  return (
    <AlertDialog
      open
      title={EMAIL_CONFIRMED_ALERT.title}
      message={EMAIL_CONFIRMED_ALERT.message}
      onConfirm={handleConfirm}
    />
  );
}
