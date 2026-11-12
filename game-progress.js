(() => {
  const levelOutput = document.querySelector("#arcade-level");
  const xpOutput = document.querySelector("#arcade-xp");
  const progressBar = document.querySelector(".game-progress-track");
  const progressFill = document.querySelector("#arcade-progress");
  const announcement = document.querySelector("#arcade-level-announcement");
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  if (!levelOutput || !xpOutput || !progressBar || !progressFill || !announcement) return;

  const storageKey = "farida-arcade-xp";
  let totalXp = 0;
  let currentLevel = 1;

  try {
    const savedXp = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(savedXp) && savedXp > 0) totalXp = Math.min(Math.floor(savedXp), 999999999);
  } catch (error) {
    console.warn("Could not read saved arcade progress.", error);
  }

  function renderProgress(announceLevelUp = false) {
    const nextLevel = Math.floor(totalXp / 100) + 1;
    const progress = totalXp % 100;
    levelOutput.value = String(nextLevel);
    levelOutput.textContent = String(nextLevel);
    xpOutput.value = String(totalXp);
    xpOutput.textContent = String(totalXp);
    progressBar.setAttribute("aria-valuenow", String(progress));
    progressFill.style.width = `${progress}%`;

    if (announceLevelUp && nextLevel > currentLevel) {
      announcement.textContent = `Level up! You reached level ${nextLevel}.`;
    }
    currentLevel = nextLevel;
  }

  document.addEventListener("portfolio:xp", (event) => {
    const amount = Number(event.detail && event.detail.amount);
    if (!Number.isFinite(amount) || amount < 1) return;

    totalXp = Math.min(totalXp + Math.floor(amount), 999999999);
    renderProgress(true);
    try {
      window.localStorage.setItem(storageKey, String(totalXp));
    } catch (error) {
      console.warn("Could not save arcade progress.", error);
    }
  });

  renderProgress();
})();
