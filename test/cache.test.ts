import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setCacheHint } from "../src/lib/cache";

describe("setCacheHint", () => {
	let mockCache: { enabled: boolean; set: vi.Mock };

	beforeEach(() => {
		mockCache = { enabled: true, set: vi.fn() };
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sets the hint when cache is enabled and hint is truthy", () => {
		setCacheHint(mockCache, "test-hint");
		expect(mockCache.set).toHaveBeenCalledWith("test-hint");
	});

	it("does not set when cache is disabled", () => {
		mockCache.enabled = false;
		setCacheHint(mockCache, "test-hint");
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it("does not set when hint is undefined", () => {
		setCacheHint(mockCache, undefined);
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it("does not set when cache is undefined", () => {
		setCacheHint(undefined, "test-hint");
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it("combines repeated set() calls", () => {
		setCacheHint(mockCache, "hint-a");
		setCacheHint(mockCache, "hint-b");
		expect(mockCache.set).toHaveBeenCalledTimes(2);
		expect(mockCache.set).toHaveBeenNthCalledWith(1, "hint-a");
		expect(mockCache.set).toHaveBeenNthCalledWith(2, "hint-b");
	});
});
