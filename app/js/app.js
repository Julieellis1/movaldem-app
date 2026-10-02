/* Movaldem Church App — router, radio player, quiz engine, push scaffold. */
(function () {
  const Api = window.MovaldemApi;
  const S = window.Screens;
  const C = window.MOVALDEM_CONFIG;
  const screen = document.getElementById("screen");
  const tabbar = document.getElementById("tabbar");
  const miniPlayer = document.getElementById("mini-player");

  const TABS = ["home", "events", "quiz", "gallery", "profile"];
  let data = null;           // { verse, programs, events, quiz, gallery, notifications }
  let quizState = null;      // { questions, idx, score, picked }
  let quizTimer = null;
  let quizSecs = 0;          // whole-quiz countdown (not per question)

  /* ---------------- toast ---------------- */
  let toastT = null;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  /* ---------------- data ---------------- */
  async function loadData() {
    if (data) return data;
    const [verse, programs, events, quizHome, gallery, notifications] = await Promise.all([
      Api.verse(), Api.programs(), Api.events(), Api.quizHome(), Api.gallery(), Api.notifications(),
    ]);
    data = { verse, programs, events, quiz: quizHome, gallery, notifications };
    return data;
  }

  /* ---------------- radio ---------------- */
  const audio = new Audio();
  audio.preload = "none";
  let radioPlaying = false;

  function setRadioUI(playing) {
    radioPlaying = playing;
    document.querySelectorAll("#radio-play-icon").forEach((el) => {
      el.textContent = playing ? "pause" : "play_arrow";
    });
    document.querySelectorAll("#radio-eq").forEach((el) => el.classList.toggle("paused", !playing));
    const mpIcon = document.getElementById("mp-icon");
    if (mpIcon) mpIcon.textContent = playing ? "pause" : "play_arrow";
    miniPlayer.classList.toggle("hidden", !playing);
    miniPlayer.setAttribute("aria-hidden", String(!playing));
  }

  function toggleRadio() {
    if (!C.ZENO_STREAM_URL) {
      toast("Movaldem Radio is coming soon — station setup in progress.");
      return;
    }
    if (radioPlaying) { audio.pause(); setRadioUI(false); }
    else {
      if (audio.src !== C.ZENO_STREAM_URL) audio.src = C.ZENO_STREAM_URL;
      audio.volume = parseFloat(document.getElementById("radio-vol")?.value ?? 80) / 100;
      audio.play().then(() => setRadioUI(true)).catch(() => toast("Could not start the stream."));
    }
  }
  function stopRadio() { audio.pause(); audio.removeAttribute("src"); audio.load(); setRadioUI(false); }

  /* ---------------- countdown ---------------- */
  let cdTimer = null;
  function startCountdown() {
    clearInterval(cdTimer);
    const el = document.querySelector("[data-countdown]");
    if (!el) return;
    const target = parseInt(el.dataset.countdown, 10);
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); const sec = s % 60;
      const q = (k) => el.querySelector(`[data-cd="${k}"]`);
      if (q("d")) q("d").textContent = pad(d);
      if (q("h")) q("h").textContent = pad(h);
      if (q("m")) q("m").textContent = pad(m);
      if (q("s")) q("s").textContent = pad(sec);
    };
    tick(); cdTimer = setInterval(tick, 1000);
  }

  /* ---------------- quiz engine ----------------
     Live mode: questions come from the server WITHOUT answers; the member's
     picks are collected as {question_id: option_index} and graded server-side
     on submit. Mock mode keeps the old local-graded demo flow. */
  function startQuiz() {
    let qs, live;
    if (CFG.USE_MOCK) {
      qs = [...data.quiz.questions].sort(() => Math.random() - 0.5);
      live = false;
    } else {
      qs = data.quiz.liveQuestions || [];
      live = true;
    }
    quizState = { questions: qs, idx: 0, score: 0, picked: null, answers: {}, live };
    quizSecs = 5 * 60;
    if (!qs.length) {
      // Nothing to play (already attempted today) — back to the lobby.
      location.hash = "#/quiz";
      return;
    }
    location.hash = "#/quiz/play";
  }
  function renderQuizPlay() {
    const raw = quizState.questions[quizState.idx];
    // Normalize live (server) questions to the screen's shape; live items
    // carry no answer — grading happens server-side on submit.
    const q = quizState.live
      ? { q: raw.text, opts: raw.options, ref: raw.ref, answer: undefined }
      : raw;
    screen.innerHTML = S.quizPlay(q, quizState.idx, quizState.questions.length, quizState.picked, quizState.live);
    screen.scrollTop = 0;
    clearInterval(quizTimer);
    const clock = () => {
      const el = document.getElementById("q-clock");
      if (!el) { clearInterval(quizTimer); return; }
      el.textContent = Math.floor(quizSecs / 60) + ":" + String(quizSecs % 60).padStart(2, "0");
      if (quizSecs <= 0) { clearInterval(quizTimer); finishQuiz(); }
      quizSecs--;
    };
    clock(); quizTimer = setInterval(clock, 1000);
  }
  function pick(i) {
    if (quizState.picked !== null) return;
    quizState.picked = i;
    const q = quizState.questions[quizState.idx];
    if (quizState.live) {
      quizState.answers[q.id] = i; // graded server-side on submit
    } else if (i === q.answer) {
      quizState.score++;
    }
    renderQuizPlay();
    // re-show feedback without restarting the timer visuals abruptly
    const next = document.getElementById("q-next");
    if (next) next.addEventListener("click", () => {
      quizState.idx++;
      quizState.picked = null;
      if (quizState.idx >= quizState.questions.length) finishQuiz();
      else { location.hash = "#/quiz/play"; renderQuizPlay(); }
    });
  }
  async function finishQuiz() {
    clearInterval(quizTimer);
    const wasLive = quizState.live;
    const total = quizState.questions.length;
    let result;
    if (wasLive) {
      try {
        result = await Api.submitQuiz(quizState.answers);
      } catch (e) {
        result = { score: 0, correct_count: 0, total, streak_day: 0, review: [], error: true };
      }
      data.quiz.me.streak = result.streak_day || data.quiz.me.streak;
      data.quiz.attempted = true;
    } else {
      const score = quizState.score;
      result = { score, correct_count: score, total, streak_day: (data.quiz.me.streak || 0) + 1, review: [] };
      data.quiz.me.streak = result.streak_day;
    }
    quizState = null;
    screen.innerHTML = S.quizResult(result);
    screen.scrollTop = 0;
    bindStatic();
  }

  /* ---------------- router ---------------- */
  const AUTH_ROUTES = ["splash", "login", "register"];
  function currentRoute() {
    const h = location.hash.replace(/^#\/?/, "") || "splash";
    return h;
  }

  async function render() {
    const route = currentRoute();
    const session = Api.session();

    if (!session && !AUTH_ROUTES.includes(route)) { location.hash = "#/splash"; return; }
    if (session && AUTH_ROUTES.includes(route)) { location.hash = "#/home"; return; }

    clearInterval(quizTimer);
    tabbar.classList.add("hidden");

    if (AUTH_ROUTES.includes(route)) {
      screen.innerHTML = route === "login" ? S.login() : route === "register" ? S.register() : S.splash();
      screen.scrollTop = 0; bindStatic(); return;
    }

    await loadData();
    const [base, arg] = route.split("/");

    if (base === "quiz" && arg === "play") {
      if (!quizState) startQuizSilent();
      renderQuizPlay(); bindStatic(); return;
    }

    if (base === "home") screen.innerHTML = S.home(data, session);
    else if (base === "events") screen.innerHTML = S.events(data, arg === "special" ? "special" : "programs");
    else if (base === "quiz") screen.innerHTML = S.quiz(data, arg === "board" ? "board" : "daily");
    else if (base === "gallery") screen.innerHTML = S.gallery(data, arg === "clips" ? "clips" : "photos");
    else if (base === "notifications") screen.innerHTML = S.notifications(data.notifications);
    else if (base === "profile") screen.innerHTML = S.profile(session);
    else { location.hash = "#/home"; return; }

    screen.scrollTop = 0;
    if (TABS.includes(base)) {
      tabbar.classList.remove("hidden");
      tabbar.querySelectorAll(".tab").forEach((t) =>
        t.classList.toggle("active", t.dataset.route === base));
    }
    startCountdown();
    bindStatic();
  }

  function startQuizSilent() {
    const qs = [...data.quiz.questions].sort(() => Math.random() - 0.5);
    quizState = { questions: qs, idx: 0, score: 0, picked: null };
    quizSecs = (data.quiz.quest.minutes || 5) * 60;
  }

  /* ---------------- global click delegation ---------------- */
  function bindStatic() {
    // tab bar
    tabbar.querySelectorAll(".tab").forEach((t) => {
      t.onclick = () => { location.hash = "#/" + t.dataset.route; };
    });
  }

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { location.hash = "#/" + nav.dataset.nav; return; }

    const t = e.target.closest("[data-toast]");
    if (t) { toast(t.dataset.toast); return; }

    const et = e.target.closest("[data-events-tab]");
    if (et) { location.hash = "#/events/" + et.dataset.eventsTab; return; }

    const qt = e.target.closest("[data-quiz-tab]");
    if (qt) { location.hash = "#/quiz/" + qt.dataset.quizTab; return; }

    const qg = e.target.closest("[data-quiz-tabgo]");
    if (qg) { location.hash = "#/quiz/" + qg.dataset.quizTabgo; return; }

    const gt = e.target.closest("[data-gallery-tab]");
    if (gt) { location.hash = "#/gallery/" + gt.dataset.galleryTab; return; }

    const pickBtn = e.target.closest("[data-pick]");
    if (pickBtn) { pick(parseInt(pickBtn.dataset.pick, 10)); return; }

    const like = e.target.closest("[data-like]");
    if (like) {
      const s = like.querySelector("span:last-child");
      s.textContent = parseInt(s.textContent, 10) + 1;
      like.querySelector(".material-symbols-outlined").style.color = "var(--maroon)";
      return;
    }

    if (e.target.closest("#radio-play") || e.target.closest("#mp-toggle")) { toggleRadio(); return; }
    if (e.target.closest("#mp-close")) { stopRadio(); return; }
    if (e.target.closest("#logout-btn")) { Api.logout(); location.hash = "#/splash"; return; }
    const psw = e.target.closest("[data-push-toggle]");
    if (psw) {
      const sw = document.getElementById("push-switch");
      const on = sw.classList.toggle("on");
      toast(on ? "Instant alerts turned on" : "Instant alerts turned off");
      return;
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "radio-vol") audio.volume = e.target.value / 100;
  });

  document.addEventListener("submit", async (e) => {
    if (e.target.id === "login-form") {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await Api.login(f.get("email").trim(), f.get("password"));
        location.hash = "#/home";
      } catch (err) { screen.innerHTML = S.login(err.message); }
    }
    if (e.target.id === "register-form") {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await Api.register(f.get("name").trim(), f.get("email").trim(), f.get("password"), (f.get("phone") || "").trim());
        toast("Welcome to the Movaldem family!");
        location.hash = "#/home";
      } catch (err) { screen.innerHTML = S.register(err.message); }
    }
  });

  /* ---------------- push scaffold ---------------- */
  async function initPush() {
    try {
      if (window.Capacitor?.Plugins?.PushNotifications && C.PUSH_ENABLED) {
        const { PushNotifications } = window.Capacitor.Plugins;
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive === "granted") {
          await PushNotifications.register();
          PushNotifications.addListener("registration", (tok) => Api.registerDevice(tok.value));
          PushNotifications.addListener("pushNotificationReceived", (n) => {
            data?.notifications.unshift({ id: Date.now(), title: n.title + " — " + n.body, time: "now", unread: true });
            toast(n.title);
          });
        }
      }
    } catch { /* push unavailable in browser preview */ }
  }

  window.addEventListener("hashchange", render);
  initPush();
  // Preview helper: ?preview=1 seeds a demo session (screenshots, demos).
  if (location.search.includes("preview=1") && !Api.session()) {
    Api.saveSession({ name: "Sarah Member", email: "sarah@example.com", username: "sarah@example.com" });
  }
  render();
})();
