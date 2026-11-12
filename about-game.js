(() => {
  const canvas = document.querySelector("#flight-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const width = 600;
  const height = 360;
  const gateWidth = 52;
  const gateGap = 196;
  const planeRadius = 11;
  const scoreOutput = document.querySelector("#flight-score");
  const overlay = document.querySelector("#flight-overlay");
  const message = document.querySelector("#flight-message");
  const submessage = document.querySelector("#flight-submessage");
  const startButton = document.querySelector("#flight-start");
  const flapButton = document.querySelector("#flight-flap");

  let palette;
  let state = "ready";
  let score = 0;
  let bird = { x: 122, y: height / 2, velocity: 0 };
  let gates = [];
  let previousFrame = 0;
  let frameRequest = 0;

  function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    palette = {
      background: styles.getPropertyValue("--band").trim(),
      surface: styles.getPropertyValue("--white").trim(),
      line: styles.getPropertyValue("--line").trim(),
      brand: styles.getPropertyValue("--brand").trim(),
      accent: styles.getPropertyValue("--accent").trim(),
      ink: styles.getPropertyValue("--ink").trim()
    };
  }

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function makeGate(x) {
    return {
      x,
      center: 160 + Math.random() * 40,
      passed: false
    };
  }

  function drawGate(gate) {
    const gapTop = gate.center - gateGap / 2;
    const gapBottom = gate.center + gateGap / 2;
    const capWidth = gateWidth + 10;

    context.fillStyle = palette.brand;
    context.fillRect(gate.x, 0, gateWidth, gapTop);
    context.fillRect(gate.x, gapBottom, gateWidth, height - gapBottom);

    context.fillStyle = palette.accent;
    context.fillRect(gate.x - 5, gapTop - 9, capWidth, 9);
    context.fillRect(gate.x - 5, gapBottom, capWidth, 9);
  }

  function drawPlane() {
    context.save();
    context.translate(bird.x, bird.y);
    context.rotate(Math.max(-0.45, Math.min(0.55, bird.velocity / 650)));
    context.fillStyle = palette.brand;
    context.beginPath();
    context.moveTo(-15, -7);
    context.lineTo(17, 0);
    context.lineTo(-15, 7);
    context.lineTo(-7, 0);
    context.closePath();
    context.fill();

    context.strokeStyle = palette.surface;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(-7, 0);
    context.lineTo(10, 0);
    context.stroke();
    context.restore();
  }

  function draw() {
    if (!palette) return;

    context.clearRect(0, 0, width, height);
    context.fillStyle = palette.background;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = palette.line;
    context.globalAlpha = 0.42;
    context.lineWidth = 1;
    for (let x = 40; x < width; x += 50) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 40; y < height; y += 50) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.globalAlpha = 1;

    context.fillStyle = palette.surface;
    context.globalAlpha = 0.6;
    context.beginPath();
    context.arc(474, 72, 22, 0, Math.PI * 2);
    context.arc(500, 72, 15, 0, Math.PI * 2);
    context.arc(522, 72, 19, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    gates.forEach(drawGate);
    drawPlane();
  }

  function updateScore(nextScore) {
    score = nextScore;
    scoreOutput.value = String(score);
    scoreOutput.textContent = String(score);
  }

  function flap() {
    if (state === "playing") bird.velocity = -250;
  }

  function endGame() {
    state = "over";
    flapButton.disabled = true;
    startButton.textContent = "Play again";
    message.textContent = "Flight complete";
    submessage.textContent = `You passed ${score} ${score === 1 ? "gate" : "gates"}. Ready for another go?`;
    overlay.hidden = false;
  }

  function update(delta) {
    bird.velocity = Math.min(bird.velocity + 720 * delta, 360);
    bird.y += bird.velocity * delta;

    const speed = 160 + Math.min(score * 6, 54);
    gates.forEach((gate) => {
      gate.x -= speed * delta;
      if (!gate.passed && gate.x + gateWidth < bird.x) {
        gate.passed = true;
        updateScore(score + 1);
        document.dispatchEvent(new CustomEvent("portfolio:xp", { detail: { amount: 5 } }));
      }
    });

    gates = gates.filter((gate) => gate.x + gateWidth > -12);
    if (gates[gates.length - 1].x < width - 260) {
      gates.push(makeGate(gates[gates.length - 1].x + 270));
    }

    if (bird.y < planeRadius || bird.y > height - planeRadius) {
      endGame();
      return;
    }

    const collision = gates.some((gate) => {
      const gapTop = gate.center - gateGap / 2;
      const gapBottom = gate.center + gateGap / 2;
      const overlapsGate = bird.x + planeRadius > gate.x - 5 && bird.x - planeRadius < gate.x + gateWidth + 5;
      return overlapsGate && (bird.y - planeRadius < gapTop || bird.y + planeRadius > gapBottom);
    });

    if (collision) endGame();
  }

  function animate(timestamp) {
    frameRequest = 0;
    if (state !== "playing") return;

    const delta = previousFrame
      ? Math.min((timestamp - previousFrame) / 1000, 0.04)
      : 0;
    previousFrame = timestamp;
    update(delta);
    draw();

    if (state === "playing") frameRequest = window.requestAnimationFrame(animate);
  }

  function startGame() {
    window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    state = "playing";
    previousFrame = 0;
    bird = { x: 122, y: height / 2, velocity: -210 };
    gates = [makeGate(width + 35)];
    updateScore(0);
    startButton.textContent = "Restart";
    flapButton.disabled = false;
    overlay.hidden = true;
    draw();
    frameRequest = window.requestAnimationFrame(animate);
  }

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    if (state === "playing") flap();
    else startGame();
  });

  canvas.addEventListener("keydown", (event) => {
    if ((event.code !== "Space" && event.key !== "ArrowUp") || event.repeat) return;
    event.preventDefault();
    if (state === "playing") flap();
    else startGame();
  });

  startButton.addEventListener("click", startGame);
  flapButton.addEventListener("click", flap);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) previousFrame = 0;
  });
  window.addEventListener("resize", resizeCanvas);
  new MutationObserver(() => {
    readPalette();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readPalette();
  gates = [makeGate(420)];
  resizeCanvas();
})();
