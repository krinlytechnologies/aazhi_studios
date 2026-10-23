export type ProjectCategory =
  | "residential"
  | "apartment"
  | "villa"
  | "commercial"
  | "hospitality";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  year: number;
  area: string;
  summary: string;
  coverImage: ProjectImage;
  gallery: ProjectImage[];
  featured: boolean;
}
