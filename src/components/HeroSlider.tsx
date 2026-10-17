/* HeroSlider — homepage hero with portrait/overlay slide layouts (home.md §1).
   SSR renders all slides; Swiper client hydration added later. */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";

interface Slide {
	layout: "portrait" | "overlay";
	title: string;
	subtitle: string;
	buttonLabel: string;
	buttonUrl: string;
	image: string;
}

export const HeroSlider = ({ slides = [] }: { slides?: Slide[] } = {}) => {
	const reduce =
		typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

	return (
		<div className="heroslider" style={{ position: "relative", minHeight: "100vh", padding: "10px" }}>
			<Swiper
				modules={[Navigation, Autoplay]}
				slidesPerView={1}
				spaceBetween={0}
				loop={true}
				speed={500}
				autoplay={reduce ? false : { delay: 9000, disableOnInteraction: false, pauseOnMouseEnter: true }}
				navigation={true}
				observer={true}
				observeParents={true}
				className="swiper my-swiper"
				style={{ marginLeft: "-10px", marginRight: "-10px", overflow: "hidden" }}
			>
				{slides.map((s, i) => (
					<SwiperSlide key={i} style={{ padding: "0 10px" }}>
						<div
							className="slide"
							style={{
								minHeight: "95vh",
								display: "flex",
								flexDirection: "column",
								justifyContent: s.layout === "portrait" ? "flex-end" : "center",
								padding: s.layout === "portrait" ? "50px 50px 100px 80px" : "50px",
								backgroundImage: `url(${s.image})`,
								backgroundSize: s.layout === "portrait" ? "130% auto" : "cover",
								backgroundPosition: s.layout === "portrait" ? "center left" : "center right",
								backgroundRepeat: "no-repeat",
							}}
						>
							<div style={{ width: s.layout === "portrait" ? "76%" : "70%", padding: "10px", gap: "30px" }}>
								<h1
									style={{
										fontFamily: "Nunito, sans-serif",
										fontSize: s.layout === "portrait" ? "99px" : "70px",
										lineHeight: s.layout === "portrait" ? "99px" : "70px",
										fontWeight: 800,
										color: "#ffffff",
										textShadow: "4px 0 22px rgba(0,0,0,.3)",
										margin: 0,
									}}
								>
									{s.title}
								</h1>
								<p
									style={{
										fontFamily: "Poppins, sans-serif",
										fontSize: s.layout === "portrait" ? "24px" : "24px",
										lineHeight: "24px",
										fontWeight: 400,
										color: "#ffffff",
										margin: 0,
									}}
								>
									{s.subtitle}
								</p>
								<a
									href={s.buttonUrl}
									style={{
										color: "#BF1E72",
										backgroundColor: "#ffffff",
										borderRadius: "20px",
										padding: s.layout === "portrait" ? "12px 24px" : "15px 30px",
										fontFamily: "Nunito, sans-serif",
										fontSize: s.layout === "portrait" ? "15px" : "16px",
										lineHeight: s.layout === "portrait" ? "15px" : "16px",
										fontWeight: s.layout === "portrait" ? 500 : 600,
										textDecoration: "none",
										display: "inline-flex",
										alignItems: "center",
										gap: "5px",
									}}
								>
									<svg width="15" height="15" viewBox="0 0 512 512" fill="currentColor" style={{ marginRight: "5px" }}>
										<path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z" />
									</svg>
									{s.buttonLabel}
								</a>
							</div>
						</div>
					</SwiperSlide>
				))}
				<button className="swiper-button-prev" style={{ position: "absolute", top: "50%", marginTop: "-25px", left: "10px", zIndex: 10, background: "none", border: "none", padding: 0, cursor: "pointer", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<svg width="30" height="30" viewBox="0 0 180 180" fill="black">
						<path d="M119 47.3166C119 48.185 118.668 48.9532 118.003 49.6212L78.8385 89L118.003 128.379C118.668 129.047 119 129.815 119 130.683C119 131.552 118.668 132.32 118.003 132.988L113.021 137.998C112.356 138.666 111.592 139 110.729 139C109.865 139 109.101 138.666 108.436 137.998L61.9966 91.3046C61.3322 90.6366 61 89.8684 61 89C61 88.1316 61.3322 87.3634 61.9966 86.6954L108.436 40.002C109.101 39.334 109.865 39 110.729 39C111.592 39 112.356 39.334 113.021 40.002L118.003 45.012C118.668 45.68 119 46.4482 119 47.3166Z" />
					</svg>
				</button>
				<button className="swiper-button-next" style={{ position: "absolute", top: "50%", marginTop: "-25px", right: "10px", zIndex: 10, background: "none", border: "none", padding: 0, cursor: "pointer", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<svg width="30" height="30" viewBox="0 0 180 180" fill="black" style={{ transform: "scaleX(-1)" }}>
						<path d="M119 47.3166C119 48.185 118.668 48.9532 118.003 49.6212L78.8385 89L118.003 128.379C118.668 129.047 119 129.815 119 130.683C119 131.552 118.668 132.32 118.003 132.988L113.021 137.998C112.356 138.666 111.592 139 110.729 139C109.865 139 109.101 138.666 108.436 137.998L61.9966 91.3046C61.3322 90.6366 61 89.8684 61 89C61 88.1316 61.3322 87.3634 61.9966 86.6954L108.436 40.002C109.101 39.334 109.865 39 110.729 39C111.592 39 112.356 39.334 113.021 40.002L118.003 45.012C118.668 45.68 119 46.4482 119 47.3166Z" />
					</svg>
				</button>
				<style>{`
					.swiper-button-prev, .swiper-button-next {
						width: 50px !important;
						height: 50px !important;
						color: #ffffff !important;
					}
				`}</style>
			</Swiper>
		</div>
	);
};
