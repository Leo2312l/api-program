const input = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");

/*
  Free Dictionary API:
  https://api.dictionaryapi.dev/
  No API key is required.

  This version also contains a small offline dictionary fallback.
  Therefore Random Word still works if the API/network is temporarily unavailable.
*/

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const fallback = {
  agriculture: {
    word:"agriculture", phonetic:"/ˈæɡ.rɪˌkʌl.tʃər/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The art and science of cultivating the soil, growing crops, and raising animals.",example:"Modern agriculture uses technology to improve crop production."},
        {definition:"The business or activity of farming."}
      ],
      synonyms:["farming","cultivation","husbandry"]
    }]
  },
  technology: {
    word:"technology", phonetic:"/tɛkˈnɒlədʒi/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The practical application of scientific knowledge, especially in industry and everyday life.",example:"Technology has changed the way people communicate."}
      ],
      synonyms:["innovation","engineering"]
    }]
  },
  innovation: {
    word:"innovation", phonetic:"/ˌɪnəˈveɪʃən/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"A new idea, method, product, or way of doing something.",example:"The company is known for innovation in software."}
      ],
      synonyms:["invention","creativity","novelty"]
    }]
  },
  knowledge: {
    word:"knowledge", phonetic:"/ˈnɒlɪdʒ/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"Facts, information, and skills acquired through experience or education.",example:"Knowledge of programming is useful for software development."}
      ],
      synonyms:["understanding","learning","awareness"]
    }]
  },
  success: {
    word:"success", phonetic:"/səkˈsɛs/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The achievement of a desired aim or result.",example:"Hard work can lead to success."}
      ],
      synonyms:["achievement","victory","accomplishment"]
    }]
  },
  nature: {
    word:"nature", phonetic:"/ˈneɪtʃər/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The physical world and all living things that exist in it.",example:"We should protect nature for future generations."}
      ],
      synonyms:["environment","wildlife"]
    }]
  },
  science: {
    word:"science", phonetic:"/ˈsaɪəns/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The systematic study of the natural world through observation and experiment.",example:"Science helps us understand how the world works."}
      ],
      synonyms:["study","knowledge"]
    }]
  },
  education: {
    word:"education", phonetic:"/ˌɛdʒʊˈkeɪʃən/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The process of teaching and learning, especially at a school or college.",example:"Education can create new opportunities."}
      ],
      synonyms:["learning","instruction","schooling"]
    }]
  },
  environment: {
    word:"environment", phonetic:"/ɪnˈvaɪrənmənt/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The surroundings or conditions in which people, animals, or plants live.",example:"Everyone can help protect the environment."}
      ],
      synonyms:["surroundings","habitat","ecosystem"]
    }]
  },
  future: {
    word:"future", phonetic:"/ˈfjuːtʃər/", meanings:[{
      partOfSpeech:"noun",
      definitions:[
        {definition:"The time that will come after the present.",example:"Technology will shape the future."}
      ],
      synonyms:["tomorrow","prospect"]
    }]
  }
};

const randomWords = Object.keys(fallback);

function clean(text = "") {
  return String(text).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function setStatus(message, error=false) {
  status.textContent = message;
  status.className = error ? "status error" : "status";
}

function setButtons(disabled) {
  searchBtn.disabled = disabled;
  randomBtn.disabled = disabled;
}

function normalizeEntry(entry) {
  return {
    word: entry.word || "",
    phonetic: entry.phonetic || (entry.phonetics || []).find(p => p.text)?.text || "",
    phonetics: entry.phonetics || [],
    meanings: entry.meanings || []
  };
}

async function fetchFromApi(word) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_BASE + encodeURIComponent(word), {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Word not found");
      throw new Error("Dictionary service unavailable");
    }

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) {
      throw new Error("No definition returned");
    }
    return normalizeEntry(data[0]);
  } finally {
    clearTimeout(timeout);
  }
}

function renderEntry(entry, offline=false) {
  const phonetic = entry.phonetic || "";
  const audio = (entry.phonetics || []).find(p => p.audio)?.audio || "";

  let html = `
    <div class="word-head">
      <div>
        <h2>${clean(entry.word)}</h2>
        <p class="phonetic">${clean(phonetic)}</p>
      </div>
      ${audio ? `<button class="audio" id="audioBtn" title="Play pronunciation">🔊</button>` : ""}
    </div>
  `;

  (entry.meanings || []).slice(0, 5).forEach(meaning => {
    html += `<div class="meaning">
      <h3>${clean(meaning.partOfSpeech || "Meaning")}</h3>`;

    (meaning.definitions || []).slice(0, 4).forEach((definition, index) => {
      html += `
        <div class="definition">
          <b>${index + 1}.</b>
          <span>${clean(definition.definition)}</span>
          ${definition.example ? `<small>Example: ${clean(definition.example)}</small>` : ""}
        </div>`;
    });

    const synonyms = (meaning.synonyms || []).slice(0, 8);
    if (synonyms.length) {
      html += `<p class="synonyms"><b>Synonyms:</b> ${synonyms.map(clean).join(", ")}</p>`;
    }
    html += `</div>`;
  });

  if (offline) {
    html += `<div class="source-note">Showing the built-in definition because the online dictionary could not be reached.</div>`;
  }

  result.innerHTML = html;

  if (audio) {
    document.getElementById("audioBtn").addEventListener("click", () => {
      const player = new Audio(audio);
      player.play().catch(() => setStatus("Audio could not be played.", true));
    });
  }
}

async function searchWord(word) {
  word = String(word || "").trim().toLowerCase();

  if (!word) {
    setStatus("Please enter a word.", true);
    return;
  }

  setStatus("Searching...");
  setButtons(true);
  result.innerHTML = `<div class="welcome"><div>⏳</div><h2>Loading...</h2><p>Finding the definition.</p></div>`;

  try {
    const entry = await fetchFromApi(word);
    renderEntry(entry, false);
    setStatus("Definition loaded successfully.");
  } catch (error) {
    // Offline/local fallback for common words.
    if (fallback[word]) {
      renderEntry(fallback[word], true);
      setStatus("Online dictionary unavailable. Showing an offline definition.", false);
    } else if (error.name === "AbortError") {
      result.innerHTML = `<div class="not-found"><div>🌐</div><h2>Connection timed out</h2><p>Please check your internet connection and try again.</p></div>`;
      setStatus("Dictionary request timed out.", true);
    } else if (error.message === "Word not found") {
      result.innerHTML = `<div class="not-found"><div>🔎</div><h2>Word not found</h2><p>Try another English word.</p></div>`;
      setStatus("Word not found.", true);
    } else {
      result.innerHTML = `<div class="not-found"><div>🌐</div><h2>Dictionary unavailable</h2><p>Check your internet connection and try again.</p></div>`;
      setStatus("Could not connect to the dictionary service.", true);
    }
  } finally {
    setButtons(false);
  }
}

searchBtn.addEventListener("click", () => searchWord(input.value));

input.addEventListener("keydown", event => {
  if (event.key === "Enter") searchWord(input.value);
});

randomBtn.addEventListener("click", () => {
  const word = randomWords[Math.floor(Math.random() * randomWords.length)];
  input.value = word;
  searchWord(word);
});

// Load a word automatically.
input.value = "agriculture";
searchWord("agriculture");
