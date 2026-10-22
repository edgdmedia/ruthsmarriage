/* BookingModal — centred modal opened from the service page "Book Service" button.
   Spec: migration-plan/page-maps/single-service.md (Booking modal section).
   - Overlay: fixed full viewport, rgba(0,0,0,.8), click closes, no animation.
   - Panel: 70vw × 90vh, white, radius 30px, box-shadow, overflow-y: auto.
   - Sections: Confidentiality Policy, Cancellation Policy, agreement panel.
   - Accessible: role="dialog", aria-modal, focus trap, Esc closes, focus returns to trigger.
   - Checkbox gates the "Book Now" button; unchecked clicks flash the row red 6×.
   - Clicking a policy name scrolls to that section without toggling the checkbox.
   The modal is always in the DOM; visibility is toggled with the `open` class
   from the parent page's inline script (Astro islands can't share state).
 */
import { useEffect, useRef, useState } from "react";

interface BookingModalProps {
	bookingUrl: string;
	confidentialityContent: string | null | undefined;
	cancellationContent: string | null | undefined;
}

export const BookingModal = ({
	bookingUrl,
	confidentialityContent,
	cancellationContent,
}: BookingModalProps) => {
	const [agreed, setAgreed] = useState(false);
	const [flashing, setFlashing] = useState(false);
	let flashCount = 0;
	const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Focus trap + scroll lock when the modal has the `open` class.
	useEffect(() => {
		const modal = document.querySelector(".booking-modal");
		if (!modal || !modal.classList.contains("open")) return;

		const firstFocusable = document.querySelector(
			'[role="dialog"] button, [role="dialog"] a, [role="dialog"] input'
		) as HTMLElement | null;
		if (firstFocusable) firstFocusable.focus({ preventScroll: true });

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				modal.classList.remove("open");
				document.body.style.overflow = "";
				document.querySelector(".booking-modal-overlay")?.classList.remove("open");
			}
		};
		document.addEventListener("keydown", onKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
		};
	}, []);

	// Stop flashing timers on unmount.
	useEffect(() => {
		return () => {
			if (flashTimer.current) clearTimeout(flashTimer.current);
			flashCount = 0;
		};
	}, []);

	const toggleAgreement = () => setAgreed((prev) => !prev);

	const handleBookNow = () => {
		if (!agreed) {
			setFlashing(true);
			flashCount = 0;
			const flash = () => {
				flashCount += 1;
				if (flashCount >= 12) {
					setFlashing(false);
					return;
				}
				flashTimer.current = setTimeout(flash, 300);
			};
			flashTimer.current = setTimeout(flash, 300);
			return;
		}
		if (bookingUrl) {
			window.location.href = bookingUrl;
		}
	};

	const scrollToSection = (id: string) => {
		const el = document.getElementById(id);
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const toggleOpen = () => {
		const modal = document.querySelector(".booking-modal");
		const overlay = document.querySelector(".booking-modal-overlay");
		if (!modal) return;
		const isOpen = modal.classList.contains("open");
		if (isOpen) {
			modal.classList.remove("open");
			overlay?.classList.remove("open");
			document.body.style.overflow = "";
		} else {
			modal.classList.add("open");
			overlay?.classList.add("open");
			document.body.style.overflow = "hidden";
			const firstFocusable = document.querySelector(
				'[role="dialog"] button, [role="dialog"] a, [role="dialog"] input'
			) as HTMLElement | null;
			if (firstFocusable) firstFocusable.focus({ preventScroll: true });
		}
	};

	return (
		<>
			<div
				className="booking-modal-overlay"
				onClick={toggleOpen}
				aria-hidden="true"
			/>
			<div
				className="booking-modal"
				role="dialog"
				aria-modal="true"
				aria-label="Book Service"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					className="booking-modal-close"
					onClick={toggleOpen}
					aria-label="Close"
				>
					✕
				</button>
				<div className="booking-modal-content">
					<section id="Confidentiality" className="booking-policy">
						<h5 className="booking-policy-title">
							Confidentiality Policy
						</h5>
						<div className="booking-policy-divider" />
						<div className="booking-policy-body" dangerouslySetInnerHTML={{ __html: confidentialityContent ?? "" }} />
					</section>
					<section
						id="Cancellation"
						className="booking-policy booking-policy--cancellation"
					>
						<h5 className="booking-policy-title">
							Cancellation Policy
						</h5>
						<div className="booking-policy-divider" />
						<div className="booking-policy-body" dangerouslySetInnerHTML={{ __html: cancellationContent ?? "" }} />
					</section>
					<div className="booking-agreement">
						<div
							className={`booking-policy-agreement ${
								flashing ? "booking-policy-agreement--flash" : ""
							}`}
						>
							<input
								type="checkbox"
								id="booking-agree"
								checked={agreed}
								onChange={toggleAgreement}
								className="booking-agree-checkbox"
							/>
							<label htmlFor="booking-agree" className="booking-agree-label">
								I agree to the
								{" "}
								<a
									href="#Confidentiality"
									className="booking-policy-link"
									onClick={(event) => {
										event.preventDefault();
										scrollToSection("Confidentiality");
									}}
								>
									Confidentiality Policy
								</a>
								{" "}
								and
								{" "}
								<a
									href="#Cancellation"
									className="booking-policy-link"
									onClick={(event) => {
										event.preventDefault();
										scrollToSection("Cancellation");
									}}
								>
									Cancellation Policy
								</a>
								.
							</label>
						</div>
						<button
							type="button"
							className={`booking-book-now ${agreed ? "booking-book-now--active" : ""}`}
							onClick={handleBookNow}
						>
							Book Now
						</button>
					</div>
				</div>
			</div>
		</>
	);
};
