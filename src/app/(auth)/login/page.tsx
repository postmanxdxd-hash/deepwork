import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Log in to track your habits
        </p>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          No account?{" "}
          <Link href="/signup" className="text-[var(--accent)] font-semibold">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
