(() => {
  const buddy = document.querySelector("#idea-buddy");
  const message = document.querySelector("#idea-buddy-message");
  if (!buddy || !message) return;

  const nudges = [
    "Small experiments can lead to surprisingly good ideas.",
    "Try one more version. That is how the interesting bits appear.",
    "A curious question is a pretty great place to start."
  ];
  let nextNudge = 0;

  function closeBuddy() {
    buddy.setAttribute("aria-expanded", "false");
    message.hidden = true;
  }

  buddy.addEventListener("click", () => {
    if (buddy.getAttribute("aria-expanded") === "true") {
      closeBuddy();
      return;
    }

    message.textContent = nudges[nextNudge];
    nextNudge = (nextNudge + 1) % nudges.length;
    buddy.setAttribute("aria-expanded", "true");
    message.hidden = false;
  });

  document.addEventListener("pointerdown", (event) => {
    if (!buddy.contains(event.target) && !message.contains(event.target)) closeBuddy();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || message.hidden) return;
    closeBuddy();
    buddy.focus();
  });
})();
