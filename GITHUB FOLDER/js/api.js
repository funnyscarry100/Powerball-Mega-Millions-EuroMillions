// ✅ DOM helper
function $(id) {
  return document.getElementById(id);
}

// ✅ Sample fallback if API fails or backend not ready yet
const fallbackData = {
  powerball: {
    date: "2025-10-23",
    numbers: [11, 27, 36, 62, 68],
    powerball: 24,
    jackpot: "$121 Million (fallback)"
  },
  megamillions: {
    date: "2025-10-22",
    numbers: [3, 17, 46, 59, 63],
    mega: 19,
    megaplier: "3X",
    jackpot: "$95 Million (fallback)"
  },
  euromillions: {
    date: "2025-10-21",
    numbers: [4, 13, 24, 36, 41],
    stars: [2, 11],
    jackpot: "€49 Million (fallback)"
  }
};

// ✅ Fetch wrapper (for future backend integration)
async function fetchLottery(endpoint) {
  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error("API failed");

    return await res.json();
  } catch (err) {
    console.warn(`⚠ API offline. Using fallback for ${endpoint}`);
    return fallbackData[endpoint];
  }
}

// ✅ Render functions
async function loadPowerball() {
  const data = await fetchLottery("powerball");
  $("powerball-latest").innerHTML = `
    <h3>Powerball Latest Results</h3>
    <p>Date: ${data.date}</p>
    <div class="balls">
      ${data.numbers.map(n => `<span class="ball">${n}</span>`).join("")}
      <span class="ball power">${data.powerball}</span>
    </div>
    <p>Jackpot: ${data.jackpot}</p>
  `;
}

async function loadMegaMillions() {
  const data = await fetchLottery("megamillions");
  $("megamillions-latest").innerHTML = `
    <h3>Mega Millions Latest Results</h3>
    <p>Date: ${data.date}</p>
    <div class="balls">
      ${data.numbers.map(n => `<span class="ball">${n}</span>`).join("")}
      <span class="ball mega">${data.mega}</span>
    </div>
    <p>Megaplier: ${data.megaplier}</p>
    <p>Jackpot: ${data.jackpot}</p>
  `;
}

async function loadEuroMillions() {
  const data = await fetchLottery("euromillions");
  $("euromillions-latest").innerHTML = `
    <h3>EuroMillions Latest Results</h3>
    <p>Date: ${data.date}</p>
    <div class="balls">
      ${data.numbers.map(n => `<span class="ball">${n}</span>`).join("")}
    </div>
    <div class="balls">
      ${data.stars.map(s => `<span class="ball star">${s}</span>`).join("")}
    </div>
    <p>Jackpot: ${data.jackpot}</p>
  `;
}

// ✅ Auto-load after UI ready
document.addEventListener("DOMContentLoaded", () => {
  loadPowerball();
  loadMegaMillions();
  loadEuroMillions();

  console.log("✅ Lottery data loaded");
});
