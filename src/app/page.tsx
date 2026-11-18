import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import { Hero } from "@/components/Hero";
import { projects, site } from "@/data";

export default function Home() {
  return (
    <>
      <Hero>
        <h1 className="font-pixel text-[40px] leading-15 sm:text-[60px] sm:leading-22.5">
          {site.name}
        </h1>
      </Hero>

      <div className="mx-auto flex max-w-3xl flex-col gap-20 px-6 pb-24">
        <section className="flex flex-col gap-6">
          {site.about.map((paragraph, i) => (
            <p key={i} className="max-w-prose leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-pixel text-[30px] leading-11.25">Apps</h2>
            <Link
              href="/projects"
              className="text-sm text-muted underline decoration-subtle underline-offset-4 hover:text-foreground hover:decoration-foreground"
            >
              all projects →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {projects.map((project) => (
              <li key={project.name}>
                <Link href="/projects" className="group flex flex-col items-start gap-3">
                  <AppIcon name={project.name} icon={project.icon} iconDark={project.iconDark} />
                  <div className="flex flex-col gap-1">
                    <span className="font-pixel text-[30px] leading-10 group-hover:underline group-hover:decoration-subtle group-hover:underline-offset-4">
                      {project.name}
                    </span>
                    {project.status && (
                      <span className="text-xs text-muted">{project.status}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
