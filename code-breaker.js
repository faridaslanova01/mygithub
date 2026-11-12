(() => {
  const game = document.querySelector("#codebreaker-quest");
  if (!game) return;

  const symbols = [
    { id: "triangle", mark: "▲" },
    { id: "circle", mark: "●" },
    { id: "square", mark: "■" },
    { id: "diamond", mark: "◆" }
  ];
  const keypad = document.querySelector("#codebreaker-keypad");
  const symbolButtons = Array.from(keypad.querySelectorAll(".code-symbol"));
  const slots = Array.from(document.querySelectorAll(".codebreaker-slot"));
  const attemptsOutput = document.querySelector("#codebreaker-attempts");
  const winsOutput = document.querySelector("#codebreaker-wins");
  const history = document.querySelector("#codebreaker-history");
  const message = document.querySelector("#codebreaker-message");
  const submitButton = document.querySelector("#codebreaker-submit");
  const undoButton = document.querySelector("#codebreaker-undo");
  const resetButton = document.querySelector("#codebreaker-reset");
  const maxAttempts = 6;
  const codeLength = 3;
  const winsStorageKey = "farida-codebreaker-wins";

  let secret = [];
  let guess = [];
  let attempts = 0;
  let wins = 0;
  let state = "playing";

  try {
    const savedWins = Number(window.localStorage.getItem(winsStorageKey));
    if (Number.isFinite(savedWins) && savedWins > 0) wins = Math.min(Math.floor(savedWins), 999999999);
  } catch (error) {
    console.warn("Could not read the Codebreaker win count.", error);
  }

  function setOutput(output, value) {
    output.value = String(value);
    output.textContent = String(value);
  }

  function shuffledSymbols() {
    const shuffled = [...symbols];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function updateGuess() {
    slots.forEach((slot, index) => {
      const symbol = symbols.find((item) => item.id === guess[index]);
      slot.textContent = symbol ? symbol.mark : "?";
      slot.setAttribute("aria-label", `Slot ${index + 1}: ${symbol ? symbol.id : "empty"}`);
    });

    symbolButtons.forEach((button) => {
      button.disabled = state !== "playing" || guess.length === codeLength;
      button.setAttribute("aria-pressed", String(guess.includes(button.dataset.symbol)));
      button.classList.toggle("is-selected", guess.includes(button.dataset.symbol));
    });
    submitButton.disabled = state !== "playing" || guess.length !== codeLength;
    undoButton.disabled = state !== "playing" || guess.length === 0;
  }

  function addGuessRow(feedback) {
    const row = document.createElement("li");
    const marks = guess
      .map((id) => symbols.find((symbol) => symbol.id === id).mark)
      .join(" ");
    row.textContent = `Try ${attempts}: ${marks} — ${feedback}`;
    history.prepend(row);
  }

  function evaluateGuess() {
    const exact = guess.filter((symbol, index) => symbol === secret[index]).length;
    const present = guess.filter((symbol) => secret.includes(symbol)).length - exact;
    return { exact, present };
  }

  function submitGuess() {
    if (state !== "playing" || guess.length !== codeLength) return;

    attempts += 1;
    setOutput(attemptsOutput, `${attempts} / ${maxAttempts}`);
    const result = evaluateGuess();
    const feedback = `${result.exact} exact · ${result.present} elsewhere`;
    addGuessRow(feedback);

    if (result.exact === codeLength) {
      state = "won";
      game.classList.add("is-cracked");
      wins += 1;
      setOutput(winsOutput, wins);
      message.textContent = "Vault opened! +10 XP. Start a new code when you’re ready.";
      document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 10 } }));
      try {
        window.localStorage.setItem(winsStorageKey, String(wins));
      } catch (error) {
        console.warn("Could not save the Codebreaker win count.", error);
      }
    } else if (attempts === maxAttempts) {
      state = "lost";
      game.classList.add("is-locked");
      const answer = secret.map((id) => symbols.find((symbol) => symbol.id === id).mark).join(" ");
      message.textContent = `The vault stays locked. The code was ${answer}. Start a new code to try again.`;
    } else {
      message.textContent = `${feedback}. Try another combination.`;
    }

    guess = [];
    updateGuess();
    if (state !== "playing") resetButton.focus({ preventScroll: true });
  }

  function startNewCode() {
    secret = shuffledSymbols().slice(0, codeLength).map((symbol) => symbol.id);
    guess = [];
    attempts = 0;
    state = "playing";
    game.classList.remove("is-cracked", "is-locked");
    history.replaceChildren();
    setOutput(attemptsOutput, `0 / ${maxAttempts}`);
    message.textContent = "Choose three different symbols to build your guess.";
    updateGuess();
  }

  symbolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state !== "playing" || guess.length >= codeLength || guess.includes(button.dataset.symbol)) return;
      guess.push(button.dataset.symbol);
      updateGuess();
      if (guess.length === codeLength) submitButton.focus({ preventScroll: true });
    });
  });

  submitButton.addEventListener("click", submitGuess);
  undoButton.addEventListener("click", () => {
    if (state !== "playing" || guess.length === 0) return;
    guess.pop();
    updateGuess();
  });
  resetButton.addEventListener("click", startNewCode);

  setOutput(winsOutput, wins);
  startNewCode();
})();
