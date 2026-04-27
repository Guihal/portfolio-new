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

// P8-03 — алиасы для FsClient API. Сервер /api/filesystem/list возвращает FsFile[],
// /api/filesystem/breadcrumbs возвращает FsFile[]. Отдельные имена сохраняют
// семантику в сигнатурах клиента и упрощают будущую эволюцию (если breadcrumb
// получит дополнительные поля — менять только Breadcrumb).
export type FsList = FsFile[];
export type Breadcrumb = FsFile;

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
