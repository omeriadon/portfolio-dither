import type { Project } from "@/data";
import { AppIcon } from "./AppIcon";

export function ProjectList({ projects }: { projects: Project[] }) {
	return (
		<ol className="border-t border-subtle">
			{projects.map((project) => (
				<li
					key={project.name}
					className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-3 border-b border-subtle py-8"
				>
					<AppIcon
						name={project.name}
						icon={project.icon}
						iconDark={project.iconDark}
					/>
					<div className="flex min-w-0 flex-col gap-2">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
							<h2 className="font-pixel text-[30px] leading-10">
								{project.name}
							</h2>
							{project.status && (
								<span className="border border-subtle px-1.5 text-xs leading-5 text-muted">
									{project.status}
								</span>
							)}
						</div>
						{project.description && (
							<p className="text-sm leading-relaxed">{project.description}</p>
						)}
						{project.platforms.length > 0 && (
							<p className="text-xs text-muted">
								{project.platforms.join(" / ")}
							</p>
						)}
						{project.links.length > 0 && (
							<div className="mt-1 flex flex-wrap gap-x-5 gap-y-2 text-sm">
								{project.links.map((link) => (
									<a
										key={link.url}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										className="underline decoration-subtle underline-offset-4 hover:decoration-foreground"
									>
										{link.label} ↗
									</a>
								))}
							</div>
						)}
					</div>
				</li>
			))}
		</ol>
	);
}
