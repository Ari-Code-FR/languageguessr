// script.js — logique du jeu
(function(){
  // util
  function qs(name){ return new URLSearchParams(location.search).get(name); }
  function randInt(max){ return Math.floor(Math.random()*max); }

  // Elements
  const modeKey = qs('mode') || 'toutes';
  const modeTitle = document.getElementById('modeTitle');
  const phraseBox = document.getElementById('phraseBox');
  const choicesDiv = document.getElementById('choices');
  const restartBtn = document.getElementById('restartBtn');
  const info = document.getElementById('info');
  const answer = document.getElementById('answer');

  // Validate mode
  if(!MODES[modeKey]){
    modeTitle.textContent = "Mode non trouvé";
  } else {
    modeTitle.textContent = "Mode : " + modeKey;
  }

  // Build language list for this mode
  const languages = MODES[modeKey] ? MODES[modeKey].slice() : MODES['toutes'].slice();

  // make sure phrases exist for languages; if not, fall back to language name as phrase
  function getRandomPhraseFor(lang){
    const arr = PHRASES[lang];
    if(Array.isArray(arr) && arr.length>0){
      // pick a phrase of length 15-40 if possible, else any
      const candidates = arr.filter(s => s.length>=15 && s.length<=40);
      const pool = candidates.length? candidates : arr;
      return pool[randInt(pool.length)];
    } else {
      return lang; // fallback
    }
  }

  // Start a round
  function startRound(){
    info.textContent = "Quel est ce language ?";
    answer.innerHTML = "";
    
    // choose a language from the pool at random
    const correctLang = languages[randInt(languages.length)];
    const phrase = getRandomPhraseFor(correctLang);
    phraseBox.textContent = phrase;
    
    // Reset old
    choicesDiv.innerHTML = "";
    selectizeInstance = $('#selectChoice')[0].selectize;
    if (selectizeInstance) {
      selectizeInstance.enable();
      selectizeInstance.destroy();
    }
    
    // Create buttons
    var languageList = []
    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = lang;
      btn.dataset.lang = lang;
      btn.disabled = false;
      btn.addEventListener('click', () => handleChoice(btn, correctLang));
      choicesDiv.appendChild(btn);
      languageList.push(lang)
    });

    // Create select
    $('#selectChoice').selectize({
      options: languageList.map(lang => ({ value: lang, text: lang })),
      closeAfterSelect: true,
      onChange: function(value) {
        if (!value) return;
        const btn = document.querySelector(`.choice-btn[data-lang="${value}"]`);
        if (btn) {
          handleChoice(btn, correctLang);
        }
      }
    });

    // show restart only after a choice (per spec we'll keep as visible but disabled until answer)
    restartBtn.disabled = true;
    restartBtn.style.opacity = 0;
  }

  function handleChoice(button, correctLang){
    // disable all choices
    const btns = Array.from(document.querySelectorAll('.choice-btn'));
    btns.forEach(b => b.disabled = true);
    selectizeInstance = $('#selectChoice')[0].selectize;
    if (selectizeInstance) {
      selectizeInstance.disable();
    }

    const chosen = button.dataset.lang;
    if(chosen === correctLang){
      button.classList.add('correct');
      info.textContent = "Bonne réponse !";
      answer.innerHTML = `<span style='color:green'>${correctLang}</span>`
    } else {
      button.classList.add('wrong');
      // highlight the correct one
      const correctBtn = btns.find(b => b.dataset.lang === correctLang);
      if(correctBtn) correctBtn.classList.add('correct');
      info.textContent = "Mauvaise réponse.";
      answer.innerHTML = `<span style='color:red;text-decoration: line-through;'>${chosen}</span><span style='color:green'>${correctLang}</span>`
    }

    // enable restart
    restartBtn.disabled = false;
    restartBtn.style.opacity = 1;
  }

  restartBtn.addEventListener('click', startRound);

  // initial round
  startRound();

  // expose for debug
  window.LG = { startRound };
})();
