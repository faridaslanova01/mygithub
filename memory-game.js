(() => {
  const grid = document.querySelector("#memory-grid");
  if (!grid) return;

  const turnsOutput = document.querySelector("#memory-turns");
  const pairsOutput = document.querySelector("#memory-pairs");
  const buddy = document.querySelector("#memory-buddy");
  const buddyMessage = document.querySelector("#memory-buddy-message");
  const resetButton = document.querySelector("#memory-reset");
  const pairs = [
    { id: "markup", label: "markup", symbol: "</>" },
    { id: "idea", label: "idea", symbol: "✦" },
    { id: "braces", label: "braces", symbol: "{}" },
    { id: "zero-one", label: "zero one", symbol: "01" }
  ];

  let openTiles = [];
  let turns = 0;
  let matchedPairs = 0;
  let isLocked = false;
  let hideTimer = 0;

  function setOutput(output, value) {
    output.value = String(value);
    output.textContent = String(value);
  }

  function shuffle(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
  }

  function makeTile(pair, index) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "memory-tile";
    tile.dataset.pair = pair.id;
    tile.dataset.label = pair.label;
    tile.setAttribute("aria-label", `Face-down tile ${index + 1}`);
    tile.setAttribute("aria-pressed", "false");

    const inner = document.createElement("span");
    inner.className = "memory-tile-inner";
    inner.setAttribute("aria-hidden", "true");

    const back = document.createElement("span");
    back.className = "memory-face memory-face-back";
    back.textContent = "✳";

    const front = document.createElement("span");
    front.className = "memory-face memory-face-front";
    front.textContent = pair.symbol;

    inner.append(back, front);
    tile.append(inner);
    tile.addEventListener("click", () => revealTile(tile));
    return tile;
  }

  function updateStats() {
    setOutput(turnsOutput, turns);
    setOutput(pairsOutput, `${matchedPairs} / ${pairs.length}`);
  }

  function revealTile(tile) {
    if (isLocked || tile.classList.contains("is-open") || tile.classList.contains("is-matched")) return;

    tile.classList.add("is-open");
    tile.setAttribute("aria-pressed", "true");
    tile.setAttribute("aria-label", `${tile.dataset.label} symbol`);
    openTiles.push(tile);

    if (openTiles.length < 2) return;

    turns += 1;
    updateStats();
    const [first, second] = openTiles;

    if (first.dataset.pair === second.dataset.pair) {
      first.classList.add("is-matched");
      second.classList.add("is-matched");
      first.setAttribute("aria-label", `Matched ${first.dataset.label} pair`);
      second.setAttribute("aria-label", `Matched ${second.dataset.label} pair`);
      matchedPairs += 1;
      openTiles = [];
      updateStats();
      document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 5 } }));

      if (matchedPairs === pairs.length) {
        buddyMessage.textContent = `All pairs found in ${turns} turns. Nice work!`;
        buddy.classList.add("is-celebrating");
      } else {
        buddyMessage.textContent = "A perfect match. Keep going!";
      }
      return;
    }

    isLocked = true;
    buddyMessage.textContent = "Not quite. The cards will turn back in a moment.";
    hideTimer = window.setTimeout(() => {
      openTiles.forEach((openTile) => {
        openTile.classList.remove("is-open");
        openTile.setAttribute("aria-pressed", "false");
        openTile.setAttribute("aria-label", `Face-down tile ${Array.from(grid.children).indexOf(openTile) + 1}`);
      });
      openTiles = [];
      isLocked = false;
      hideTimer = 0;
    }, 750);
  }

  function restart() {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
    openTiles = [];
    turns = 0;
    matchedPairs = 0;
    isLocked = false;
    buddy.classList.remove("is-celebrating");
    buddyMessage.textContent = "Need a hint? Bits is on the case.";
    grid.replaceChildren(...shuffle([...pairs, ...pairs]).map(makeTile));
    updateStats();
  }

  buddy.addEventListener("click", () => {
    const unmatched = Array.from(grid.children).filter((tile) => !tile.classList.contains("is-matched"));
    const availableIds = Array.from(new Set(unmatched.map((tile) => tile.dataset.pair)));
    if (!availableIds.length) {
      buddyMessage.textContent = "You found every pair. Bits is very impressed.";
      return;
    }

    const hintId = availableIds[Math.floor(Math.random() * availableIds.length)];
    const hint = pairs.find((pair) => pair.id === hintId);
    buddyMessage.textContent = `Hint: one of the pairs is ${hint.symbol}.`;
    buddy.classList.add("is-talking");
    window.setTimeout(() => buddy.classList.remove("is-talking"), 420);
  });

  resetButton.addEventListener("click", restart);
  restart();
})();
