export type ProgramType = "explorer" | "project" | "tproject" | "about";

export type Program = {
	extension?: string;
};

export type SocialLink = {
	id: string;
	label: string;
	url: string;
	icon: string;
};

export type Entity = {
	name: string;
	programType: ProgramType;
	hidden?: boolean;
};

export type FsFile = Entity & { path: string };

export type ManifestEntry = {
	name: string;
	path: string;
	entity?: Entity;
};

export type ManifestNode = ManifestEntry & {
	children: ManifestNode[];
};

export type Manifest = {
	generatedAt: string;
	rootEntity?: Entity;
	tree: ManifestNode[];
	flatIndex: Record<string, ManifestEntry>;
};
