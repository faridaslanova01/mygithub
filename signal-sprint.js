(() => {
  const game = document.querySelector("#reaction-quest");
  if (!game) return;

  const button = document.querySelector("#reaction-trigger");
  const buttonLabel = document.querySelector("#reaction-button-label");
  const message = document.querySelector("#reaction-help");
  const lastOutput = document.querySelector("#reaction-last");
  const bestOutput = document.querySelector("#reaction-best");
  const storageKey = "farida-signal-sprint-best";

  let state = "ready";
  let signalTimer = 0;
  let signalTime = 0;
  let best = null;

  try {
    const savedBest = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(savedBest) && savedBest > 0) best = Math.floor(savedBest);
  } catch (error) {
    console.warn("Could not read the Signal Sprint personal best.", error);
  }

  function setOutput(output, value) {
    output.value = value;
    output.textContent = value;
  }

  function beginRound() {
    state = "waiting";
    game.classList.remove("is-ready", "is-early");
    game.classList.add("is-waiting");
    buttonLabel.textContent = "Wait for green...";
    button.setAttribute("aria-label", "Wait for the signal before tapping");
    message.textContent = "Stay ready. Tap only when the signal lights up.";
    signalTimer = window.setTimeout(() => {
      state = "go";
      signalTime = performance.now();
      game.classList.remove("is-waiting");
      game.classList.add("is-ready");
      buttonLabel.textContent = "TAP!";
      button.setAttribute("aria-label", "Tap now");
      message.textContent = "Now! Tap the signal.";
      signalTimer = 0;
    }, 1000 + Math.random() * 1800);
  }

  function handleTap() {
    if (state === "waiting") {
      window.clearTimeout(signalTimer);
      signalTimer = 0;
      state = "early";
      game.classList.remove("is-waiting");
      game.classList.add("is-early");
      buttonLabel.textContent = "Too early — try again";
      button.setAttribute("aria-label", "Too early. Tap to try again");
      message.textContent = "Jumped the gun. No XP this time; tap to retry.";
      return;
    }

    if (state === "go") {
      const reaction = Math.max(1, Math.round(performance.now() - signalTime));
      state = "result";
      game.classList.remove("is-ready");
      buttonLabel.textContent = `${reaction} ms — play again`;
      button.setAttribute("aria-label", `Reaction time ${reaction} milliseconds. Tap to play again`);
      message.textContent = "Nice reaction! +1 XP. Tap to go again.";
      setOutput(lastOutput, `${reaction} ms`);
      document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 1 } }));

      if (best === null || reaction < best) {
        best = reaction;
        setOutput(bestOutput, `${best} ms`);
        try {
          window.localStorage.setItem(storageKey, String(best));
        } catch (error) {
          console.warn("Could not save the Signal Sprint personal best.", error);
        }
      }
      return;
    }

    beginRound();
  }

  setOutput(bestOutput, best === null ? "—" : `${best} ms`);
  button.addEventListener("click", handleTap);
})();
