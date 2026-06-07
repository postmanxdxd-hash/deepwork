"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/today", label: "Today", icon: "☀️" },
  { href: "/week", label: "Week", icon: "📅" },
  { href: "/history", label: "History", icon: "📊" },
  { href: "/notes", label: "Notes", icon: "📓" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs transition-soft",
                pathname === link.href
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--text-muted)]"
              )}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop side nav */}
      <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:border-[var(--border)] md:bg-[var(--bg-card)] md:p-4 md:shrink-0">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-bold text-[var(--text)]">Habit Tracker</h1>
          <p className="text-xs text-[var(--text-muted)]">Your daily rhythm</p>
        </div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-soft",
              pathname === link.href
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)]"
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
