/**
 * EmDash email provider for Resend (https://resend.com), over its HTTP API —
 * no SMTP, so it runs natively on Node.
 *
 * The API key is read from the process environment at delivery time
 * (RESEND_API_KEY), never stored in the database or bundle. On the VPS it
 * comes from /etc/ruthsmarriage.env; in local dev from .env.
 * The From address must be on a domain verified in Resend.
 */
import { definePlugin } from "emdash";

const ID = "resend-email";
const VERSION = "1.0.0";
const CAPABILITIES = ["hooks.email-transport:register"];

/** @param {{ from: { email: string, name?: string } | string, replyTo?: string, apiKeyEnv?: string }} options */
export function resendEmail(options) {
	assertFrom(options);
	return {
		id: ID,
		version: VERSION,
		format: "native",
		entrypoint: "@ruthsmarriage/resend-email",
		capabilities: CAPABILITIES,
		options,
	};
}

export function createPlugin(options) {
	assertFrom(options);
	const from = typeof options.from === "string" ? options.from : formatAddress(options.from);
	const keyName = options.apiKeyEnv ?? "RESEND_API_KEY";

	return definePlugin({
		id: ID,
		version: VERSION,
		capabilities: CAPABILITIES,
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async (event, ctx) => {
					const { message } = event;
					const apiKey = await readSecret(keyName);
					const replyTo = message.replyTo ?? options.replyTo;
					const res = await fetch("https://api.resend.com/emails", {
						method: "POST",
						headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
						body: JSON.stringify({
							from,
							to: [message.to],
							subject: message.subject,
							text: message.text,
							...(message.html ? { html: message.html } : {}),
							...(message.cc?.length ? { cc: message.cc } : {}),
							...(replyTo ? { reply_to: replyTo } : {}),
						}),
					});
					const body = await res.json().catch(() => ({}));
					if (!res.ok) {
						throw new Error(`[resend-email] ${res.status} ${body?.name ?? ""}: ${body?.message ?? "send failed"}`);
					}
					ctx.log.info("email delivered via Resend", { to: message.to, subject: message.subject, id: body?.id });
				},
			},
		},
	});
}

export default createPlugin;

async function readSecret(name) {
	let value;
	try {
		const { env } = await import("./env.mjs");
		value = env?.[name];
	} catch {
		value = globalThis.process?.env?.[name];
	}
	if (!value) throw new Error(`[resend-email] ${name} is not set — add it to /etc/ruthsmarriage.env (or .env for dev).`);
	return value;
}

function formatAddress({ email, name }) {
	return name ? `${name.replace(/[<>"]/g, "")} <${email}>` : email;
}

function assertFrom(options) {
	const email = typeof options?.from === "string" ? options.from : options?.from?.email;
	if (!email || !email.includes("@")) throw new Error("[resend-email] options.from is required, on a domain verified in Resend.");
}
