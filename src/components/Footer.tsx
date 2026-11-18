import { site } from "@/data";
import { SocialLinks } from "./SocialLinks";

/** The year at build time. Cached so the page can still prerender. */
async function Year() {
  "use cache";
  return new Date().getFullYear();
}

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-subtle px-6 py-8 text-sm text-muted">
      <span>
        © <Year /> {site.name}
      </span>
      <SocialLinks />
    </footer>
  );
}
