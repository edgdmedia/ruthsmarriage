/* Vanilla Swiper init for server-rendered carousel markup (_global.md → Carousel, D8).
   Each `.swiper[data-swiper]` element carries its JSON config; markup works
   without JS (first slidesPerView slides show side by side via CSS). */
import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

interface CarouselConfig {
	slidesPerView?: number;
	breakpoints?: Record<number, { slidesPerView: number }>;
	delay?: number;
}

export function initCarousels(root: Document | HTMLElement = document) {
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	for (const el of root.querySelectorAll<HTMLElement>(".swiper[data-swiper]")) {
		if ((el as any).swiper) continue; // already initialised
		const cfg: CarouselConfig = JSON.parse(el.dataset.swiper as string);
		const opts: any = {
			modules: [Navigation, Pagination, Autoplay],
			slidesPerView: cfg.slidesPerView ?? 3,
			spaceBetween: 0,
			loop: true,
			speed: 500,
			autoplay:
				!reduce && cfg.delay
					? { delay: cfg.delay, disableOnInteraction: false, pauseOnMouseEnter: true }
					: false,
		};
		if (cfg.breakpoints) opts.breakpoints = cfg.breakpoints;
		const paginationEl = el.querySelector<HTMLElement>(".swiper-pagination");
		if (paginationEl) opts.pagination = { el: paginationEl, clickable: true };
		const nextEl = el.querySelector<HTMLElement>(".swiper-button-next");
		const prevEl = el.querySelector<HTMLElement>(".swiper-button-prev");
		if (nextEl || prevEl) opts.navigation = { nextEl: nextEl ?? undefined, prevEl: prevEl ?? undefined };
		new Swiper(el, opts);
	}
}

initCarousels();
