"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Map", href: "/" },
  { label: "Data", href: "/data" },
  { label: "Congressional Districts", href: "/districts" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 px-6 pt-4">
      <h1 className="text-xl font-bold tracking-widest">
        JERRY TIME
      </h1>
      <nav className="mt-3 flex gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              pathname === tab.href
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
