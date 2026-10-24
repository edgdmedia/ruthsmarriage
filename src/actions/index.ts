/* Astro actions. askCoach: the anonymous Ask Coach Ruth form (phase 6.4).
   Turnstile check → per-IP rate limit → save to EmDash + email via Resend's
   REST API. No submitter identity is collected, saved or sent. */
import { ActionError, defineAction } from "astro:actions";
import {
	ASKCOACH_FROM,
	ASKCOACH_TO,
	EMDASH_TOKEN,
	EMDASH_URL,
	RESEND_API_KEY,
	TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { z } from "astro/zod";

export const CATEGORIES = ["Love", "Dating", "Marriage", "Sex", "Faith", "Life"] as const;

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
// In-memory: fine for the single VPS process; resets on restart.
const hits = new Map<string, number[]>();
const rateLimited = (ip: string) => {
	const now = Date.now();
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= LIMIT) return true;
	hits.set(ip, [...recent, now]);
	return false;
};

const verifyTurnstile = async (token: string, ip: string) => {
	if (!TURNSTILE_SECRET_KEY) return import.meta.env.DEV; // unconfigured: allow only in dev
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body: new URLSearchParams({
			secret: TURNSTILE_SECRET_KEY,
			response: token,
			remoteip: ip,
		}),
	});
	const data = (await res.json()) as { success?: boolean };
	return data.success === true;
};

const escapeHtml = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Question = { category: (typeof CATEGORIES)[number]; question: string };

/** Saves a draft entry in EmDash's ask_coach_questions collection. false = not saved. */
const saveQuestion = async ({ category, question }: Question) => {
	if (!EMDASH_URL || !EMDASH_TOKEN) return false;
	const date = new Date().toISOString().slice(0, 10);
	try {
		const res = await fetch(new URL("/_emdash/api/content/ask_coach_questions", EMDASH_URL), {
			method: "POST",
			headers: {
				Authorization: `Bearer ${EMDASH_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status: "draft",
				data: { title: `${category} · ${date}`, category, question },
			}),
		});
		if (res.ok) return true;
		console.error("askCoach: EmDash save failed", res.status, await res.text());
	} catch (err) {
		console.error("askCoach: EmDash save failed", err);
	}
	return false;
};

/** Emails the question to the coach via Resend. false = not sent. */
const emailQuestion = async ({ category, question }: Question) => {
	if (!RESEND_API_KEY) return false;
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: ASKCOACH_FROM,
				to: [ASKCOACH_TO],
				subject: `Ask Coach: ${category}`,
				text: `Category: ${category}\n\nQuestion:\n${question}\n\n(Sent anonymously from ruthsmarriage.com/askcoach)`,
				html: `<p><strong>Category:</strong> ${category}</p><p><strong>Question:</strong></p><p>${escapeHtml(
					question,
				).replace(/\n/g, "<br>")}</p><p style="color:#888">Sent anonymously from ruthsmarriage.com/askcoach</p>`,
			}),
		});
		if (res.ok) return true;
		console.error("askCoach: Resend failed", res.status, await res.text());
	} catch (err) {
		console.error("askCoach: Resend failed", err);
	}
	return false;
};

export const server = {
	askCoach: defineAction({
		accept: "form",
		input: z.object({
			category: z.enum(CATEGORIES),
			question: z.string().trim().min(1, "Please enter your question.").max(5000),
			"cf-turnstile-response": z.string().nullish(),
		}),
		handler: async (input, context) => {
			// Only headers our own edge sets: Cloudflare's, or nginx's X-Real-IP on the VPS
			// (phase 9 must set it). X-Forwarded-For is client-controlled, so it's ignored.
			const ip =
				context.request.headers.get("cf-connecting-ip") ??
				context.request.headers.get("x-real-ip") ??
				context.clientAddress;

			if (!(await verifyTurnstile(input["cf-turnstile-response"] ?? "", ip))) {
				throw new ActionError({
					code: "FORBIDDEN",
					message: "Spam check failed.",
				});
			}
			if (rateLimited(ip)) {
				throw new ActionError({
					code: "TOO_MANY_REQUESTS",
					message: "Too many questions. Please try again later.",
				});
			}
			if (!RESEND_API_KEY && !EMDASH_TOKEN) {
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Ask Coach is not configured.",
				});
			}

			// Save and email independently: the question counts as received if either works.
			const [saved, emailed] = await Promise.all([saveQuestion(input), emailQuestion(input)]);
			if (!saved && !emailed) {
				// Keep the question in the server log so it isn't lost.
				console.error("askCoach: save and email both failed", {
					category: input.category,
					question: input.question,
				});
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Your submission failed because of an error.",
				});
			}
			return { sent: true };
		},
	}),
};
