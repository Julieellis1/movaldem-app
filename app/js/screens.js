/* Movaldem Church App — screens. Each returns an HTML string.
   Rendered by the router in app.js into #screen. */
(function () {
  const C = window.MOVALDEM_CONFIG;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function appbar(title, sub, opts = {}) {
    return `
    <div class="appbar">
      <div class="brand">
        <img src="assets/logo.png" alt="Movaldem logo" onerror="this.style.display='none'"/>
        <div><b>Movaldem</b><small>${esc(sub)}</small></div>
      </div>
      ${opts.bell === false ? "" : `
      <button class="icon-btn" data-nav="notifications" aria-label="Notifications">
        <span class="material-symbols-outlined">notifications</span>
        ${opts.unread ? '<span class="ping"></span>' : ""}
      </button>`}
      <button class="icon-btn" data-nav="profile" aria-label="Profile">
        <span class="material-symbols-outlined">person</span>
      </button>
    </div>`;
  }

  /* ---------------- Auth ---------------- */
  /* Brand splash (clinic-style): logo fades/pops in, then the church's
     full name types itself out. app.js advances when typing finishes. */
  function splash() {
    return `
    <div class="splash-wrap">
      <img class="splash-logo" src="assets/logo.png" alt="Movaldem logo"/>
      <p class="splash-name"><span id="splash-typed"></span><span class="splash-cursor">&#9612;</span></p>
    </div>`;
  }

  function welcome() {
    return `
    <div class="auth-wrap"><div class="auth-card">
      <img src="assets/logo.png" alt="Movaldem logo"/>
      <h1>Movaldem</h1>
      <p class="full">${esc(C.CHURCH_FULL_NAME)}</p>
      <p class="sub" style="color:rgba(242,241,236,.75);font-style:italic;font-family:var(--font-display);font-size:1.05rem;margin-bottom:1.8rem">
        &ldquo;Upon this rock I will build my church&hellip;&rdquo;<br/><span style="font-size:.75rem;font-family:var(--font-ui);font-style:normal">MATTHEW 16:18</span>
      </p>
      <button class="btn btn-gold" data-nav="register">Get Started</button>
      <div style="height:.7rem"></div>
      <button class="btn btn-ghost" data-nav="login" style="color:var(--gold);border-color:rgba(200,155,60,.5)">I Have an Account</button>
    </div></div>`;
  }

  function login(err = "") {
    return `
    <div class="auth-wrap"><div class="auth-card" style="text-align:left">
      <div style="text-align:center"><img src="assets/logo.png" alt="Movaldem logo"/>
      <h1>Welcome Back</h1>
      <p class="full">SIGN IN TO YOUR ACCOUNT</p></div>
      ${err ? `<div class="auth-err">${esc(err)}</div>` : ""}
      <form id="login-form">
        <div class="field"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required/></div>
        <div class="field"><label>Password</label><input name="password" type="password" placeholder="••••••••" required/></div>
        <button class="btn btn-gold" type="submit">Sign In</button>
      </form>
      <p class="auth-alt" style="text-align:center">New to Movaldem? <a data-nav="register" style="cursor:pointer">Create an account</a></p>
    </div></div>`;
  }

  function register(err = "") {
    return `
    <div class="auth-wrap"><div class="auth-card" style="text-align:left">
      <div style="text-align:center"><img src="assets/logo.png" alt="Movaldem logo"/>
      <h1>Join the Family</h1>
      <p class="full">CREATE YOUR ACCOUNT</p></div>
      ${err ? `<div class="auth-err">${esc(err)}</div>` : ""}
      <form id="register-form">
        <div class="field"><label>Full Name</label><input name="name" type="text" placeholder="Your full name" required/></div>
        <div class="field"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required/></div>
        <div class="field"><label>Phone</label><input name="phone" type="tel" placeholder="+234 ..." /></div>
        <div class="field"><label>Password</label><input name="password" type="password" placeholder="Choose a password" required/></div>
        <button class="btn btn-gold" type="submit">Create Account</button>
      </form>
      <p class="auth-alt" style="text-align:center">Already a member? <a data-nav="login" style="cursor:pointer">Sign in</a></p>
    </div></div>`;
  }

  /* ---------------- Home ---------------- */
  function home(data, session) {
    const first = esc((session?.name || "Friend").split(" ")[0]);
    const d = new Date();
    const dateStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const target = Date.now() + (3 * 86400 + 14 * 3600 + 28 * 60 + 41) * 1000;
    const n = data.notifications.find((x) => x.unread);
    return `
    ${appbar("Movaldem", "Home & Radio", { unread: data.notifications.some((x) => x.unread) })}
    ${n ? `<div class="notif"><span class="material-symbols-outlined">campaign</span><div><b>Reminder:</b> ${esc(n.title)}<small>${esc(n.time)}</small></div></div>` : ""}
    <p class="eyebrow" style="margin-top:.6rem">Welcome</p>
    <h1 class="h-display">Welcome back, ${first}</h1>
    <p class="sub">May the quiet peace of Christ dwell within your heart today. &mdash; <span style="float:right">${esc(dateStr)}</span></p>

    <div class="section"><div class="card verse-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="eyebrow">&#9733; Verse of the Day</span>
        <span style="display:flex;gap:.4rem;color:var(--gold-deep)">
          <span class="material-symbols-outlined" style="font-size:18px">bookmark</span>
          <span class="material-symbols-outlined" style="font-size:18px">share</span>
        </span>
      </div>
      <blockquote>${esc(data.verse.text)}</blockquote>
      <div class="ref">${esc(data.verse.ref)} (KJV)</div>
      <div class="note">${esc(data.verse.note)}</div>
    </div></div>

    <div class="section">
      <div class="card dark radio-card">
        <div class="radio-top">
          <div>
            <span class="live-badge"><span class="dot"></span>LIVE</span>
            <span style="font-size:.68rem;color:rgba(242,241,236,.7);margin-left:.4rem">192kbps HD Audio</span>
          </div>
          <div style="margin-left:auto;font-size:.68rem;color:var(--gold)">&#128266; Movaldem Radio</div>
        </div>
        <div style="padding:0 1rem">
          <div class="radio-meta">
            <div class="station">MOVALDEM RADIO</div>
            <div class="show" id="radio-show">Morning Glory</div>
            <div class="host">Host: Movaldem Media &bull; Live Hymns &amp; Word</div>
          </div>
        </div>
        <div class="radio-ctrl">
          <div class="eq paused" id="radio-eq"><i></i><i></i><i></i><i></i></div>
          <button class="play-btn" id="radio-play" aria-label="Play radio">
            <span class="material-symbols-outlined" id="radio-play-icon">play_arrow</span>
          </button>
          <div class="vol"><span class="material-symbols-outlined">volume_up</span><input type="range" id="radio-vol" min="0" max="100" value="80"/></div>
        </div>
        <div style="padding:0 1rem 1rem;font-size:.72rem;color:var(--gold)">
          <span class="eyebrow" style="color:var(--gold)">Coming up on Movaldem Radio</span>
          <span style="float:right;color:rgba(242,241,236,.7)">Full Lineup &rsaquo;</span>
          <div style="margin-top:.3rem;color:rgba(242,241,236,.85)"><b>11:00 AM</b> &nbsp;Grace Upon Grace &mdash; Devotional</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2 class="h-head">Church Gateways</h2><a class="link-gold" data-nav="events" style="cursor:pointer">Quick Connect</a></div>
      <div class="ql-grid">
        <a class="ql" data-nav="events" style="cursor:pointer"><div class="top"><span class="material-symbols-outlined">event</span><span class="material-symbols-outlined">arrow_outward</span></div><b>Programs</b><small>Weekly gatherings</small></a>
        <a class="ql" data-nav="events" style="cursor:pointer"><div class="top"><span class="material-symbols-outlined">celebration</span><span class="material-symbols-outlined">arrow_outward</span></div><b>Events</b><small>Special meetings</small></a>
        <a class="ql" data-nav="quiz" style="cursor:pointer"><div class="top"><span class="material-symbols-outlined">quiz</span><span class="material-symbols-outlined">arrow_outward</span></div><b>Bible Quiz</b><small>Daily challenge</small></a>
        <a class="ql" data-nav="gallery" style="cursor:pointer"><div class="top"><span class="material-symbols-outlined">photo_library</span><span class="material-symbols-outlined">arrow_outward</span></div><b>Gallery</b><small>Moments &amp; clips</small></a>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="eyebrow">&#9679; Upcoming Service</span>
          <span class="ev-day"><b>FRI</b><span>Night</span></span>
        </div>
        <h3 class="h-head" style="margin:.4rem 0">Praise Night &bull; Monthly Vigil</h3>
        <p class="sub">In-person sanctuary gathering &amp; global radio broadcast.</p>
        <div class="countdown" data-countdown="${target}">
          <div class="cd"><b data-cd="d">03</b><span>Days</span></div>
          <div class="cd"><b data-cd="h">14</b><span>Hours</span></div>
          <div class="cd"><b data-cd="m">28</b><span>Mins</span></div>
          <div class="cd"><b data-cd="s">41</b><span>Secs</span></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-gold" data-toast="Reminder set for Praise Night"><span class="material-symbols-outlined">calendar_month</span>Set Reminder</button>
          <button class="btn btn-ghost" data-nav="events">Order of Service</button>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="display:flex;gap:.8rem;align-items:center">
        <div class="avatar" style="background:linear-gradient(135deg,var(--maroon),#8f485b)">P</div>
        <div><p class="eyebrow">Community Thought</p>
        <p style="font-family:var(--font-display);font-style:italic;font-size:1rem;line-height:1.5">&ldquo;When we sing together, the distance dissolves and heaven leans close.&rdquo;</p>
        <small class="sub">&mdash; Pastor Abiodun D. Durowoju</small></div>
      </div>
    </div>`;
  }

  /* ---------------- Programs & Events ---------------- */
  function programCard(p) {
    const day = p.day.split(" ")[0].toUpperCase().slice(0, 3);
    return `
    <div class="card ev"><div class="ev-date">
      <div class="ev-day"><b>${esc(day)}</b><span>${esc(p.day.split(" ").slice(1).join(" ") || "Weekly")}</span></div>
      <div class="ev-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="ev-tag">${esc(p.tag)}</span>
          <span class="material-symbols-outlined" style="font-size:18px;color:var(--faint)">notifications</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <div class="ev-meta">
          <div><span class="material-symbols-outlined">schedule</span>${esc(p.time)}</div>
          <div><span class="material-symbols-outlined">location_on</span>${esc(p.venue)}</div>
        </div>
        <p class="sub" style="margin-bottom:.7rem">${esc(p.desc)}</p>
        <div class="btn-row">
          <button class="btn btn-dark" data-toast="Added to your calendar: ${esc(p.title)}"><span class="material-symbols-outlined">calendar_month</span>Add to Calendar</button>
          <button class="icon-btn" data-toast="Link copied" aria-label="Share"><span class="material-symbols-outlined">share</span></button>
        </div>
      </div>
    </div></div>`;
  }

  function eventCard(e, special = false) {
    return `
    <div class="card ev ${special ? "ev-special" : ""}"><div class="ev-date">
      <div class="ev-day"><b>${esc(e.date.slice(8))}</b><span>${esc(new Date(e.date + "T00:00").toLocaleDateString("en-US", { month: "short" }))}</span></div>
      <div class="ev-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="ev-tag">${esc(e.tag)}</span>
          ${e.seats ? `<span style="font-size:.68rem;color:var(--gold);font-weight:700">${e.seats} seats left</span>` : ""}
        </div>
        <h3>${esc(e.title)}</h3>
        <div class="ev-meta">
          <div><span class="material-symbols-outlined">schedule</span>${esc(e.time)}</div>
          <div><span class="material-symbols-outlined">location_on</span>${esc(e.venue)}</div>
        </div>
        <p class="sub" style="margin-bottom:.7rem;${special ? "color:rgba(242,241,236,.8)" : ""}">${esc(e.desc)}</p>
        <button class="btn ${special ? "btn-gold" : "btn-dark"}" data-toast="You are registered: ${esc(e.title)}">
          <span class="material-symbols-outlined">confirmation_number</span>${e.seats ? "Reserve Your Seat" : "View Details"}
        </button>
      </div>
    </div></div>`;
  }

  function events(data, tab = "programs") {
    const isProg = tab === "programs";
    return `
    ${appbar("Movaldem", "Programs & Events")}
    <div class="tabs">
      <button class="tab2 ${isProg ? "active" : ""}" data-events-tab="programs"><span class="material-symbols-outlined">event_repeat</span>Weekly Gatherings</button>
      <button class="tab2 ${!isProg ? "active" : ""}" data-events-tab="special"><span class="material-symbols-outlined">celebration</span>Special Events</button>
    </div>
    ${isProg ? `
      <p class="eyebrow">Weekly Rhythms</p>
      <h2 class="h-head" style="margin-bottom:.2rem">Church Programs</h2>
      <p class="sub" style="margin-bottom:.8rem">Where two or three gather in His name (Matt 18:20)</p>
      ${data.programs.map(programCard).join("")}
    ` : `
      <p class="eyebrow">Mark Your Calendar</p>
      <h2 class="h-head" style="margin-bottom:.8rem">Upcoming Special Events</h2>
      ${data.events.map((e, i) => eventCard(e, i === 1)).join("")}
    `}`;
  }

  /* ---------------- Quiz ---------------- */
  function quiz(data, tab = "daily") {
    const me = data.quiz.me, q = data.quiz.quest;
    const isDaily = tab === "daily";
    const rankLabel = me.rank ? "#" + me.rank : "—";
    return `
    ${appbar("Movaldem", "Bible Quiz")}
    <div class="card dark" style="margin-top:.6rem"><div class="me-card">
      <div class="avatar">${esc(me.name[0] || "M")}</div>
      <div class="who"><b>${esc(me.name)} <span class="material-symbols-outlined">verified</span></b><small>Word Disciple &bull; Covenant Circle</small></div>
      <span class="live-badge" style="background:var(--gold);color:#fff">${rankLabel}</span>
    </div><div class="stat3">
      <div class="stat"><b>${rankLabel}</b><span>Global Rank</span></div>
      <div class="stat"><b>${(me.xp || 0).toLocaleString()}</b><span>Weekly XP</span></div>
      <div class="stat"><b>${me.streak || 0} Days</b><span>Holy Streak</span></div>
    </div></div>

    <div class="tabs">
      <button class="tab2 ${isDaily ? "active" : ""}" data-quiz-tab="daily"><span class="material-symbols-outlined">menu_book</span>Daily Challenge</button>
      <button class="tab2 ${!isDaily ? "active" : ""}" data-quiz-tab="board"><span class="material-symbols-outlined">leaderboard</span>Leaderboard</button>
    </div>

    ${isDaily ? `
    ${q ? `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
        <span class="eyebrow">&#9679; Today's Holy Scripture Quest</span>
        <small class="sub">Expires in 6h</small>
      </div>
      <h2 class="h-display" style="font-size:1.5rem">${esc(q.title)}</h2>
      <p class="sub" style="margin:.4rem 0">${esc(q.desc)}</p>
      <div class="quest-facts">
        <div class="qf"><span class="material-symbols-outlined">help</span><b>${q.questions} Verses</b><span>Questions</span></div>
        <div class="qf"><span class="material-symbols-outlined">timer</span><b>${q.minutes} Mins</b><span>Timed</span></div>
        <div class="qf"><span class="material-symbols-outlined">add_circle</span><b>+${q.xpPerQ} XP</b><span>Per Answer</span></div>
      </div>
      <button class="btn btn-gold" data-nav="quiz/play"><span class="material-symbols-outlined">play_arrow</span>Start Quiz Now</button>
      <p style="text-align:center;font-size:.72rem;color:var(--gold-deep);font-weight:700;margin-top:.5rem">Up to +${(q.questions * q.xpPerQ).toLocaleString()} XP</p>
    </div>` : `
    <div class="card" style="text-align:center;padding:2rem 1.2rem">
      <span class="material-symbols-outlined" style="font-size:40px;color:var(--gold-deep)">check_circle</span>
      <h2 class="h-display" style="font-size:1.4rem;margin:.6rem 0 .3rem">Quest Complete</h2>
      <p class="sub">You've finished today's challenge. Come back tomorrow for a fresh set of ten.</p>
      <button class="btn btn-dark" data-quiz-tabgo="board" style="margin-top:.8rem"><span class="material-symbols-outlined">leaderboard</span>View Leaderboard</button>
    </div>`}
    <div class="section"><div class="card" style="display:flex;gap:.8rem;align-items:center">
      <div class="avatar" style="background:linear-gradient(135deg,var(--maroon),#8f485b)"><span class="material-symbols-outlined">local_fire_department</span></div>
      <div style="flex:1"><b style="font-size:.88rem">Streak Milestone: ${me.streak}/10 Days</b>
        <div class="q-progress" style="margin:.4rem 0"><i style="width:${me.streak * 10}%"></i></div>
        <small class="sub">${10 - me.streak} days away from unlocking the Sacred Scholar badge</small></div>
      <b style="color:var(--maroon);font-size:.8rem">+250 XP</b>
    </div></div>
    <div class="section">
      <div class="section-head"><h2 class="h-head">Scripture Categories</h2><span class="link-gold">${data.quiz.categories.length} tracks ready</span></div>
      <div class="cat-grid">
        ${data.quiz.categories.map((c) => `
        <a class="card cat" data-nav="quiz/play" style="cursor:pointer">
          <div class="cat-art"><span class="cnt">${c.quizzes} Quizzes</span><span class="material-symbols-outlined">menu_book</span></div>
          <div class="cat-body"><b>${esc(c.name)}</b><small>${esc(c.sub)}</small>
            <div class="cat-foot"><span>&#9733; ${c.xpMax} XP max</span><span class="material-symbols-outlined">arrow_forward</span></div>
          </div>
        </a>`).join("")}
      </div>
    </div>` : `
    <div class="section" style="margin-top:.4rem"><div class="card">
      <div class="section-head"><h2 class="h-head">Covenant Leaderboard</h2><span class="link-gold">This week</span></div>
      ${data.quiz.leaderboard.map((u, i) => `
      <div class="lb-row ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""} ${u.me ? "me" : ""}">
        <div class="lb-rank">${i + 1}</div>
        <div class="who"><b>${esc(u.name)} ${u.me ? "(You)" : ""}</b><small>${u.streak}-day streak</small></div>
        <div class="xp">${u.xp.toLocaleString()} XP</div>
      </div>`).join("")}
    </div>
    <p class="sub" style="text-align:center;margin-top:.8rem">Answer daily quests to climb the ranks and earn the Sacred Scholar badge.</p>`}`;
  }

  function quizPlay(q, idx, total, picked, live) {
    const letters = ["A", "B", "C", "D"];
    const locked = picked !== null && picked !== undefined;
    return `
    <div class="appbar">
      <button class="icon-btn" data-nav="quiz" aria-label="Quit quiz"><span class="material-symbols-outlined">close</span></button>
      <div class="brand"><div><b>Daily Challenge</b><small>Question ${idx + 1} of ${total}</small></div></div>
      <span class="q-timer"><span class="material-symbols-outlined">timer</span><span id="q-clock">5:00</span></span>
    </div>
    <div class="q-progress"><i style="width:${(idx / total) * 100}%"></i></div>
    <div class="card q-card">
      <span class="eyebrow">${live ? "Answer carefully — graded when you finish" : "Choose the right answer"}</span>
      <h2>${esc(q.q)}</h2>
      ${q.opts.map((o, i) => {
        let cls = "";
        if (locked) {
          if (!live && i === q.answer) cls = "correct";
          else if (i === picked) cls = live ? "selected" : "wrong";
        }
        return `<button class="opt ${cls}" data-pick="${i}" ${locked ? "disabled" : ""}>
          <span class="key">${letters[i]}</span><span>${esc(o)}</span></button>`;
      }).join("")}
      ${locked && !live ? `<p class="q-ref">&#10003; ${esc(q.ref)}</p>` : ""}
      ${locked && live ? `<p class="q-ref">Answer locked in.</p>` : ""}
    </div>
    <div style="height:.8rem"></div>
    ${locked
      ? `<button class="btn btn-gold" id="q-next">${idx + 1 < total ? "Next Question" : "See Results"}<span class="material-symbols-outlined">arrow_forward</span></button>`
      : `<p class="sub" style="text-align:center">${live ? "Graded server-side when you finish" : "+100 XP per correct answer"}</p>`}`;
  }

  function quizResult(r) {
    const score = r.correct_count ?? r.score ?? 0;
    const total = r.total || 10;
    const xp = r.score ?? 0;
    const streak = r.streak_day ?? 0;
    const pct = total ? Math.round((score / total) * 100) : 0;
    const letters = ["A", "B", "C", "D"];
    return `
    <div class="appbar">
      <div class="brand"><div><b>Quiz Complete</b><small>Daily Challenge</small></div></div>
    </div>
    ${r.error ? `<div class="card" style="margin-top:.6rem"><p class="sub" style="text-align:center">Could not reach the server to grade your answers. Your picks were saved on this device — try again when you're online.</p></div>` : ""}
    <div class="card verse-card" style="margin-top:.6rem">
      <div class="avatar" style="margin:0 auto .6rem;background:linear-gradient(135deg,var(--gold),var(--gold-deep));width:72px;height:72px">
        <span class="material-symbols-outlined" style="font-size:34px">emoji_events</span>
      </div>
      <p class="eyebrow">Your Score</p>
      <h1 class="h-display">${score}/${total} &mdash; ${pct}%</h1>
      <p class="sub">${pct >= 80 ? "Excellent! The Word dwells richly in you." : pct >= 50 ? "Well done! Keep pressing into the Word." : "Good effort — tomorrow's quest awaits."}</p>
      <div class="stat3" style="margin-top:1rem">
        <div class="stat" style="background:var(--card-low);border-color:var(--line-soft)"><b style="color:var(--gold-deep)">+${xp} XP</b><span style="color:var(--muted)">Earned</span></div>
        <div class="stat" style="background:var(--card-low);border-color:var(--line-soft)"><b style="color:var(--gold-deep)">${streak} Days</b><span style="color:var(--muted)">Streak</span></div>
      </div>
      <div style="height:1rem"></div>
      <div class="btn-row">
        <button class="btn btn-dark" data-quiz-tabgo="board"><span class="material-symbols-outlined">leaderboard</span>Leaderboard</button>
        <button class="btn btn-gold" data-nav="home">Done</button>
      </div>
    </div>
    ${(r.review && r.review.length) ? `
    <div class="section"><div class="section-head"><h2 class="h-head">Review Your Answers</h2></div>
      ${r.review.map((q, i) => `
      <div class="card" style="margin-bottom:.6rem">
        <p style="font-size:.85rem;font-weight:700;margin:0 0 .5rem">${i + 1}. ${esc(q.text)}</p>
        ${q.options.map((o, oi) => {
          const isPick = oi === q.picked, isCorr = oi === q.correct;
          const cls = isCorr ? "correct" : (isPick ? "wrong" : "");
          return `<div class="opt ${cls}" style="cursor:default;margin-bottom:.4rem">
            <span class="key">${letters[oi] || ""}</span><span>${esc(o)}</span>
            ${isCorr ? `<span class="material-symbols-outlined" style="margin-left:auto;color:#2e7d4f">check_circle</span>` : ""}
          </div>`;
        }).join("")}
        ${q.ref ? `<p class="q-ref">${esc(q.ref)}</p>` : ""}
        ${q.note ? `<p class="sub" style="font-size:.78rem">${esc(q.note)}</p>` : ""}
      </div>`).join("")}
    </div>` : ""}`;
  }

  /* ---------------- Gallery ---------------- */
  function gallery(data, tab = "photos") {
    const isPhotos = tab === "photos";
    const feat = data.gallery.albums[0];
    return `
    ${appbar("Movaldem", "Gallery")}
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin:.6rem 0 .2rem">
      <div><p class="eyebrow">Movaldem Fellowship</p><h1 class="h-display">Memories &amp; Moments</h1></div>
      <button class="btn btn-gold" style="width:auto;min-height:40px;font-size:.78rem" data-toast="Photo upload coming soon"><span class="material-symbols-outlined">upload</span>Share Photo</button>
    </div>
    <div class="tabs">
      <button class="tab2 ${isPhotos ? "active" : ""}" data-gallery-tab="photos"><span class="material-symbols-outlined">photo_library</span>Photos</button>
      <button class="tab2 ${!isPhotos ? "active" : ""}" data-gallery-tab="clips"><span class="material-symbols-outlined">movie</span>Sermon Clips <span class="live-badge" style="background:var(--maroon)">4 New</span></button>
    </div>
    ${isPhotos ? `
    <div class="feat">
      <span class="pill">&#10022; Featured Album</span>
      <div style="position:absolute;top:.8rem;right:.8rem;background:rgba(14,42,32,.7);color:#fff;font-size:.66rem;font-weight:700;padding:.25rem .6rem;border-radius:999px">${feat.photos} Photos</div>
      <div class="meta">${esc(feat.meta)}</div>
      <h3>${esc(feat.title)} Highlights</h3>
      <p>Capturing the dawn vigil, thanksgiving praise and joyful fellowship.</p>
    </div>
    <div class="chips">
      <button class="chip active">All Photos</button><button class="chip">Sunday Services</button>
      <button class="chip">Baptism &amp; Dedication</button><button class="chip">Outreach</button><button class="chip">Vigils</button>
    </div>
    <div class="g-grid">
      ${data.gallery.photos.map((p) => `
      <div class="card g-item">
        <div class="g-art"><span class="tag">${esc(p.tag)}</span><span class="material-symbols-outlined">more_vert</span>
          <div><b>${esc(p.title)}</b><small>${esc(p.sub)}</small></div>
        </div>
        <div class="g-foot">
          <button data-like aria-label="Like"><span class="material-symbols-outlined">favorite</span><span>${p.likes}</span></button>
          <span style="margin-left:auto"></span>
          <button data-toast="Saved to device" aria-label="Download"><span class="material-symbols-outlined">download</span></button>
          <button data-toast="Link copied" aria-label="Share"><span class="material-symbols-outlined">share</span></button>
        </div>
      </div>`).join("")}
    </div>
    <div class="card" style="margin-top:1rem;display:flex;gap:.8rem;align-items:center">
      <span class="material-symbols-outlined" style="color:var(--gold-deep);font-size:28px">cloud_upload</span>
      <div style="flex:1"><b style="font-size:.88rem">Photographed Sunday?</b><p class="sub">Contribute captures to the sanctuary archive.</p></div>
      <button class="btn btn-dark" style="width:auto;min-height:40px;font-size:.78rem" data-toast="Photo upload coming soon">Upload</button>
    </div>` : `
    <div class="card" style="text-align:center;padding:2rem 1rem">
      <span class="material-symbols-outlined" style="font-size:40px;color:var(--gold-deep)">movie</span>
      <h3 class="h-head" style="margin:.5rem 0">Sermon Clips</h3>
      <p class="sub">Short, shareable moments from recent messages — powered by Movaldem TV on YouTube.</p>
      <div style="height:.8rem"></div>
      <button class="btn btn-gold" data-toast="Opening Movaldem TV"><span class="material-symbols-outlined">play_circle</span>Watch on YouTube</button>
    </div>`}`;
  }

  /* ---------------- Notifications ---------------- */
  function notifications(list) {
    return `
    <div class="appbar">
      <button class="icon-btn" data-nav="home" aria-label="Back"><span class="material-symbols-outlined">arrow_back</span></button>
      <div class="brand"><div><b>Notifications</b><small>Instant alerts</small></div></div>
    </div>
    <div class="section" style="margin-top:.4rem">
      ${list.map((n) => `
      <div class="notif ${n.unread ? "" : "read"}">
        <span class="material-symbols-outlined">${n.unread ? "campaign" : "notifications"}</span>
        <div><b style="font-size:.84rem">${esc(n.title)}</b><small>${esc(n.time)}</small></div>
      </div>`).join("")}
    </div>
    <p class="sub" style="text-align:center;margin-top:.6rem">Turn on push alerts in Profile to never miss a service or announcement.</p>`;
  }

  /* ---------------- Profile ---------------- */
  function profile(session) {
    const name = esc(session?.name || "Member");
    return `
    ${appbar("Movaldem", "Profile", { bell: false })}
    <div class="card dark" style="margin-top:.6rem"><div class="me-card">
      <div class="avatar">${esc(name[0] || "M")}</div>
      <div class="who"><b>${name}</b><small>${esc(session?.email || "")}</small></div>
    </div></div>
    <div class="section"><div class="prof-menu card" style="padding:0;overflow:hidden">
      <button class="pm-item" data-toast="Profile editing coming soon"><span class="material-symbols-outlined">edit</span>Edit Profile<span class="material-symbols-outlined go">chevron_right</span></button>
      <button class="pm-item" data-push-toggle><span class="material-symbols-outlined">notifications_active</span>Instant Alerts<span class="switch on" id="push-switch"></span></button>
      <button class="pm-item" data-toast="Daily verse reminder on"><span class="material-symbols-outlined">wb_sunny</span>Daily Verse Reminder<span class="switch on"></span></button>
      <button class="pm-item" data-toast="Link copied — invite your family"><span class="material-symbols-outlined">share</span>Invite a Friend<span class="material-symbols-outlined go">chevron_right</span></button>
      <button class="pm-item" data-toast="Opening WhatsApp"><span class="material-symbols-outlined">call</span>Contact the Church<span class="material-symbols-outlined go">chevron_right</span></button>
      <button class="pm-item" data-toast="Privacy policy coming soon"><span class="material-symbols-outlined">privacy_tip</span>Privacy<span class="material-symbols-outlined go">chevron_right</span></button>
    </div></div>
    <div class="section">
      <button class="btn btn-ghost" id="logout-btn"><span class="material-symbols-outlined">logout</span>Sign Out</button>
      <p class="sub" style="text-align:center;margin-top:1rem">${esc(C.CHURCH_ADDRESS)}<br/>${esc(C.CHURCH_PHONE)}</p>
    </div>`;
  }

  window.Screens = { splash, welcome, login, register, home, events, quiz, quizPlay, quizResult, gallery, notifications, profile };
})();
