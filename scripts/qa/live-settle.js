(async () => {
  const sheets = ['nunito', 'poppins', 'roboto'];
  for (const s of sheets) {
    const link = [...document.querySelectorAll('link[rel=stylesheet]')].find(l => l.href.includes('google-fonts/css/' + s));
    if (!link) continue;
    const css = await (await fetch(link.href.replace('//ruthsmarriage.com', '//www.ruthsmarriage.com'))).text();
    const style = document.createElement('style');
    style.textContent = css.replaceAll('https://ruthsmarriage.com/', 'https://www.ruthsmarriage.com/');
    document.head.append(style);
    link.remove();
  }
  // Drop any already-failed faces so they can't shadow the working ones.
  [...document.fonts].filter(f => f.status === 'error').forEach(f => document.fonts.delete(f));
  await Promise.allSettled(['600 16px Nunito', '800 16px Nunito', '400 16px Poppins', '500 16px Poppins', '600 15px Roboto'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  document.querySelectorAll('.swiper, .swiper-container').forEach(s => { s.swiper?.autoplay?.stop(); s.swiper?.slideTo?.(0, 0); });
  document.querySelectorAll('.slick-slider').forEach(s => { try { jQuery(s).slick('slickPause').slick('slickGoTo', 0, true); } catch {} });
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  document.querySelectorAll('.elementor-invisible').forEach(e => e.classList.remove('elementor-invisible'));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 800));
  return document.fonts.status;
})()