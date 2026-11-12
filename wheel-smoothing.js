(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  let targetScroll = window.scrollY;
  let animationFrame = null;
  let previousFrameTime = 0;

  const stopSmoothing = () => {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    previousFrameTime = 0;
    targetScroll = window.scrollY;
    root.classList.remove("is-wheel-smoothing");
  };

  const animateScroll = (time) => {
    const elapsed = previousFrameTime ? Math.min(time - previousFrameTime, 48) : 16;
    previousFrameTime = time;
    targetScroll = Math.min(targetScroll, maxScroll());

    const currentScroll = window.scrollY;
    const easing = 1 - Math.exp(-elapsed / 190);
    const nextScroll = currentScroll + (targetScroll - currentScroll) * easing;
    window.scrollTo(0, nextScroll);

    if (Math.abs(targetScroll - currentScroll) > 5) {
      animationFrame = requestAnimationFrame(animateScroll);
    } else {
      window.scrollTo(0, targetScroll);
      stopSmoothing();
    }
  };

  const onWheel = (event) => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      Math.abs(event.deltaY) < 0.5 ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ) {
      return;
    }

    const target = event.target;
    if (target instanceof Element) {
      if (target.closest("input, textarea, select, [contenteditable='true'], [data-native-scroll]")) return;

      for (let element = target.parentElement; element && element !== document.body; element = element.parentElement) {
        const style = window.getComputedStyle(element);
        if (
          element.scrollHeight > element.clientHeight &&
          (style.overflowY === "auto" || style.overflowY === "scroll")
        ) {
          return;
        }
      }
    }

    let delta = event.deltaY;
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 40;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight * 0.85;

    if (animationFrame === null) targetScroll = window.scrollY;
    const nextTarget = Math.max(0, Math.min(maxScroll(), targetScroll + delta * 0.82));
    if (animationFrame === null && nextTarget === window.scrollY) return;

    event.preventDefault();
    targetScroll = nextTarget;
    root.classList.add("is-wheel-smoothing");
    if (animationFrame === null) animationFrame = requestAnimationFrame(animateScroll);
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      stopSmoothing();
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a[href^='#']")) {
      stopSmoothing();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopSmoothing();
  });
})();
