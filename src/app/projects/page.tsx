import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { ProjectList } from "@/components/ProjectList";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <>
      <Hero>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-pixel text-[40px] leading-[60px] sm:text-[60px] sm:leading-[90px]">
            Projects
          </h1>
        </div>
      </Hero>
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <ProjectList projects={projects} />
      </div>
    </>
  );
}
