"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex w-fit gap-1 bg-background p-1 text-sm">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "bg-foreground px-3 py-1 text-background"
                : "px-3 py-1 text-muted hover:text-foreground"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
