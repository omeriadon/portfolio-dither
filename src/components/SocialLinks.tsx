import { site } from "@/data";

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {site.socials.map((social) => {
        const external = !social.url.startsWith("mailto:");
        return (
          <li key={social.url}>
            <a
              href={social.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-muted underline decoration-subtle underline-offset-4 hover:text-foreground hover:decoration-foreground"
            >
              {social.label}
              {external && " ↗"}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
