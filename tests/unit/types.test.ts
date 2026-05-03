import { describe, expectTypeOf, it } from "vitest";
import type { Entity, ProgramType } from "~~/shared/types/filesystem";

describe("types", () => {
	it("Entity minimal passes", () => {
		expectTypeOf<Entity>({ name: "x", programType: "about" });
	});

	it("Entity full passes", () => {
		expectTypeOf<Entity>({
			name: "x",
			programType: "code",
			tags: ["a"],
			year: "2024",
			description: "d",
			links: [{ label: "l", href: "#" }],
		});
	});

	it("ProgramType 'showcase' valid", () => {
		expectTypeOf<ProgramType>("showcase");
	});

	it("ProgramType 'code' valid", () => {
		expectTypeOf<ProgramType>("code");
	});

	it("'unknown' is not ProgramType", () => {
		// @ts-expect-error unknown is not in the union
		expectTypeOf<ProgramType>("unknown");
	});
});
