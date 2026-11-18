import projectsData from "./projects.json";
import siteData from "./site.json";

export type Link = {
  /** e.g. "GitHub", "App Store", "TestFlight" */
  label: string;
  url: string;
};

export type Project = {
  name: string;
  description: string;
  /** Free text, e.g. "shipped", "in progress", "dead". Empty to hide. */
  status: string;
  platforms: string[];
  /** Path under /public, e.g. "/icons/bayer.png". Empty for a letter placeholder. */
  icon: string;
  /** Optional dark-mode icon. Falls back to `icon`. */
  iconDark?: string;
  links: Link[];
};

export type Site = {
  name: string;
  about: string[];
  socials: Link[];
};

/** Shown in the order they appear in projects.json. */
export const projects: Project[] = projectsData;
export const site: Site = siteData;
