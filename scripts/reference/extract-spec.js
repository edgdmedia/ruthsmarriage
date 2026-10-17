// Runs inside the live page (agent-browser eval --stdin). Returns a JSON tree of the
// Elementor element hierarchy with bounding boxes and non-default computed styles.
(() => {
	const BOX = ["display", "flexDirection", "flexWrap", "justifyContent", "alignItems", "gap", "width", "maxWidth", "minHeight", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom", "backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "borderRadius", "borderTop", "borderBottom", "borderLeft", "borderRight", "boxShadow", "opacity", "position", "top", "zIndex", "overflow", "transform"];
	const TEXT = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign", "textTransform", "fontStyle", "textDecorationLine", "textShadow"];
	const DEFAULTS = new Set(["none", "normal", "0px", "rgba(0, 0, 0, 0)", "auto", "static", "visible", "1", "start", "nowrap", "row", "stretch", "flex-start", "block", "0% 0%", "auto auto", "0px none rgb(0, 0, 0)", "left"]);
	const round = (n) => Math.round(n);
	const pick = (el, keys) => {
		const cs = getComputedStyle(el);
		const out = {};
		for (const k of keys) {
			let v = cs[k];
			if (v == null || DEFAULTS.has(v)) continue;
			if (/^border(Top|Bottom|Left|Right)$/.test(k) && v.startsWith("0px")) continue;
			if (k === "fontFamily") v = v.split(",")[0].replace(/"/g, "");
			if (k === "backgroundImage") v = v.replace(/url\("?https?:\/\/[^/]+\/wp-content\/uploads\//, 'url("uploads/').slice(0, 160);
			out[k] = v;
		}
		return out;
	};
	const box = (el) => {
		const r = el.getBoundingClientRect();
		return [round(r.left + scrollX), round(r.top + scrollY), round(r.width), round(r.height)];
	};
	const text = (el) => (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300);
	const src = (u) => (u || "").replace(/^https?:\/\/(www\.)?ruthsmarriage\.com\/wp-content\/uploads\//, "uploads/");

	const leaf = (el) => {
		const tag = el.tagName.toLowerCase();
		const n = { tag, box: box(el), ...pick(el, [...TEXT, ...BOX]) };
		if (tag === "img") Object.assign(n, { src: src(el.currentSrc || el.src), natural: [el.naturalWidth, el.naturalHeight], alt: el.alt, objectFit: getComputedStyle(el).objectFit });
		if (tag === "a") n.href = el.getAttribute("href");
		if (tag === "svg") n.svg = el.outerHTML.slice(0, 400);
		const t = text(el);
		if (t) n.text = t;
		return n;
	};

	// Meaningful inner elements per widget type.
	const WIDGET_PARTS = {
		heading: ".elementor-heading-title",
		"text-editor": "p, h1, h2, h3, h4, h5, h6, li, a, strong, em",
		button: ".elementor-button, .elementor-button-text, .elementor-button-icon svg",
		image: "img, figcaption",
		divider: ".elementor-divider-separator, .elementor-divider__text",
		icon: ".elementor-icon, svg",
		"icon-box": ".elementor-icon, svg, .elementor-icon-box-title, .elementor-icon-box-description",
		"icon-list": ".elementor-icon-list-item, .elementor-icon-list-icon svg, .elementor-icon-list-text",
		"social-icons": ".elementor-social-icon",
		"nav-menu": ".elementor-nav-menu--main > ul > li > a, .elementor-menu-toggle, .sub-menu a",
		"theme-site-logo": "img",
		"theme-post-title": ".elementor-heading-title",
		"theme-post-content": "p, h2, h3, h4, li, img, a, blockquote",
		"theme-post-featured-image": "img",
		"jet-listing-dynamic-field": ".jet-listing-dynamic-field__content",
		"jet-listing-dynamic-terms": ".jet-listing-dynamic-terms__link",
		form: "label, input, select, textarea, button",
		search: "input, button",
		video: "iframe, .elementor-custom-embed-image-overlay, img",
		html: "*",
		shortcode: "label, input, button, span",
		posts: "article, img, .elementor-post__title, .elementor-post__excerpt, .elementor-post__read-more",
	};

	const walk = (el, depth = 0) => {
		const type = el.dataset.element_type || el.dataset.elementorType;
		const widget = el.dataset.widget_type?.split(".")[0];
		const node = {
			id: el.dataset.id || el.dataset.elementorId,
			type: widget || type,
			cls: [...el.classList].filter((c) => /^(e-con|e-flex|e-grid|e-parent|e-child|elementor-section|elementor-column|elementor-col-\d+|elementor-hidden-\w+|elementor-sticky|animated|elementor-invisible)/.test(c)).join(" "),
			box: box(el),
			...pick(el, BOX),
		};
		if (el.dataset.settings) {
			try {
				const s = JSON.parse(el.dataset.settings);
				const keep = Object.fromEntries(Object.entries(s).filter(([k]) => /shape|sticky|animation|slides|autoplay|loop|speed|navigation|pagination|background_slideshow|columns|carousel/.test(k)));
				if (Object.keys(keep).length) node.settings = keep;
			} catch {}
		}
		const shapes = [...el.querySelectorAll(":scope > .elementor-shape")].map((s) => ({ pos: s.dataset.shape || s.className, box: box(s), svg: s.innerHTML.trim().slice(0, 600), fill: getComputedStyle(s.querySelector("path") || s).fill }));
		if (shapes.length) node.shapes = shapes;

		if (widget === "jet-listing-grid" || widget === "posts") {
			const items = el.querySelectorAll(".jet-listing-grid__item, article.elementor-post");
			node.items = items.length;
			node.carousel = !!el.querySelector(".slick-slider, .swiper, .jet-listing-grid__slider");
			const sl = el.querySelector("[data-slider_options]");
			if (sl) node.sliderOptions = sl.dataset.slider_options.slice(0, 600);
			node.grid = pick(el.querySelector(".jet-listing-grid__items, .elementor-posts-container") || el, ["display", "gridTemplateColumns", "gap", "columnGap", "rowGap"]);
			node.children = [...items].slice(0, 2).map((it) => {
				const doc = it.querySelector("[data-elementor-id]");
				return { item: true, box: box(it), template: doc?.dataset.elementorId, children: doc ? [...doc.querySelectorAll(":scope > [data-element_type], :scope > * > [data-element_type]")].filter((c) => c.closest("[data-elementor-id]") === doc).map((c) => walk(c, depth + 1)) : [...it.querySelectorAll(WIDGET_PARTS.posts)].slice(0, 6).map(leaf) };
			});
			return node;
		}
		if (widget) {
			if (widget === "html") {
				node.html = el.innerHTML.replace(/\s+/g, " ").slice(0, 800);
				node.text = text(el);
				return node;
			}
			const sel = WIDGET_PARTS[widget] || "*:not(div):not(span)";
			const parts = [...el.querySelectorAll(sel)].filter((p) => p.getBoundingClientRect().width > 0).slice(0, widget === "nav-menu" ? 40 : 14);
			node.parts = parts.map(leaf);
			if (!node.parts.length) node.text = text(el);
			return node;
		}
		const kids = [...el.querySelectorAll("[data-element_type]")].filter((c) => c.parentElement.closest("[data-element_type]") === el);
		node.children = kids.map((c) => walk(c, depth + 1));
		return node;
	};

	const docs = [...document.querySelectorAll("[data-elementor-type]")].filter((d) => !d.parentElement.closest("[data-elementor-type]"));
	const result = {
		url: location.href,
		viewport: [innerWidth, innerHeight],
		pageHeight: document.documentElement.scrollHeight,
		bodyFont: pick(document.body, TEXT),
		documents: docs.map((d) => ({
			type: d.dataset.elementorType,
			id: d.dataset.elementorId,
			box: box(d),
			children: [...d.querySelectorAll("[data-element_type]")].filter((c) => !c.parentElement.closest("[data-element_type]") && c.closest("[data-elementor-type]") === d).map((c) => walk(c)),
		})),
	};
	// Non-Elementor (Hello theme default) main content: posts, archives, search, 404.
	const main = document.querySelector("main#content");
	if (main && !main.querySelector("[data-elementor-type]")) {
		result.helloMain = { box: box(main), ...pick(main, BOX), parts: [...main.querySelectorAll("h1, h2, h3, h4, p, img, a, li, article, blockquote, nav, input, button, textarea, label, figure, .page-content > *")].filter((p) => p.getBoundingClientRect().width > 0).slice(0, 80).map(leaf) };
	}
	return JSON.stringify(result);
})();
