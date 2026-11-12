(() => {
  const game = document.querySelector("#sequence-quest");
  if (!game) return;

  const padGroup = document.querySelector("#sequence-pads");
  const pads = Array.from(padGroup.querySelectorAll(".sequence-pad"));
  const status = document.querySelector("#sequence-status");
  const roundOutput = document.querySelector("#sequence-round");
  const bestOutput = document.querySelector("#sequence-best");
  const startButton = document.querySelector("#sequence-start");
  const storageKey = "farida-sequence-best";

  let state = "ready";
  let sequence = [];
  let inputIndex = 0;
  let completedRounds = 0;
  let best = 0;
  let timers = [];

  try {
    const savedBest = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(savedBest) && savedBest > 0) best = Math.floor(savedBest);
  } catch (error) {
    console.warn("Could not read the Echo Sequence personal best.", error);
  }
  bestOutput.value = String(best);
  bestOutput.textContent = String(best);

  function setOutput(output, value) {
    output.value = String(value);
    output.textContent = String(value);
  }

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
    pads.forEach((pad) => pad.classList.remove("is-lit"));
  }

  function setPadsDisabled(disabled) {
    pads.forEach((pad) => {
      pad.disabled = disabled;
    });
  }

  function playSequence() {
    clearTimers();
    state = "showing";
    inputIndex = 0;
    setPadsDisabled(true);
    padGroup.classList.add("is-showing");
    status.textContent = `Watch the ${sequence.length}-step pattern.`;

    sequence.forEach((padName, index) => {
      const start = window.setTimeout(() => {
        const pad = pads.find((item) => item.dataset.pad === padName);
        if (!pad || state !== "showing") return;
        pad.classList.add("is-lit");
        timers.push(window.setTimeout(() => pad.classList.remove("is-lit"), 330));
      }, 220 + index * 650);
      timers.push(start);
    });

    timers.push(window.setTimeout(() => {
      if (state !== "showing") return;
      state = "input";
      padGroup.classList.remove("is-showing");
      setPadsDisabled(false);
      pads[0].focus({ preventScroll: true });
      status.textContent = "Your turn. Repeat the pattern.";
    }, 220 + sequence.length * 650));
  }

  function endGame() {
    state = "over";
    clearTimers();
    padGroup.classList.remove("is-showing");
    padGroup.classList.add("is-over");
    setPadsDisabled(true);
    game.classList.add("is-over");
    const cleared = sequence.length - 1;
    status.textContent = `Pattern missed. You cleared ${cleared} ${cleared === 1 ? "round" : "rounds"}. Try again?`;
    startButton.textContent = "Play again";
    startButton.focus({ preventScroll: true });
  }

  function startGame() {
    clearTimers();
    state = "showing";
    sequence = [pads[Math.floor(Math.random() * pads.length)].dataset.pad];
    completedRounds = 0;
    setOutput(roundOutput, sequence.length);
    game.classList.remove("is-over");
    padGroup.classList.remove("is-over");
    startButton.textContent = "Restart sequence";
    playSequence();
  }

  function handlePad(padName) {
    if (state !== "input") return;
    if (sequence[inputIndex] !== padName) {
      endGame();
      return;
    }

    inputIndex += 1;
    if (inputIndex < sequence.length) {
      status.textContent = `${sequence.length - inputIndex} ${sequence.length - inputIndex === 1 ? "pad" : "pads"} left.`;
      return;
    }

    completedRounds += 1;
    setOutput(roundOutput, sequence.length);
    status.textContent = `Round ${sequence.length} cleared! +2 XP.`;
    document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 2 } }));

    if (completedRounds > best) {
      best = completedRounds;
      setOutput(bestOutput, best);
      try {
        window.localStorage.setItem(storageKey, String(best));
      } catch (error) {
        console.warn("Could not save the Echo Sequence personal best.", error);
      }
    }

    sequence.push(pads[Math.floor(Math.random() * pads.length)].dataset.pad);
    state = "between-rounds";
    setPadsDisabled(true);
    timers.push(window.setTimeout(playSequence, 700));
  }

  pads.forEach((pad) => {
    pad.addEventListener("click", () => handlePad(pad.dataset.pad));
  });
  startButton.addEventListener("click", startGame);
  setOutput(roundOutput, 0);
})();
