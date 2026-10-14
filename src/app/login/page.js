import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeRedirectPath } from "@/lib/auth/safeRedirect";

export const metadata = {
  title: "로그인",
};

export default async function LoginPage({ searchParams }) {
  const { registered, reset, next } = await searchParams;

  return (
    <main>
      <LoginForm
        registered={registered === "1"}
        passwordReset={reset === "1"}
        nextPath={getSafeRedirectPath(next)}
      />
    </main>
  );
}
