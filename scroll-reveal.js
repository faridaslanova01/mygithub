(() => {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  const targets = document.querySelectorAll(
    ".work-preview, .preview-item, .star-arcade, .next-step, .about-story, .credential-block, .about-cta-inner, .project-card, .project-arcade, .reaction-quest, .project-end"
  );
  if (!targets.length) return;

  document.querySelectorAll(".preview-grid, .credentials-grid, .project-stack").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 60}ms`);
    });
  });

  targets.forEach((target) => target.setAttribute("data-reveal", ""));
  document.documentElement.classList.add("has-scroll-reveal");

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  targets.forEach((target) => observer.observe(target));
})();
