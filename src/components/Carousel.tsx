/* Carousel — replaces JetEngine slick sliders (README D8).
   Behaves like slick: 3/2/1 per view (hero: 1), infinite, 500ms speed,
   autoplay with pauseOnHover (5000ms content / 9000ms hero),
   dots for content carousels / arrows for hero.
   SSR renders the first slidesToShow slides so there's no layout shift;
   Swiper hydrates on client via `client:load`. */
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { IconSliderPrevArrow } from "./icons/slider-prev-arrow";

export const Carousel = ({
	slides,
	variant = "content", // "content" | "hero"
	autoplayMs,
	slidesPerViewOverride,
} = {}) => {
	const swiperRef = useRef(null);
	const [isClient, setIsClient] = useState(false);
	const count = slidesPerViewOverride || (variant === "hero" ? 1 : 3);
	const delay = autoplayMs ?? (variant === "hero" ? 9000 : 5000);
	const reduce =
		typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// SSR: always render slides; client hydrates Swiper once mounted.
	if (!isClient) {
		return (
			<div className="carousel carousel--ssr" style={{ position: "relative" }}>
				<div className="swiper" style={{ overflow: "hidden" }}>
					<div className="swiper-wrapper">
						{slides.slice(0, count).map((slide, i) => (
							<SwiperSlide key={i} style={{ flex: `0 0 ${100 / count}%`, padding: "0 10px" }}>
								{slide}
							</SwiperSlide>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="carousel" style={{ position: "relative" }}>
			<Swiper
				ref={swiperRef}
				modules={[Navigation, Pagination, Autoplay]}
				slidesPerView={count}
				spaceBetween={0}
				centeredSlides={false}
				loop={true}
				speed={500}
				autoplay={reduce ? false : { delay, disableOnInteraction: false, pauseOnMouseEnter: true }}
				pagination={variant === "content" ? { el: ".swiper-pagination", clickable: true } : false}
				navigation={variant === "hero" ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" } : false}
				observer={true}
				observeParents={true}
				onSwiper={(swiper) => {
					// pull the track a touch wider than the box like slick (-10px each side)
					const track = swiperRef?.current?.querySelector?.(".swiper-wrapper");
					if (track) track.style.margin = "0 -10px";
				}}
				className="swiper my-swiper"
				style={{ marginLeft: "-10px", marginRight: "-10px", overflow: "hidden" }}
			>
				{slides.map((slide, i) => (
					<SwiperSlide key={i} style={{ padding: "0 10px" }}>
						{slide}
					</SwiperSlide>
				))}
				{variant === "content" && (
					<div className="swiper-pagination" style={{ margin: "10px 0", display: "flex", justifyContent: "center" }} />
				)}
				{variant === "hero" && (
					<>
						<button className="swiper-button-prev" style={{ position: "absolute", top: "50%", marginTop: "-25px", left: "10px", zIndex: 10, background: "none", border: "none", padding: 0, cursor: "pointer", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<IconSliderPrevArrow style={{ width: "30px", height: "30px", color: "#ffffff" }} />
						</button>
						<button className="swiper-button-next" style={{ position: "absolute", top: "50%", marginTop: "-25px", right: "10px", zIndex: 10, background: "none", border: "none", padding: 0, cursor: "pointer", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<IconSliderPrevArrow style={{ width: "30px", height: "30px", color: "#ffffff", transform: "scaleX(-1)" }} />
						</button>
					</>
				)}
			</Swiper>
			<style>{`
				.swiper-pagination .swiper-pagination-bullet {
					width: 12px !important;
					height: 12px !important;
					background: #BF1E7224 !important;
					border-radius: 100% !important;
					margin: 0 3px !important;
					opacity: 1 !important;
				}
				.swiper-pagination .swiper-pagination-bullet-active {
					background: #ED0D82 !important;
				}
				.swiper-button-prev, .swiper-button-next {
					width: 50px !important;
					height: 50px !important;
					color: #ffffff !important;
				}
			`}</style>
		</div>
	);
};
