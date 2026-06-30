/* ============================================================
   FlowFix Plumbing & Heating — vanilla JS
   No dependencies. All features progressive-enhancement safe.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Year ---------- */
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- (a) Mobile nav / hamburger ---------- */
  var hamburger = $("#hamburger");
  var nav = $("#main-nav");
  var backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  function setNav(open) {
    if (!nav || !hamburger) return;
    nav.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    document.body.classList.toggle("nav-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });
    backdrop.addEventListener("click", function () { setNav(false); });
    $$("#main-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false); hamburger.focus();
      }
    });
  }

  /* ---------- (b) Services cards ---------- */
  var services = [
    { id: "boilers", icon: "🔥", title: "Boiler repairs & installs",
      desc: "Gas Safe boiler repairs, servicing and new energy-efficient boilers fitted with up to 10-year warranties.",
      from: "£89", note: "repair" },
    { id: "leaks", icon: "💧", title: "Leak detection & repair",
      desc: "Hidden leaks, dripping taps, burst pipes and overflow issues traced and fixed without ripping your house apart.",
      from: "£75", note: "call-out" },
    { id: "bathrooms", icon: "🛁", title: "Bathroom installations",
      desc: "Full bathroom design and fit, from a simple shower swap to a complete renovation, project-managed start to finish.",
      from: "£1,450", note: "supply & fit" },
    { id: "drains", icon: "🌀", title: "Blocked drains & toilets",
      desc: "Fast clearance of blocked sinks, toilets and outside drains using rods, jetting and CCTV where needed.",
      from: "£69", note: "clearance" },
    { id: "heating", icon: "♨️", title: "Heating & radiators",
      desc: "Cold radiators, power flushes, thermostat upgrades and full central-heating system installs.",
      from: "£95", note: "diagnosis" },
    { id: "emergency", icon: "🚨", title: "24/7 emergency call-out",
      desc: "Burst pipe at midnight? No heating with kids in the house? We answer day and night, every day of the year.",
      from: "£99", note: "24/7", tag: "Always open", emergency: true }
  ];
  var grid = $("#services-grid");
  if (grid) {
    grid.innerHTML = services.map(function (s) {
      return '' +
        '<article class="svc-card' + (s.emergency ? " is-emergency" : "") + '">' +
        (s.tag ? '<span class="svc-tag">' + s.tag + '</span>' : '') +
        '<div class="svc-icon" aria-hidden="true">' + s.icon + '</div>' +
        '<h3>' + s.title + '</h3>' +
        '<p>' + s.desc + '</p>' +
        '<p class="svc-from">From <span class="amt">' + s.from + '</span> · ' + s.note + '</p>' +
        '</article>';
    }).join("");
  }

  /* ---------- (c) Instant quote estimator ---------- */
  var quoteForm = $("#quote-form");
  if (quoteForm) {
    var prices = {
      tap:           { lo: 75,   hi: 140,  label: "Tap / valve replacement" },
      leak:          { lo: 90,   hi: 280,  label: "Leak detection & repair" },
      drain:         { lo: 69,   hi: 190,  label: "Blocked drain or toilet" },
      "boiler-repair":{ lo: 89,  hi: 320,  label: "Boiler repair" },
      "boiler-service":{ lo: 75, hi: 110,  label: "Boiler service" },
      "boiler-install":{ lo: 1850, hi: 3200, label: "New boiler installation" },
      bathroom:      { lo: 2800, hi: 6500, label: "Full bathroom installation" },
      radiator:      { lo: 95,   hi: 360,  label: "Radiator / heating fault" }
    };
    var urgencyMult = { planned: 1, soon: 1.1, emergency: 1.35 };
    var urgencyNote = {
      planned: "Booked at your convenience.",
      soon: "Priority slot within a few days (+10%).",
      emergency: "Same-day emergency response (+35%)."
    };
    function gbp(n) { return "£" + Math.round(n).toLocaleString("en-GB"); }

    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var job = $("#q-job").value;
      var err = $("#quote-err");
      var result = $("#quote-result");
      if (!job) {
        err.hidden = false;
        $("#q-job").setAttribute("aria-invalid", "true");
        $("#q-job").focus();
        return;
      }
      err.hidden = true;
      $("#q-job").removeAttribute("aria-invalid");
      var urgency = (quoteForm.querySelector('input[name="urgency"]:checked') || {}).value || "planned";
      var p = prices[job];
      var m = urgencyMult[urgency];
      $("#qr-price").textContent = gbp(p.lo * m) + " – " + gbp(p.hi * m);
      $("#qr-note").textContent = p.label + ". " + urgencyNote[urgency] +
        " Guide price only — confirmed before any work begins.";
      var cta = $("#qr-cta");
      if (urgency === "emergency") {
        cta.textContent = "Call now for emergency help";
      } else {
        cta.textContent = "Call to confirm & book";
      }
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ---------- (d) Service-area postcode checker ---------- */
  var pcForm = $("#postcode-form");
  if (pcForm) {
    // outward code -> ETA minutes
    var covered = {
      LS1: 20, LS2: 20, LS3: 20, LS4: 18, LS5: 16, LS6: 14, LS7: 10, LS8: 16,
      LS9: 20, LS10: 24, LS11: 22, LS12: 22, LS13: 24, LS14: 26, LS15: 28,
      LS16: 18, LS17: 18, LS18: 16, LS25: 30, LS26: 28, LS27: 26, LS28: 22,
      BD11: 30, WF3: 30
    };
    pcForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#pc-input");
      var box = $("#pc-result");
      var raw = (input.value || "").toUpperCase().replace(/\s+/g, "").trim();
      if (!raw) {
        input.setAttribute("aria-invalid", "true"); input.focus();
        box.hidden = false; box.className = "pc-result no";
        box.innerHTML = '<span class="pc-ico" aria-hidden="true">✏️</span><div>Please enter a postcode so we can check your area.</div>';
        return;
      }
      input.removeAttribute("aria-invalid");
      // extract outward code: letters + digits before the final 3 chars
      var outward = raw.length > 3 ? raw.slice(0, raw.length - 3) : raw;
      var m = outward.match(/^[A-Z]{1,2}\d{1,2}/);
      var key = m ? m[0] : outward;
      box.hidden = false;
      if (covered[key]) {
        var eta = covered[key];
        box.className = "pc-result ok";
        box.innerHTML = '<span class="pc-ico" aria-hidden="true">✅</span><div><strong>' + key +
          ' — you\'re covered!</strong><small>Typical response: around ' + eta +
          ' minutes for emergencies. <a href="tel:+441134601188">Call 0113 460 1188</a> to book.</small></div>';
      } else {
        box.className = "pc-result no";
        box.innerHTML = '<span class="pc-ico" aria-hidden="true">📍</span><div><strong>' + key +
          ' is just outside our standard area.</strong><small>We may still be able to help, especially for larger jobs. ' +
          'Give us a ring on <a href="tel:+441134601188">0113 460 1188</a> and we\'ll let you know.</small></div>';
      }
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ---------- (e) Reviews wall ---------- */
  var reviews = [
    { n: "Sarah M.", a: "Headingley (LS6)", t: "Boiler died on the coldest week of the year. FlowFix came out same day, diagnosed it in minutes and had us warm again by tea time. Honest about what needed doing — no upselling.", s: 5, c: "#0b4f8a" },
    { n: "James T.", a: "Roundhay (LS8)", t: "Full bathroom refit. Tidy, polite, turned up when they said and the finish is spot on. Price matched the quote exactly. Couldn't recommend more.", s: 5, c: "#1379c9" },
    { n: "Priya K.", a: "Chapel Allerton (LS7)", t: "Slow leak under the kitchen sink three other plumbers couldn't find. FlowFix traced it without making a mess and fixed it in an hour.", s: 5, c: "#e8650a" },
    { n: "Mark D.", a: "Horsforth (LS18)", t: "Blocked drain on a Sunday night. Answered straight away and sorted it within the hour. Fair price for a weekend call-out.", s: 5, c: "#1f9d55" },
    { n: "Elaine R.", a: "Morley (LS27)", t: "New combi boiler fitted. Talked me through the options without any pressure and registered the warranty for me. Lovely lads.", s: 5, c: "#0e64ad" },
    { n: "Tom B.", a: "Pudsey (LS28)", t: "Radiators stone cold upstairs. Power flush sorted the lot and the house heats up twice as fast now. Proper job.", s: 4, c: "#56b4e9" }
  ];
  function starStr(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }
  var wall = $("#reviews-wall");
  if (wall) {
    wall.innerHTML = reviews.map(function (r) {
      var initials = r.n.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2);
      return '' +
        '<article class="review">' +
        '<div class="stars" aria-label="' + r.s + ' out of 5 stars">' + starStr(r.s) + '</div>' +
        '<p class="review-text">"' + r.t + '"</p>' +
        '<div class="review-foot">' +
        '<span class="review-av" aria-hidden="true" style="background:' + r.c + '">' + initials + '</span>' +
        '<span class="review-meta"><strong>' + r.n + '</strong><span>' + r.a + '</span></span>' +
        '<span class="verified" title="Verified customer">✓ Verified</span>' +
        '</div></article>';
    }).join("");
  }

  /* ---------- Contact form validation + in-page success ---------- */
  var cForm = $("#contact-form");
  if (cForm) {
    var showErr = function (id, show) {
      var field = $("#" + id);
      var msg = cForm.querySelector('.err[data-for="' + id + '"]');
      if (field) field.setAttribute("aria-invalid", show ? "true" : "false");
      if (msg) msg.hidden = !show;
    };
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var phoneOk = function (v) { return v.replace(/[^\d]/g, "").length >= 7; };

    cForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = $("#c-name").value.trim();
      var phone = $("#c-phone").value.trim();
      var email = $("#c-email").value.trim();
      var msg = $("#c-msg").value.trim();

      if (!name) { showErr("c-name", true); ok = false; } else showErr("c-name", false);
      if (!phoneOk(phone)) { showErr("c-phone", true); ok = false; } else showErr("c-phone", false);
      if (email && !emailOk(email)) { showErr("c-email", true); ok = false; } else showErr("c-email", false);
      if (!msg) { showErr("c-msg", true); ok = false; } else showErr("c-msg", false);

      if (!ok) {
        var firstBad = cForm.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      cForm.querySelectorAll("input,textarea,button").forEach(function (el) { el.disabled = true; });
      var success = $("#contact-success");
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      success.focus();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hide call bar near footer (avoid overlap) ---------- */
  var callbar = $("#callbar");
  var footer = $(".site-footer");
  if (callbar && footer && "IntersectionObserver" in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        callbar.style.transform = en.isIntersecting ? "translateY(120%)" : "translateY(0)";
        callbar.style.transition = "transform .3s ease";
      });
    }, { threshold: 0.05 });
    fo.observe(footer);
  }
})();
