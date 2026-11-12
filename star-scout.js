(() => {
  const game = document.querySelector("#star-game");
  if (!game) return;

  const target = document.querySelector("#star-target");
  const scoreOutput = document.querySelector("#star-score");
  const timeOutput = document.querySelector("#star-time");
  const bestOutput = document.querySelector("#star-best");
  const startButton = document.querySelector("#star-start");
  const message = document.querySelector("#star-message");
  const submessage = document.querySelector("#star-submessage");
  const storageKey = "farida-star-scout-best";
  const roundDuration = 15000;

  let state = "ready";
  let score = 0;
  let best = 0;
  let endTime = 0;
  let frameRequest = 0;

  try {
    const savedBest = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(savedBest) && savedBest > 0) best = Math.floor(savedBest);
  } catch (error) {
    console.warn("Could not read the Star Scout personal best.", error);
  }
  bestOutput.value = String(best);
  bestOutput.textContent = String(best);

  function setScore(nextScore) {
    score = nextScore;
    scoreOutput.value = String(score);
    scoreOutput.textContent = String(score);
  }

  function moveTarget() {
    target.style.left = `${15 + Math.random() * 70}%`;
    target.style.top = `${20 + Math.random() * 60}%`;
  }

  function finishRound() {
    state = "over";
    game.classList.remove("is-active");
    game.classList.add("is-over");
    target.disabled = true;
    timeOutput.value = "0.0s";
    timeOutput.textContent = "0.0s";
    message.textContent = "Run complete.";
    const isNewBest = score > best;
    submessage.textContent = `You caught ${score} ${score === 1 ? "star" : "stars"}. ${isNewBest ? "New personal best!" : "Ready for another run?"}`;
    startButton.textContent = "Run again";

    if (isNewBest) {
      best = score;
      bestOutput.value = String(best);
      bestOutput.textContent = String(best);
      try {
        window.localStorage.setItem(storageKey, String(best));
      } catch (error) {
        console.warn("Could not save the Star Scout personal best.", error);
      }
    }
  }

  function tick() {
    if (state !== "playing") return;
    const remaining = Math.max(0, endTime - performance.now());
    timeOutput.value = `${(remaining / 1000).toFixed(1)}s`;
    timeOutput.textContent = `${(remaining / 1000).toFixed(1)}s`;
    if (remaining === 0) {
      finishRound();
      return;
    }
    frameRequest = window.requestAnimationFrame(tick);
  }

  function startRound() {
    window.cancelAnimationFrame(frameRequest);
    state = "playing";
    setScore(0);
    endTime = performance.now() + roundDuration;
    timeOutput.value = "15.0s";
    timeOutput.textContent = "15.0s";
    message.textContent = "Signal found!";
    submessage.textContent = "Keep collecting stars until the timer runs out.";
    game.classList.remove("is-over");
    game.classList.add("is-active");
    target.disabled = false;
    startButton.textContent = "Restart round";
    moveTarget();
    frameRequest = window.requestAnimationFrame(tick);
  }

  target.addEventListener("click", () => {
    if (state !== "playing") return;
    setScore(score + 1);
    moveTarget();
    document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 1 } }));
  });

  startButton.addEventListener("click", startRound);
})();
