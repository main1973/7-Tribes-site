/* 7TRB visitor counter: tracks this browser's site sessions only. */
(function () {
  "use strict";

  var counter = document.getElementById("visitor-count");
  if (!counter) return;

  var totalKey = "7trb_device_visit_sessions_v1";
  var sessionKey = "7trb_device_visit_recorded_v1";

  try {
    var total = Number(window.localStorage.getItem(totalKey));
    if (!Number.isFinite(total) || total < 0) total = 0;

    if (!window.sessionStorage.getItem(sessionKey)) {
      total += 1;
      window.localStorage.setItem(totalKey, String(total));
      window.sessionStorage.setItem(sessionKey, "1");
    }

    counter.textContent = "Your visits: " + total.toLocaleString();
    counter.setAttribute("aria-label", "This browser has visited 7TRB.com " + total.toLocaleString() + " times.");
  } catch (error) {
    counter.textContent = "Your visits: unavailable";
  }
})();
