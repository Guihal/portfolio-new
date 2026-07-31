// Typecheck на TypeScript 7 (tsgo, нативный Go-порт) вместо vue-tsc/TS 5.
//
// Проекты без SFC (server/shared/node) проверяются голым tsgo.
// app-проект содержит .vue → идёт через vue-tsgo, который транслирует SFC
// в виртуальный workspace под node_modules/.cache/vue-tsgo/<hash>/, где
// node_modules — симлинк на реальный. TS резолвит один и тот же h3 по двум
// путям (реальному и через симлинк) и считает `H3Event` разными типами.
// Эти ошибки фильтруются по `.cache/vue-tsgo` в тексте; всё остальное падает.
// Убрать фильтр, когда vue-tsc научится работать с tsgo (ждёт plugin API в TS 7.1).

const TSGO = "node_modules/typescript/bin/tsc";
const PLAIN_PROJECTS = ["server", "shared", "node"];
const SYMLINK_ARTIFACT = "/.cache/vue-tsgo/";

let failed = false;

for (const project of PLAIN_PROJECTS) {
	const proc = Bun.spawnSync(
		[TSGO, "-p", `.nuxt/tsconfig.${project}.json`, "--noEmit"],
		{ stdout: "inherit", stderr: "inherit" },
	);
	if (proc.exitCode !== 0) failed = true;
}

const app = Bun.spawnSync(
	[
		"node_modules/.bin/vue-tsgo",
		"-p",
		".nuxt/tsconfig.app.json",
		"--tsdk",
		"typescript",
	],
	{ stdout: "pipe", stderr: "pipe" },
);

const output = app.stdout.toString() + app.stderr.toString();
const errors = output
	.split("\n")
	.filter((line) => line.includes("error TS"))
	.filter((line) => !line.includes(SYMLINK_ARTIFACT));

if (errors.length > 0) {
	console.log(errors.join("\n"));
	console.log(`\nFound ${errors.length} errors in app project.`);
	failed = true;
}

process.exit(failed ? 1 : 0);
