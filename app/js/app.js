/* Movaldem Church App — router, radio player, quiz engine, push scaffold. */
(function () {
  const Api = window.MovaldemApi;
  const S = window.Screens;
  const C = window.MOVALDEM_CONFIG;
  const screen = document.getElementById("screen");
  const tabbar = document.getElementById("tabbar");
  const miniPlayer = document.getElementById("mini-player");

  const TABS = ["home", "events", "quiz", "gallery", "catalogs", "profile"];
  let data = null;           // { verse, programs, events, quiz, gallery, notifications }
  let quizState = null;      // { questions, idx, score, picked }
  let quizTimer = null;
  let splashShown = false;
  let splashTimers = [];
  let quizSecs = 0;          // whole-quiz countdown (not per question)

  /* ---------------- toast ---------------- */
  let toastT = null;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  /* ---------------- top loading spinner ----------------
     Small pill at the top-middle of the page. The current page stays intact
     underneath while data loads. */
  const topLoader = document.getElementById("top-loader");
  function showTopLoader() {
    if (!topLoader) return;
    topLoader.classList.remove("hidden");
    topLoader.setAttribute("aria-hidden", "false");
  }
  function hideTopLoader() {
    if (!topLoader) return;
    topLoader.classList.add("hidden");
    topLoader.setAttribute("aria-hidden", "true");
  }

  /* ---------------- data ---------------- */
  async function loadData() {
    if (data) return data;
    let verse, programs, events, quizHome, gallery, catalogs, notifications, devotionToday, devotions;
    try {
      [verse, programs, events, quizHome, gallery, catalogs, notifications, devotionToday, devotions] = await Promise.all([
        Api.verse(), Api.programs(), Api.events(), Api.quizHome(), Api.gallery(), Api.listCatalogs().catch(() => []), Api.notifications(),
        Api.devotionToday().catch(() => null), Api.devotions().catch(() => []),
      ]);
    } catch (err) {
      if (err && err.status === 401) {
        // Token is dead (expired, or replaced by a login on another device).
        // Drop it and send the user to login instead of a blank screen.
        data = null;
        Api.clearSession();
        if (currentRoute() !== "login") location.hash = "#/login";
        return null;
      }
      throw err;
    }
    data = { verse, programs, events, quiz: quizHome, gallery, catalogs, notifications, devotion: devotionToday, devotions: devotions || [] };
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
    if (C.USE_MOCK) {
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
    const raw = quizState && quizState.questions[quizState.idx];
    if (!raw) { location.hash = "#/quiz"; return; } // stale state: back to lobby, never crash
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
  const AUTH_ROUTES = ["splash", "welcome", "login", "register"];
  let regRole = null; // role picked on step 1 of registration
  function currentRoute() {
    const h = location.hash.replace(/^#\/?/, "") || "splash";
    return h;
  }
  function isAuthRoute(route) {
    return AUTH_ROUTES.includes(route) || route.startsWith("register/");
  }

  async function render() {
    const route = currentRoute();
    const session = Api.session();

    if (!session && !isAuthRoute(route)) { location.hash = "#/splash"; return; }
    if (session && isAuthRoute(route)) { location.hash = "#/home"; return; }

    clearInterval(quizTimer);
    splashTimers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    splashTimers = [];
    tabbar.classList.add("hidden");

    if (route === "splash") {
      screen.innerHTML = S.splash();
      screen.scrollTop = 0; playSplash(); return;
    }
    if (route === "login" || route === "welcome" || route === "register" || route === "register/form") {
      if (route === "register/form" && !regRole) { location.hash = "#/register"; return; }
      screen.innerHTML = route === "login" ? S.login()
        : route === "register" ? S.registerRole()
        : route === "register/form" ? S.registerForm(regRole)
        : S.welcome();
      screen.scrollTop = 0; bindStatic(); return;
    }

    // Show the top-middle spinner: the current page stays intact underneath
    // while data loads (no full-screen loading page).
    showTopLoader();
    let loaded;
    try {
      loaded = await loadData();
    } catch (err) {
      hideTopLoader();
      screen.innerHTML = S.loadError(err && err.message);
      screen.scrollTop = 0;
      return;
    }
    if (!loaded) { hideTopLoader(); return; } // 401 path: dead session cleared, login redirect already queued
    try {
      await renderAuthed(route, session);
      hideTopLoader();
    } catch (err) {
      // Never freeze on a spinner: surface render bugs as a retry screen.
      hideTopLoader();
      screen.innerHTML = S.loadError(err && err.message);
      screen.scrollTop = 0;
    }
  }

  async function renderAuthed(route, session) {
    const [base, arg] = route.split("/");

    if (base === "quiz" && arg === "play") {
      // (Re)initialize whenever there is no playable state: a stale empty
      // quizState must not skip this, or the play screen crashes.
      if ((!quizState || !quizState.questions.length) && startQuizSilent() === false) return; // redirected to lobby
      renderQuizPlay(); bindStatic(); return;
    }

    if (base === "home") screen.innerHTML = S.home(data, session);
    else if (base === "events") screen.innerHTML = S.events(data, arg === "special" ? "special" : "programs");
    else if (base === "quiz") screen.innerHTML = S.quiz(data, arg === "board" ? "board" : "daily");
    else if (base === "gallery") screen.innerHTML = S.gallery(data, arg === "clips" ? "clips" : "photos");
    else if (base === "catalogs" && arg) {
      const detail = await Api.getCatalog(arg).catch(() => null);
      if (detail) { screen.innerHTML = S.catalogDetail(detail); }
      else { toast("Could not open that catalog."); location.hash = "#/catalogs"; return; }
    }
    else if (base === "catalogs") screen.innerHTML = S.catalogs(data.catalogs, session);
    else if (base === "admin" && arg === "catalog") {
      if (!S.canPostCatalog(session)) { location.hash = "#/catalogs"; return; }
      screen.innerHTML = S.catalogComposer();
    }
    else if (base === "notifications" && arg) {
      const detail = await Api.notificationDetail(arg, data.notifications);
      if (detail) { Api.markNotifsSeen([detail.id]); screen.innerHTML = S.notifDetail(detail); }
      else { location.hash = "#/notifications"; return; }
    }
    else if (base === "notifications") { Api.markNotifsSeen((data.notifications || []).map((n) => n.id)); screen.innerHTML = S.notifications(data.notifications); }
    else if (base === "devotion" && arg) {
      const dv = (data.devotions || []).find((x) => String(x.id) === String(arg)) || (data.devotion && String(data.devotion.id) === String(arg) ? data.devotion : null);
      if (dv) { screen.innerHTML = S.devotionDetail(dv); }
      else { location.hash = "#/devotion"; return; }
    }
    else if (base === "devotion") screen.innerHTML = S.devotionsList(data.devotions);
    else if (base === "profile") screen.innerHTML = S.profile(session, Api.notifyPrefs());
    else if (base === "admin" && arg === "notify") {
      if (!session.isAdmin) { location.hash = "#/home"; return; }
      screen.innerHTML = S.notifyScreen();
    }
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
    let qs, live;
    if (C.USE_MOCK) {
      qs = [...(data.quiz.questions || [])].sort(() => Math.random() - 0.5);
      live = false;
    } else {
      qs = data.quiz.liveQuestions || [];
      live = true;
    }
    quizState = { questions: qs, idx: 0, score: 0, picked: null, answers: {}, live };
    quizSecs = ((data.quiz.quest && data.quiz.quest.minutes) || 5) * 60;
    if (!qs.length) {
      // Nothing to play (already attempted today, or fetch failed) — back to the lobby.
      // Clear the state: a stale empty quizState would make the play route
      // skip re-initializing and crash on questions[0].
      quizState = null;
      location.hash = "#/quiz";
      return false;
    }
    return true;
  }

  /* ---------------- global click delegation ---------------- */
  function bindStatic() {
    // tab bar
    tabbar.querySelectorAll(".tab").forEach((t) => {
      t.onclick = () => { location.hash = "#/" + t.dataset.route; };
    });
  }

  document.addEventListener("click", async (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { location.hash = "#/" + nav.dataset.nav; return; }

    // Registration step 1: pick a role, then go to the details form.
    const roleBtn = e.target.closest("[data-reg-role]");
    if (roleBtn) { regRole = roleBtn.dataset.regRole; location.hash = "#/register/form"; return; }

    // Department chips (multi-select).
    const chip = e.target.closest("[data-dept]");
    if (chip) { chip.classList.toggle("on"); return; }

    // Admin composer: reveal department chips only for that audience.
    const aud = e.target.closest('input[name="audience"]');
    if (aud) {
      const row = document.getElementById("notify-depts");
      if (row) row.style.display = aud.value === "departments" ? "" : "none";
      return;
    }

    const nn = e.target.closest("[data-notif]");
    if (nn) { location.hash = "#/notifications/" + nn.dataset.notif; return; }

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

    // Catalog composer: add / remove YouTube rows.
    if (e.target.closest("[data-yt-add]")) {
      const wrap = document.getElementById("catalog-videos");
      if (wrap) {
        const row = document.createElement("div");
        row.className = "yt-row";
        row.innerHTML = `<input type="url" name="yt_url" placeholder="https://www.youtube.com/watch?v=…" inputmode="url"/>
          <input type="text" name="yt_title" placeholder="Video title (optional)" maxlength="120"/>
          <button type="button" class="icon-btn" data-yt-remove aria-label="Remove video"><span class="material-symbols-outlined">close</span></button>`;
        wrap.appendChild(row);
      }
      return;
    }
    const ytRm = e.target.closest("[data-yt-remove]");
    if (ytRm) {
      const wrap = document.getElementById("catalog-videos");
      const rows = wrap ? wrap.querySelectorAll(".yt-row") : [];
      if (rows.length > 1) ytRm.closest(".yt-row").remove();
      else {
        const r = ytRm.closest(".yt-row");
        r.querySelector('[name="yt_url"]').value = "";
        r.querySelector('[name="yt_title"]').value = "";
      }
      return;
    }

    // Catalog photo lightbox (tap a photo to view it larger).
    const cp = e.target.closest("[data-cat-photo]");
    if (cp) { openPhotoLightbox(cp.dataset.catPhoto); return; }

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
    if (e.target.closest("[data-retry-load]")) { data = null; render(); return; }
    if (e.target.closest("#logout-btn")) { Api.logout(); location.hash = "#/splash"; return; }
    const psw = e.target.closest("[data-push-toggle]");
    if (psw) {
      const sw = document.getElementById("push-switch");
      const on = sw.classList.toggle("on");
      toast(on ? "Instant alerts turned on" : "Instant alerts turned off");
      return;
    }
    const np = e.target.closest("[data-notify-pref]");
    if (np) {
      const key = np.dataset.notifyPref;
      const sw = np.querySelector(".switch");
      const on = sw ? sw.classList.toggle("on") : true;
      Api.setNotifyPref(key, on);
      toast((key === "verse" ? "Verse of the day alerts " : "Daily devotion alerts ") + (on ? "on" : "off"));
      return;
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "radio-vol") audio.volume = e.target.value / 100;
    // Catalog composer: show how many photos were picked.
    if (e.target.id === "catalog-photos") {
      const hint = document.getElementById("catalog-photos-hint");
      if (hint) {
        const n = e.target.files ? e.target.files.length : 0;
        hint.textContent = n ? n + (n === 1 ? " photo selected." : " photos selected.") : "No photos selected yet.";
      }
    }
  });

  /* Catalog photo lightbox overlay (created once, reused). */
  function openPhotoLightbox(url) {
    let wrap = document.getElementById("cat-lightbox");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "cat-lightbox";
      wrap.innerHTML = '<button aria-label="Close"><span class="material-symbols-outlined">close</span></button><img alt="Catalog photo"/>';
      wrap.addEventListener("click", () => wrap.classList.remove("on"));
      document.body.appendChild(wrap);
    }
    wrap.querySelector("img").src = url || "";
    wrap.classList.add("on");
  }

  document.addEventListener("submit", async (e) => {
    const setBusy = (form, label) => {
      const btn = form.querySelector('[type="submit"]');
      if (btn && !btn.disabled) {
        btn.disabled = true;
        btn.dataset.label = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spin"></span> ' + label;
      }
      return btn;
    };
    if (e.target.id === "login-form") {
      e.preventDefault();
      setBusy(e.target, "Signing in…");
      const f = new FormData(e.target);
      try {
        await Api.login(f.get("email").trim(), f.get("password"));
        Api.syncDevice().catch(() => {});
        location.hash = "#/home";
      } catch (err) { screen.innerHTML = S.login(err.message); }
    }
    if (e.target.id === "register-form") {
      e.preventDefault();
      setBusy(e.target, "Creating account…");
      const f = new FormData(e.target);
      const role = e.target.dataset.role || "member";
      const depts = [...e.target.querySelectorAll(".chip.on")].map((c) => c.dataset.dept);
      try {
        if (role === "worker" && !depts.length) throw new Error("Please select at least one department.");
        await Api.register(f.get("name").trim(), f.get("email").trim(), f.get("password"), (f.get("phone") || "").trim(), role, depts);
        regRole = null;
        Api.syncDevice().catch(() => {});
        toast("Welcome to the Movaldem family!");
        location.hash = "#/home";
      } catch (err) { screen.innerHTML = S.registerForm(role, err.message, depts); screen.scrollTop = 0; }
    }
    if (e.target.id === "notify-form") {
      e.preventDefault();
      setBusy(e.target, "Sending…");
      const f = new FormData(e.target);
      try {
        const audience = f.get("audience") || "all";
        const depts = [...e.target.querySelectorAll(".chip.on")].map((c) => c.dataset.dept);
        if (audience === "departments" && !depts.length) throw new Error("Pick at least one department.");
        const r = await Api.sendNotification({ title: (f.get("title") || "").trim(), message: (f.get("message") || "").trim(), audience, departments: depts });
        screen.innerHTML = S.notifyScreen("", r.sent === 1 ? "Sent to 1 device." : `Sent to ${r.sent} devices.`);
        screen.scrollTop = 0;
        toast("Notification sent");
      } catch (err) { screen.innerHTML = S.notifyScreen(err.message); screen.scrollTop = 0; }
    }
    if (e.target.id === "catalog-form") {
      e.preventDefault();
      const btn = setBusy(e.target, "Publishing…");
      const f = new FormData(e.target);
      const fail = (msg) => { screen.innerHTML = S.catalogComposer(msg); screen.scrollTop = 0; };
      try {
        const title = (f.get("title") || "").trim();
        if (!title) throw new Error("Give your catalog a title.");
        // Collect YouTube links; each must resolve to a real video id.
        const videos = [];
        e.target.querySelectorAll(".yt-row").forEach((row) => {
          const url = (row.querySelector('[name="yt_url"]').value || "").trim();
          if (!url) return;
          const vid = Api.youtubeVideoId(url);
          if (!vid) throw new Error("That does not look like a YouTube link: " + url);
          videos.push({ url, title: (row.querySelector('[name="yt_title"]').value || "").trim() });
        });
        // Upload the photos first, one at a time, with progress on the button.
        const files = [...(document.getElementById("catalog-photos").files || [])];
        const imageIds = [];
        for (let i = 0; i < files.length; i++) {
          if (btn) btn.innerHTML = '<span class="btn-spin"></span> Uploading photo ' + (i + 1) + " of " + files.length + "…";
          const up = await Api.uploadMedia(files[i]);
          if (up && up.id) imageIds.push(up.id);
        }
        if (btn) btn.innerHTML = '<span class="btn-spin"></span> Publishing…';
        const created = await Api.createCatalog({ title, description: (f.get("description") || "").trim(), imageIds, videos });
        data = null; // force a fresh catalogs list on return
        toast("Catalog published");
        location.hash = created && created.id ? "#/catalogs/" + created.id : "#/catalogs";
      } catch (err) { fail(err.message || "Could not publish the catalog."); }
    }
  });

  /* ---------------- brand splash (clinic-style) ---------------- */
  /* Logo pops in via CSS; the church name types out here. Advances to
     welcome (or home when already logged in). Never traps the user:
     failsafe timer + skip if already shown this session. */
  function playSplash() {
    const go = () => { location.hash = Api.session() ? "#/home" : "#/welcome"; };
    if (splashShown) { go(); return; }
    splashShown = true;
    const name = C.CHURCH_FULL_NAME;
    splashTimers.push(setTimeout(go, 6000)); // failsafe
    splashTimers.push(setTimeout(() => {
      let i = 0;
      const tick = setInterval(() => {
        const el = document.getElementById("splash-typed");
        if (!el) { clearInterval(tick); return; }
        el.textContent = name.slice(0, ++i);
        if (i >= name.length) {
          clearInterval(tick);
          const cur = document.querySelector(".splash-cursor");
          if (cur) cur.style.display = "none";
          splashTimers.push(setTimeout(go, 650));
        }
      }, 45);
      splashTimers.push(tick);
    }, 750));
  }

  /* ---------------- confirm dialog ---------------- */
  function confirmDialog(title, message, okLabel) {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.className = "confirm-wrap";
      wrap.innerHTML = `
        <div class="confirm-card">
          <b>${title}</b>
          <p>${message}</p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" data-no>Cancel</button>
            <button class="btn btn-dark" data-yes>${okLabel || "Yes"}</button>
          </div>
        </div>`;
      const done = (val) => { wrap.remove(); resolve(val); };
      wrap.querySelector("[data-yes]").onclick = () => done(true);
      wrap.querySelector("[data-no]").onclick = () => done(false);
      wrap.addEventListener("click", (e) => { if (e.target === wrap) done(false); });
      document.body.appendChild(wrap);
    });
  }

  /* ---------------- pull to refresh ---------------- */
  let ptrStartY = null;
  const PTR_THRESHOLD = 70;
  function ptrShow(show) {
    let el = document.getElementById("ptr-ind");
    if (!el) {
      el = document.createElement("div");
      el.id = "ptr-ind";
      el.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
      document.body.appendChild(el);
    }
    el.classList.toggle("on", !!show);
  }
  document.addEventListener("touchstart", (e) => {
    ptrStartY = (screen.scrollTop <= 0 && Api.session()) ? e.touches[0].clientY : null;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (ptrStartY === null) return;
    ptrShow(e.touches[0].clientY - ptrStartY > PTR_THRESHOLD);
  }, { passive: true });
  document.addEventListener("touchend", () => {
    const el = document.getElementById("ptr-ind");
    const fire = el && el.classList.contains("on");
    ptrShow(false);
    ptrStartY = null;
    if (fire) {
      data = null;
      toast("Refreshing…");
      render();
    }
  }, { passive: true });

  /* ---------------- hardware back button ---------------- */
  function initBackButton() {
    try {
      const AppPlugin = window.Capacitor?.Plugins?.App;
      if (!AppPlugin) return;
      AppPlugin.addListener("backButton", async () => {
        const route = (location.hash || "#/splash").replace(/^#\//, "");
        const base = route.split("/")[0];
        // On home (or auth screens): ask before exiting. Anywhere else: go home first.
        if (base === "home" || base === "splash" || base === "welcome" || base === "login" || base === "register") {
          const yes = await confirmDialog("Exit app?", "Do you want to exit the app?", "Exit");
          if (yes) AppPlugin.exitApp();
        } else {
          location.hash = "#/home";
        }
      });
    } catch { /* not a native shell */ }
  }
  async function initPush() {
    try {
      if (window.Capacitor?.Plugins?.PushNotifications && C.PUSH_ENABLED) {
        const { PushNotifications } = window.Capacitor.Plugins;
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive === "granted") {
          await PushNotifications.register();
          // Dedicated channel with the Movaldem voice alert sound.
          try {
            await PushNotifications.createChannel({
              id: "movaldem_alerts",
              name: "Movaldem Alerts",
              description: "Church announcements and instant alerts",
              sound: "movaldem_alert",
              importance: 5,
              vibration: true,
            });
          } catch {}
          PushNotifications.addListener("registration", (tok) => Api.registerDevice(tok.value));
          PushNotifications.addListener("pushNotificationReceived", async (n) => {
            toast(n.title);
            // Refresh the inbox live so the new announcement appears without reopening the app.
            try {
              const fresh = await Api.notifications();
              if (data && fresh && fresh.length) data.notifications = fresh;
            } catch {}
            const base = (location.hash || "#/splash").replace(/^#\//, "").split("/")[0];
            if (base === "notifications" || base === "home") render();
          });
        }
      }
    } catch { /* push unavailable in browser preview */ }
  }

  window.addEventListener("hashchange", render);
  initPush();
  initBackButton();
  // If a session already exists at startup, make sure the cached FCM token
  // is registered (covers users who never log out and back in).
  try { if (Api.session()) Api.syncDevice().catch(() => {}); } catch {}
  // Preview helper: ?preview=1 seeds a demo session (screenshots, demos).
  if (location.search.includes("preview=1") && !Api.session()) {
    Api.saveSession({ name: "Sarah Member", email: "sarah@example.com", username: "sarah@example.com" });
  }
  render();
})();
