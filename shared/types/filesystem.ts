export type ProgramType =
	| "explorer"
	| "project"
	| "tproject"
	| "about"
	| "code"
	| "showcase";

export type Program = {
	extension?: string;
};

export type SocialLink = {
	id: string;
	label: string;
	url: string;
	icon: string;
};

export type EntityLink = {
	label: string;
	href: string;
};

export type Entity = {
	name: string;
	programType: ProgramType;
	hidden?: boolean;
	year?: string;
	tags?: string[];
	description?: string;
	summary?: string;
	links?: EntityLink[];
};

// FsFile — то, что API возвращает клиенту. mtime/size живут на уровне FS-ноды
// (не Entity), потому что это не контент-метаданные из entity.json, а свойства
// сканированной директории/файла.
export type FsFile = Entity & {
	path: string;
	mtime?: string;
	size?: number;
};

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
	// ISO 8601 (UTC) mtime из fs.stat. Прокидывается до клиента для колонки
	// «Дата изменения» в Explorer.
	mtime?: string;
	// bytes; только для regular files. Для директорий — undefined (UI показывает —).
	size?: number;
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
