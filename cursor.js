(() => {
  if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    return;
  }

  const cursor = document.createElement("span");
  cursor.className = "cursor-orbit";
  cursor.setAttribute("aria-hidden", "true");
  document.documentElement.classList.add("has-custom-cursor");
  document.body.append(cursor);

  let targetX = -100;
  let targetY = -100;
  let currentX = targetX;
  let currentY = targetY;
  let animationFrame = null;

  const animate = () => {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = null;
    }
  };

  document.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.classList.add("is-visible");
    if (animationFrame === null) animationFrame = requestAnimationFrame(animate);
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const target = event.target;
    cursor.classList.toggle("is-hovering", target instanceof Element && Boolean(target.closest("a, button")));
  });

  document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursor.classList.remove("is-visible", "is-hovering", "is-pressed");
  });
})();
