(() => {
  if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    return;
  }

  const ring = document.createElement("span");
  ring.className = "cursor-orbit";
  const dot = document.createElement("span");
  dot.className = "cursor-dot";
  ring.setAttribute("aria-hidden", "true");
  dot.setAttribute("aria-hidden", "true");
  document.documentElement.classList.add("has-custom-cursor");
  document.body.append(ring, dot);

  let targetX = -100;
  let targetY = -100;
  let ringX = targetX;
  let ringY = targetY;
  let dotX = targetX;
  let dotY = targetY;
  let animationFrame = null;

  const animate = () => {
    ringX += (targetX - ringX) * 0.14;
    ringY += (targetY - ringY) * 0.14;
    dotX += (targetX - dotX) * 0.38;
    dotY += (targetY - dotY) * 0.38;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(targetX - ringX) > 0.1 || Math.abs(targetY - ringY) > 0.1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = null;
    }
  };

  document.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    ring.classList.add("is-visible");
    dot.classList.add("is-visible");
    if (animationFrame === null) animationFrame = requestAnimationFrame(animate);
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const target = event.target;
    const hovering = target instanceof Element && Boolean(target.closest("a, button"));
    ring.classList.toggle("is-hovering", hovering);
    dot.classList.toggle("is-hovering", hovering);
  });

  document.addEventListener("pointerdown", () => {
    ring.classList.add("is-pressed");
    dot.classList.add("is-pressed");
  });
  document.addEventListener("pointerup", () => {
    ring.classList.remove("is-pressed");
    dot.classList.remove("is-pressed");
  });
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      ring.classList.remove("is-visible", "is-hovering", "is-pressed");
      dot.classList.remove("is-visible", "is-hovering", "is-pressed");
    }
  });
})();
