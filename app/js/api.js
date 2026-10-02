/* Movaldem Church App — data layer.
 * USE_MOCK=true: serves local demo data so every screen works standalone.
 * USE_MOCK=false: talks to the WordPress REST API — the SAME database as
 * the church website (wp_users, program/event CPTs, gallery, quiz tables). */
(function () {
  const CFG = window.MOVALDEM_CONFIG;
  const LS_SESSION = "movaldem.session";
  const LS_DEVICE = "movaldem.device";

  /* ---------------- Mock data (demo mode) ---------------- */
  const MOCK = {
    verse: {
      text: "\u201CI will build my church, and the gates of hell shall not prevail against it.\u201D",
      ref: "MATTHEW 16:18",
      note: "Morning Meditations",
    },
    programs: [
      { id: 1, title: "New Month Declaration", day: "1st Day Monthly", time: "6:00 AM \u2013 7:00 AM", venue: "Main Auditorium", tag: "Declaration", desc: "We command the new month with prophetic declarations and thanksgiving." },
      { id: 2, title: "Youth Evangelism", day: "1st Friday Monthly", time: "4:00 PM \u2013 6:00 PM", venue: "Church Premises & Outreach", tag: "Outreach", desc: "Taking the gospel to the streets of Alagbado with love and power." },
      { id: 3, title: "Praise Night", day: "Last Friday Monthly", time: "12:00 AM \u2013 2:00 AM", venue: "Main Auditorium", tag: "Worship", desc: "A night of undiluted praise, worship and thanksgiving unto the Lord." },
      { id: 4, title: "Sunday Celebration Service", day: "Sunday", time: "9:00 AM", venue: "Main Auditorium", tag: "Worship", desc: "Our weekly celebration with the Word, worship and warm fellowship." },
      { id: 5, title: "Midweek Bible Study", day: "Wednesday", time: "6:00 PM", venue: "Main Auditorium", tag: "Word", desc: "Digging deep into the Scriptures for doctrine and daily living." },
    ],
    events: [
      { id: 101, title: "8th Anniversary Thanksgiving", date: "2026-09-12", time: "10:00 AM", venue: "Church Auditorium", tag: "Celebration", desc: "Celebrating 8 years of God's faithfulness at Movaldem.", seats: null },
      { id: 102, title: "Night of Divine Encounter", date: "2026-10-30", time: "10:00 PM", venue: "Main Auditorium", tag: "Vigil", desc: "A night of prayer, worship and divine visitation.", seats: 500 },
      { id: 103, title: "Workers' Refresher Training", date: "2026-11-07", time: "9:00 AM", venue: "Youth Hall", tag: "Training", desc: "Equipping all workers for effective kingdom service.", seats: 120 },
    ],
    quiz: {
      me: { name: "Member", rank: 4, xp: 1450, weeklyXp: 1450, streak: 7 },
      quest: {
        title: "Epistles of Paul & Gospel Wisdom",
        desc: "Test your comprehension of Romans, Corinthians, and timeless apostolic teachings.",
        questions: 10, minutes: 5, xpPerQ: 100,
      },
      categories: [
        { id: "ot", name: "Old Testament Legends", sub: "Moses, David & Kings", quizzes: 24, xpMax: 850 },
        { id: "parables", name: "Parables of Jesus", sub: "Stories of Grace & Mercy", quizzes: 18, xpMax: 900 },
        { id: "acts", name: "Acts & Early Church", sub: "Pentecost to Antioch", quizzes: 15, xpMax: 700 },
        { id: "prophecy", name: "Prophecies & Revelation", sub: "Visions of St. John", quizzes: 12, xpMax: 1200 },
      ],
      questions: [
        { q: "Who wrote the Epistle to the Romans?", opts: ["Peter", "Paul", "John", "James"], answer: 1, ref: "Romans 1:1" },
        { q: "In which city was Paul when he wrote 1 Corinthians?", opts: ["Ephesus", "Athens", "Rome", "Antioch"], answer: 0, ref: "1 Cor 16:8" },
        { q: "\u201CThe wages of sin is death\u201D appears in which chapter of Romans?", opts: ["Romans 3", "Romans 5", "Romans 6", "Romans 8"], answer: 2, ref: "Romans 6:23" },
        { q: "Which couple lied to the Holy Spirit in Acts 5?", opts: ["Aquila & Priscilla", "Ananias & Sapphira", "Felix & Drusilla", "Andronicus & Junia"], answer: 1, ref: "Acts 5:1-10" },
        { q: "How many chapters are in the Gospel of John?", opts: ["16", "21", "24", "28"], answer: 1, ref: "John" },
      ],
      leaderboard: [
        { name: "Abiodun D.", xp: 2840, streak: 12 },
        { name: "Grace O.", xp: 2310, streak: 9 },
        { name: "Emmanuel T.", xp: 1985, streak: 11 },
        { name: "Member", xp: 1450, streak: 7, me: true },
        { name: "Funke A.", xp: 1320, streak: 5 },
        { name: "David S.", xp: 1140, streak: 6 },
      ],
    },
    gallery: {
      albums: [
        { id: 1, title: "Easter Resurrection Celebration", meta: "April 2026 \u2022 Sanctuary Hall", photos: 24, featured: true, tag: "Worship" },
        { id: 2, title: "8th Anniversary Service", meta: "September 2026", photos: 48, tag: "Celebration" },
        { id: 3, title: "Youth Evangelism Outreach", meta: "Alagbado Streets", photos: 36, tag: "Outreach" },
        { id: 4, title: "Praise Night", meta: "Monthly Vigil", photos: 18, tag: "Worship" },
      ],
      photos: [
        { id: 1, album: "Easter Resurrection Celebration", title: "Living Praise", sub: "Choir & Orchestra", likes: 142, tag: "Worship" },
        { id: 2, album: "Easter Resurrection Celebration", title: "Grace Abounding", sub: "Pastor Abiodun", likes: 183, tag: "Sermon" },
        { id: 3, album: "Youth Evangelism Outreach", title: "Food Share", sub: "500 Families Served", likes: 98, tag: "Outreach" },
        { id: 4, album: "Praise Night", title: "Camp Ignite", sub: "Praise Retreat", likes: 167, tag: "Worship" },
        { id: 5, album: "8th Anniversary Service", title: "Reborn in Faith", sub: "Thanksgiving Pool", likes: 215, tag: "Baptism" },
        { id: 6, album: "Praise Night", title: "Silent Night", sub: "Candlelight Vigil", likes: 312, tag: "Vigil" },
      ],
    },
    notifications: [
      { id: 1, title: "Midweek Bible Study tonight at 6:00 PM", time: "2h ago", unread: true },
      { id: 2, title: "New sermon clip: \u201CBefore You Rise\u201D", time: "1d ago", unread: true },
      { id: 3, title: "Praise Night this Friday \u2014 invite a friend", time: "3d ago", unread: false },
    ],
  };

  /* ---------------- WordPress REST client (live mode) ---------------- */
  async function wp(path, opts = {}) {
    const res = await fetch(CFG.WP_JSON + path, {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });
    if (!res.ok) throw new Error("Request failed: " + res.status);
    return res.json();
  }
  function authHeaders() {
    const s = Api.session();
    if (s && s.appPassword) {
      return { Authorization: "Basic " + btoa(s.username + ":" + s.appPassword) };
    }
    return {};
  }

  /* ---------------- Public API ---------------- */
  const Api = {
    get useMock() { return CFG.USE_MOCK; },

    /* --- session --- */
    session() {
      try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); } catch { return null; }
    },
    saveSession(s) { localStorage.setItem(LS_SESSION, JSON.stringify(s)); },
    clearSession() { localStorage.removeItem(LS_SESSION); },

    async login(email, password) {
      if (CFG.USE_MOCK) {
        if (!email || !password) throw new Error("Enter your email and password.");
        const s = { name: email.split("@")[0].replace(/[._]/g, " "), email, username: email };
        this.saveSession(s); return s;
      }
      // Live: validate via Application Password against wp/v2/users/me.
      const me = await wp("/wp/v2/users/me", { headers: { Authorization: "Basic " + btoa(email + ":" + password) } });
      const s = { name: me.name, email, username: email, appPassword: password, wpId: me.id };
      this.saveSession(s); return s;
    },
    async register(name, email, password) {
      if (!name || !email || !password) throw new Error("Please fill in all fields.");
      if (CFG.USE_MOCK) {
        const s = { name, email, username: email };
        this.saveSession(s); return s;
      }
      // Live: custom endpoint to be added in movaldem-core (WP blocks public registration by default).
      const r = await wp("/movaldem/v1/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      const s = { name: r.name, email, username: email, appPassword: r.app_password, wpId: r.id };
      this.saveSession(s); return s;
    },
    logout() { this.clearSession(); },

    /* --- content --- */
    async verse() {
      if (CFG.USE_MOCK) return MOCK.verse;
      return wp("/movaldem/v1/verse").catch(() => MOCK.verse);
    },
    async programs() {
      if (CFG.USE_MOCK) return MOCK.programs;
      const list = await wp("/wp/v2/program?per_page=20&_fields=id,title,excerpt,meta");
      return list.map((p) => ({ id: p.id, title: p.title.rendered, desc: (p.excerpt.rendered || "").replace(/<[^>]+>/g, ""), day: p.meta?.day || "", time: p.meta?.time || "", venue: p.meta?.venue || "", tag: "Program" }));
    },
    async events() {
      if (CFG.USE_MOCK) return MOCK.events;
      const list = await wp("/wp/v2/event?per_page=20&_fields=id,title,excerpt,meta");
      return list.map((e) => ({ id: e.id, title: e.title.rendered, desc: (e.excerpt.rendered || "").replace(/<[^>]+>/g, ""), date: e.meta?.date || "", time: e.meta?.time || "", venue: e.meta?.venue || "", tag: "Event", seats: e.meta?.seats ?? null }));
    },
    async gallery() {
      if (CFG.USE_MOCK) return MOCK.gallery;
      const albums = await wp("/wp/v2/gallery_album?per_page=20").catch(() => []);
      return { albums: albums.map((a) => ({ id: a.id, title: a.title.rendered, meta: "", photos: 0, tag: "Album" })), photos: [] };
    },

    /* --- quiz --- */
    async quizHome() {
      if (CFG.USE_MOCK) return MOCK.quiz;
      const [quest, board, cats] = await Promise.all([
        wp("/movaldem/v1/quiz/today", { headers: authHeaders() }).catch(() => null),
        wp("/movaldem/v1/quiz/leaderboard").catch(() => []),
        wp("/movaldem/v1/quiz/categories").catch(() => []),
      ]);
      return {
        me: MOCK.quiz.me, quest: quest || MOCK.quiz.quest,
        categories: cats.length ? cats : MOCK.quiz.categories,
        leaderboard: board.length ? board : MOCK.quiz.leaderboard,
        questions: MOCK.quiz.questions,
      };
    },
    async submitQuiz(score, total) {
      if (CFG.USE_MOCK) return { xp: score * 100, streak: MOCK.quiz.me.streak + 1 };
      return wp("/movaldem/v1/quiz/submit", { method: "POST", headers: authHeaders(), body: JSON.stringify({ score, total }) });
    },

    /* --- push --- */
    async notifications() {
      if (CFG.USE_MOCK) return MOCK.notifications;
      return wp("/movaldem/v1/notifications", { headers: authHeaders() }).catch(() => []);
    },
    async registerDevice(token) {
      try { localStorage.setItem(LS_DEVICE, token); } catch {}
      if (CFG.USE_MOCK || !CFG.PUSH_ENABLED) return { ok: true, mock: true };
      return wp("/movaldem/v1/devices", { method: "POST", headers: authHeaders(), body: JSON.stringify({ token, platform: "android" }) }).catch(() => ({ ok: false }));
    },
  };

  window.MovaldemApi = Api;
})();
