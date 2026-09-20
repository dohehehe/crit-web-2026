import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "로그인",
};

export default async function LoginPage({ searchParams }) {
  const { registered, reset } = await searchParams;

  return (
    <main>
      <LoginForm
        registered={registered === "1"}
        passwordReset={reset === "1"}
      />
    </main>
  );
}
