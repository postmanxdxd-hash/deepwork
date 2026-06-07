import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Start tracking your habits with your personal rubric
        </p>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
