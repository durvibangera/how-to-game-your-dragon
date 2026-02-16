/**
 * HTML/CSS overlay UI for the roller coaster experience.
 * Renders start screen, month titles, and final message.
 * All UI is DOM-based overlaid on the Three.js canvas.
 */
export class UIOverlay {
  constructor(container) {
    this.container = container;
    this.overlay = document.createElement("div");
    this.overlay.id = "ui-overlay";
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 2000;
      font-family: 'Georgia', 'Times New Roman', serif;
    `;
    document.body.appendChild(this.overlay);

    this._injectStyles();
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400&display=swap');

      #ui-overlay * {
        box-sizing: border-box;
      }

      .ui-start-screen {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: radial-gradient(ellipse at center, rgba(40,10,30,0.95) 0%, rgba(10,0,15,0.98) 100%);
        pointer-events: all; z-index: 200;
        animation: fadeIn 1s ease;
      }

      .ui-start-screen h1 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(2rem, 5vw, 3.5rem);
        color: #ffd6e0;
        margin-bottom: 0.5em;
        text-align: center;
        text-shadow: 0 0 30px rgba(255,180,200,0.4);
        letter-spacing: 0.05em;
      }

      .ui-start-screen p {
        font-family: 'Lato', sans-serif;
        font-size: clamp(0.9rem, 2vw, 1.1rem);
        color: rgba(255,200,220,0.7);
        margin-bottom: 2em;
        text-align: center;
        font-weight: 300;
      }

      .ui-start-btn {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1rem, 2.5vw, 1.3rem);
        padding: 16px 48px;
        border: 1px solid rgba(255,180,200,0.4);
        background: rgba(255,100,150,0.15);
        color: #ffd6e0;
        border-radius: 50px;
        cursor: pointer;
        pointer-events: all;
        transition: all 0.3s ease;
        letter-spacing: 0.1em;
        backdrop-filter: blur(10px);
      }

      .ui-start-btn:hover {
        background: rgba(255,100,150,0.3);
        border-color: rgba(255,180,200,0.7);
        transform: scale(1.05);
        box-shadow: 0 0 30px rgba(255,130,170,0.3);
      }

      .ui-month-title {
        position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        color: #fff;
        text-shadow: 0 0 20px rgba(255,255,255,0.3);
        opacity: 0;
        animation: monthTitleAnim 4s ease forwards;
        pointer-events: none;
        text-align: center;
        white-space: nowrap;
      }

      .ui-finale {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: radial-gradient(ellipse at center, rgba(30,15,0,0.85) 0%, rgba(0,0,0,0.9) 100%);
        pointer-events: none; z-index: 200;
        animation: fadeIn 3s ease;
      }

      .ui-finale h1 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(2rem, 6vw, 4rem);
        color: #ffd700;
        text-shadow: 0 0 40px rgba(255,215,0,0.5);
        margin-bottom: 0.3em;
        animation: gentlePulse 2s ease-in-out infinite;
      }

      .ui-finale p {
        font-family: 'Lato', sans-serif;
        font-size: clamp(1rem, 3vw, 1.5rem);
        color: rgba(255,240,200,0.8);
        font-weight: 300;
        font-style: italic;
        letter-spacing: 0.1em;
      }

      .ui-progress {
        position: fixed; bottom: 20px; left: 50%;
        transform: translateX(-50%);
        display: flex; gap: 8px;
        pointer-events: none;
        z-index: 150;
      }

      .ui-progress-dot {
        width: 10px; height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        transition: all 0.5s ease;
      }

      .ui-progress-dot.active {
        background: rgba(255,180,200,0.8);
        box-shadow: 0 0 10px rgba(255,180,200,0.5);
      }

      .ui-progress-dot.completed {
        background: rgba(180,255,180,0.6);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes monthTitleAnim {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        75% { opacity: 1; }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }

      @keyframes gentlePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);
    this._style = style;
  }

  showStartScreen(onStart) {
    const screen = document.createElement("div");
    screen.className = "ui-start-screen";
    screen.innerHTML = `
      <h1>How To Game Your Dragon</h1>
      <p>Soar through the skies of Berk on the back of a Night Fury</p>
      <button class="ui-start-btn">Take Flight</button>
    `;

    const btn = screen.querySelector(".ui-start-btn");
    btn.addEventListener("click", () => {
      screen.style.transition = "opacity 1.5s ease";
      screen.style.opacity = "0";
      setTimeout(() => {
        screen.remove();
        this._createProgressBar();
        onStart();
      }, 1500);
    });

    this.overlay.appendChild(screen);
  }

  _createProgressBar() {
    const bar = document.createElement("div");
    bar.className = "ui-progress";
    const dotTitles = ["Berk Village", "The Cove", "Training Arena", "Cloud Kingdom", "Volcanic Nest", "The Lair"];
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement("div");
      dot.className = "ui-progress-dot";
      if (i === 0) dot.classList.add("active");
      dot.title = dotTitles[i];
      bar.appendChild(dot);
    }
    this.overlay.appendChild(bar);
    this.progressBar = bar;
  }

  _updateProgressBar(monthIndex) {
    if (!this.progressBar) return;
    const dots = this.progressBar.querySelectorAll(".ui-progress-dot");
    dots.forEach((dot, i) => {
      dot.classList.remove("active");
      if (i < monthIndex) dot.classList.add("completed");
      if (i === monthIndex) dot.classList.add("active");
    });
  }

  showMonthTitle(monthIndex) {
    this._updateProgressBar(monthIndex);

    const titles = [
      "Berk Village",
      "The Cove",
      "Dragon Training Arena",
      "Cloud Kingdom",
      "Volcanic Nest",
      "The Dragon's Lair",
    ];

    // Remove previous title
    const prev = this.overlay.querySelector(".ui-month-title");
    if (prev) prev.remove();

    const title = document.createElement("div");
    title.className = "ui-month-title";
    title.textContent = titles[monthIndex] || "";
    this.overlay.appendChild(title);

    setTimeout(() => title.remove(), 4500);
  }

  showFinaleMessage() {
    const finale = document.createElement("div");
    finale.className = "ui-finale";
    finale.innerHTML = `
      <h1>What a ride!</h1>
      <p>Thanks for playing. ♾️</p>
    `;
    this.overlay.appendChild(finale);

    // Remove progress bar
    if (this.progressBar) {
      this.progressBar.style.transition = "opacity 1s ease";
      this.progressBar.style.opacity = "0";
      setTimeout(() => this.progressBar.remove(), 1000);
    }
  }

  hideProgressBar() {
    if (this.progressBar) {
      this.progressBar.style.transition = "opacity 1s ease";
      this.progressBar.style.opacity = "0";
      setTimeout(() => {
        if (this.progressBar && this.progressBar.parentNode) {
          this.progressBar.remove();
        }
      }, 1000);
    }
  }

  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this._style && this._style.parentNode) {
      this._style.parentNode.removeChild(this._style);
    }
  }
}
