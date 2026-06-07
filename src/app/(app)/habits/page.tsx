"use client";

import { RubricEditor } from "@/components/settings/RubricEditor";

export default function HabitsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold mb-1">Edit habits</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Tap a tier to expand, change the name, then tap <strong>Save</strong>.
        Or use the ✏️ button on any habit on the Today screen.
      </p>
      <RubricEditor />
    </div>
  );
}
