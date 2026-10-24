/* BookingModal — centred modal opened by any `[data-booking-open]` button on the
   page. Spec: migration-plan/page-maps/single-service.md (Booking modal section).
   - Overlay: fixed full viewport, rgba(0,0,0,.8), click closes, no animation.
   - Panel: 70vw × 90vh, white, radius 30px, box-shadow, overflow-y: auto.
     No close button (matches live): Esc or an overlay click closes.
   - Sections: Confidentiality Policy, Cancellation Policy, agreement panel.
   - role="dialog", aria-modal, focus trap, focus returns to the trigger.
   - The checkbox gates "Book Now"; an unchecked click flashes the agreement row
     (2px red border, toggled every 300ms, 6 times).
   - A policy name scrolls the panel to that section without toggling the box.
   Styles: components.css → "Booking modal". */
import { useEffect, useRef, useState } from "react";
import { cancellationPolicyHtml, confidentialityPolicyHtml } from "../data/policies";

interface BookingModalProps {
	bookingUrl: string;
}

const FOCUSABLE = 'a[href], button, input, [tabindex]:not([tabindex="-1"])';

export const BookingModal = ({ bookingUrl }: BookingModalProps) => {
	const [open, setOpen] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [flash, setFlash] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const flashTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	// Open from any trigger on the page (the service page's "Book Service").
	useEffect(() => {
		// A click that landed before hydration was queued by the page (see service/[slug].astro).
		const w = window as Window & { __bookingReady?: boolean; __bookingPending?: HTMLElement };
		w.__bookingReady = true;
		if (w.__bookingPending) {
			triggerRef.current = w.__bookingPending;
			w.__bookingPending = undefined;
			setOpen(true);
		}
		const onClick = (event: MouseEvent) => {
			const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-booking-open]");
			if (!trigger) return;
			event.preventDefault();
			triggerRef.current = trigger;
			setOpen(true);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);

	// While open: lock page scroll, focus the panel, trap Tab, close on Esc.
	useEffect(() => {
		if (!open) return;
		const panel = panelRef.current;
		document.body.style.overflow = "hidden";
		panel?.scrollTo(0, 0);
		panel?.focus({ preventScroll: true });

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				return;
			}
			if (event.key !== "Tab" || !panel) return;
			const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
			if (items.length === 0) return;
			const first = items[0];
			const last = items[items.length - 1];
			if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
			triggerRef.current?.focus({ preventScroll: true });
		};
	}, [open]);

	useEffect(() => () => {
		if (flashTimer.current) clearInterval(flashTimer.current);
	}, []);

	const handleBookNow = () => {
		if (agreed) {
			if (bookingUrl) window.location.href = bookingUrl;
			return;
		}
		if (flashTimer.current) clearInterval(flashTimer.current);
		let ticks = 0;
		setFlash(true);
		flashTimer.current = setInterval(() => {
			ticks += 1;
			setFlash((on) => !on);
			if (ticks >= 11) {
				clearInterval(flashTimer.current!);
				flashTimer.current = null;
				setFlash(false);
			}
		}, 300);
	};

	// Scroll inside the panel; preventDefault also keeps the label from toggling the box.
	const scrollToSection = (event: React.MouseEvent, id: string) => {
		event.preventDefault();
		const panel = panelRef.current;
		const target = panel?.querySelector<HTMLElement>(`#${id}`);
		if (panel && target) panel.scrollTo({ top: target.offsetTop, behavior: "smooth" });
	};

	if (!open) return null;

	return (
		<div className="booking-modal-overlay" onClick={() => setOpen(false)}>
			<div
				ref={panelRef}
				className="booking-modal"
				role="dialog"
				aria-modal="true"
				aria-label="Booking policies"
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="booking-modal-content">
					<section id="Confidentiality" className="booking-policy">
						<h5 className="booking-policy-title">Confidentiality Policy</h5>
						<div className="booking-policy-divider" />
						<div className="booking-policy-body" dangerouslySetInnerHTML={{ __html: confidentialityPolicyHtml }} />
					</section>
					<section id="Cancellation" className="booking-policy booking-policy--cancellation">
						<h5 className="booking-policy-title">Cancellation Policy</h5>
						<div className="booking-policy-divider" />
						<div className="booking-policy-body" dangerouslySetInnerHTML={{ __html: cancellationPolicyHtml }} />
					</section>
					<div className="booking-agreement">
						<div className={`booking-policy-agreement${flash ? " booking-policy-agreement--flash" : ""}`}>
							<input
								type="checkbox"
								id="booking-agree"
								checked={agreed}
								onChange={(event) => setAgreed(event.target.checked)}
								className="booking-agree-checkbox"
							/>
							<label htmlFor="booking-agree" className="booking-agree-label">
								I agree to the{" "}
								<a href="#Confidentiality" onClick={(event) => scrollToSection(event, "Confidentiality")}>
									Confidentiality Policy
								</a>{" "}
								and{" "}
								<a href="#Cancellation" onClick={(event) => scrollToSection(event, "Cancellation")}>
									Cancellation Policy
								</a>
							</label>
						</div>
						<button
							type="button"
							className={`booking-book-now${agreed ? " booking-book-now--active" : ""}`}
							aria-disabled={!agreed}
							onClick={handleBookNow}
						>
							Book Now
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
