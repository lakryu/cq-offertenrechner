/* ==========================================================================
   APP – Oberfläche, Offerte, Drucken, Preis-Editor
   ========================================================================== */
(function () {
  "use strict";
  const { r2, num } = window.CQ;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const chf = (x) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x || 0);
  const menge = (x) => new Intl.NumberFormat("de-CH", { maximumFractionDigits: 3 }).format(x || 0);
  const kopie = (o) => JSON.parse(JSON.stringify(o));
  const heute = () => new Date().toISOString().slice(0, 10);
  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ---------- Speicher (robust gegen blockiertes localStorage) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const K = { preise: "cq-preise-override", aktuell: "cq-offerte-aktuell", ansicht: "cq-ansicht" };

  /* ---------- Preise (Basis + lokale Änderungen) ---------- */
  const BASIS = kopie(window.PREISE);
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const basisHash = hash(JSON.stringify(BASIS));
  let P = BASIS;
  const ov = store.get(K.preise, null);
  if (ov && ov.preise) P = ov.preise;

  /* ---------- Zustand ---------- */
  let produktId = "farbkopie";
  const werte = {};               // Eingaben je Produkt
  const offen = {};               // aufgeklappte Abschnitte
  let ergebnis = null;            // aktuelles Rechenergebnis
  let editUid = null;             // Position in Bearbeitung
  let offerte = store.get(K.aktuell, null) || neueOfferte();

  function neueOfferte() { return { positionen: [], rabattProzent: 0, lieferung: 0, details: true }; }
  const produkt = (id) => PRODUKTE.find((p) => p.id === id);

  /* ---------- Icons pro Gruppe ---------- */
  const ICON = {
    "Kopieren & Drucken": '<path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    "Grossformat & Scan": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
    "Weiterverarbeitung": '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    "Papier & Material": '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    "Diverses": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };
  const icon = (g) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[g] || ICON.Diverses}</svg>`;

  /* ======================================================================
     PRODUKTLISTE
     ====================================================================== */
  function renderProduktliste(filter = "") {
    const f = filter.trim().toLowerCase();
    const gruppen = {};
    PRODUKTE.forEach((p) => {
      if (f && !(p.titel + " " + p.gruppe + " " + p.info).toLowerCase().includes(f)) return;
      (gruppen[p.gruppe] ||= []).push(p);
    });
    const html = Object.entries(gruppen).map(([g, ps]) => `
      <div class="pgruppe">
        <h3>${icon(g)}<span>${esc(g)}</span></h3>
        ${ps.map((p) => {
          let ab = ""; try { ab = p.ab ? p.ab(P) : ""; } catch {}
          return `<button class="pitem ${p.id === produktId ? "aktiv" : ""}" data-produkt="${p.id}">
            <span class="pitem-titel">${esc(p.titel)}</span>${ab ? `<span class="pitem-ab">${esc(ab)}</span>` : ""}</button>`;
        }).join("")}
      </div>`).join("");
    $("#produktListe").innerHTML = html || `<p class="muted leer">Kein Produkt gefunden.</p>`;
  }

  $("#produktListe").addEventListener("click", (e) => {
    const b = e.target.closest("[data-produkt]"); if (!b) return;
    if (editUid) abbrechenEdit();
    waehleProdukt(b.dataset.produkt);
    if (matchMedia("(max-width: 760px)").matches) $(".kalkulator").scrollIntoView({ behavior: "smooth" });
  });
  $("#suche").addEventListener("input", (e) => renderProduktliste(e.target.value));
  $("#suche").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const b = $("#produktListe [data-produkt]"); if (b) { waehleProdukt(b.dataset.produkt); e.target.value = ""; renderProduktliste(); focusErstes(); } }
    if (e.key === "Escape") { e.target.value = ""; renderProduktliste(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); $("#suche").focus(); }
  });

  /* ======================================================================
     KALKULATOR-FORMULAR
     ====================================================================== */
  function standardWerte(p) {
    const v = {};
    p.felder(P).forEach((f) => { if (f.typ !== "titel") v[f.id] = f.std; });
    return v;
  }
  const optWert = (o) => (typeof o === "object" ? o.wert : o);
  const optText = (o) => (typeof o === "object" ? o.text : o);

  // Felder mit Abschnitt (einklappbare Titel) anreichern
  function felderMitAbschnitt(p) {
    let abschnitt = null;
    return p.felder(P).map((f) => {
      if (f.typ === "titel") { abschnitt = f.einklappbar ? f.id : null; return f; }
      return abschnitt ? { ...f, abschnitt } : f;
    });
  }

  function waehleProdukt(id, vorgabe) {
    produktId = id;
    const p = produkt(id);
    werte[id] = vorgabe ? { ...standardWerte(p), ...vorgabe } : (werte[id] || standardWerte(p));
    $("#kalkGruppe").innerHTML = `${icon(p.gruppe)}<span>${esc(p.gruppe)}</span>`;
    $("#kalkTitel").textContent = p.titel;
    $("#kalkInfo").textContent = p.info || "";
    renderFormular();
    renderProduktliste($("#suche").value);
    rechne();
  }

  function renderFormular() {
    const p = produkt(produktId), v = werte[produktId];
    const felder = felderMitAbschnitt(p);
    // Abschnitt automatisch offen, wenn darin schon etwas eingegeben wurde
    felder.forEach((f) => { if (f.abschnitt && v[f.id] !== f.std) offen[produktId + f.abschnitt] = true; });
    const html = felder.map((f) => {
      if (f.typ === "titel") {
        if (f.einklappbar) {
          const auf = !!offen[produktId + f.id];
          return `<div class="feld voll titel" data-feld="${f.id}"><button type="button" class="aufklapp ${auf ? "auf" : ""}" data-abschnitt="${f.id}" aria-expanded="${auf}">
            <span class="pfeil">▸</span>${esc(f.label)}</button></div>`;
        }
        return `<div class="feld voll titel" data-feld="${f.id}"><h4>${esc(f.label)}</h4></div>`;
      }
      const val = v[f.id];
      let inner = "";
      if (f.typ === "zahl") {
        const step = f.schritt ?? 1;
        inner = `<div class="zahl">
          <button type="button" class="step" data-step="-1" tabindex="-1" aria-label="weniger">−</button>
          <input type="number" inputmode="decimal" id="f-${f.id}" name="${f.id}" value="${esc(val)}" ${f.min !== undefined ? `min="${f.min}"` : ""} step="${step}">
          <button type="button" class="step" data-step="1" tabindex="-1" aria-label="mehr">+</button>
        </div>`;
      } else if (f.typ === "knopf") {
        inner = `<div class="segment" role="radiogroup" aria-labelledby="l-${f.id}">${f.opt.map((o) => {
          const an = String(optWert(o)) === String(val);
          return `<button type="button" role="radio" data-name="${f.id}" data-wert="${esc(optWert(o))}" class="${an ? "an" : ""}" aria-checked="${an}">
            <span>${esc(optText(o))}</span><small class="opt-preis"></small></button>`;
        }).join("")}</div>`;
      } else if (f.typ === "auswahl") {
        const opt = (o) => `<option value="${esc(optWert(o))}" data-text="${esc(optText(o))}" ${String(optWert(o)) === String(val) ? "selected" : ""}>${esc(optText(o))}</option>`;
        inner = `<select id="f-${f.id}" name="${f.id}">${f.opt.map((o) => o.gruppe ? `<optgroup label="${esc(o.gruppe)}">${o.opt.map(opt).join("")}</optgroup>` : opt(o)).join("")}</select>`;
      } else if (f.typ === "check") {
        return `<div class="feld voll check-feld" data-feld="${f.id}" ${f.abschnitt ? `data-abschnitt-von="${f.abschnitt}"` : ""}>
          <label class="check"><input type="checkbox" name="${f.id}" ${val ? "checked" : ""}><span class="schalter"></span><span>${esc(f.label)}</span><small class="feld-text inline"></small></label></div>`;
      } else if (f.typ === "text") {
        inner = `<input type="text" id="f-${f.id}" name="${f.id}" value="${esc(val)}" placeholder="${esc(f.platzhalter || "")}">`;
      }
      const breite = f.typ === "knopf" || (f.typ === "auswahl" && !f.klein) ? "voll" : f.klein ? "klein" : "";
      return `<div class="feld ${breite}" data-feld="${f.id}" ${f.abschnitt ? `data-abschnitt-von="${f.abschnitt}"` : ""}>
        <label id="l-${f.id}" for="f-${f.id}">${esc(f.label)}</label>${inner}
        <div class="feld-info"><div class="chips"></div><small class="feld-text"></small></div></div>`;
    }).join("");
    $("#kalkForm").innerHTML = html;
    sichtbarkeit();
  }

  function sichtbarkeit() {
    const p = produkt(produktId), v = werte[produktId];
    felderMitAbschnitt(p).forEach((f) => {
      const el = $(`[data-feld="${f.id}"]`, $("#kalkForm")); if (!el) return;
      const zu = f.abschnitt && !offen[produktId + f.abschnitt];
      el.hidden = (f.wenn ? !f.wenn(v) : false) || !!zu;
    });
  }

  // Preis-Infos bei den Feldern aktualisieren
  function feldInfos() {
    const p = produkt(produktId), v = werte[produktId], fi = p.feldInfo || {};
    $$("#kalkForm [data-feld]").forEach((el) => {
      const id = el.dataset.feld, fn = fi[id];
      let info = {};
      if (fn && !el.hidden) { try { info = fn(v, P, ergebnis) || {}; } catch (err) { console.warn(id, err); } }
      const chipsEl = $(".chips", el), textEl = $(".feld-text", el);
      if (chipsEl) {
        chipsEl.innerHTML = info.chips && info.chips.length
          ? `${info.chipTitel ? `<span class="chips-titel">${esc(info.chipTitel)}</span>` : ""}${info.chips.map((c) =>
            `<button type="button" class="chip ${c.an ? "an" : ""}" ${c.menge !== undefined ? `data-chip-menge="${c.menge}"` : ""} title="Menge übernehmen"><span>${esc(c.t)}</span><b>${esc(c.p)}</b></button>`).join("")}`
          : "";
      }
      if (textEl) textEl.textContent = info.text || "";
      const opt = info.opt || {};
      $$(".segment button", el).forEach((b) => { const s = $(".opt-preis", b); if (s) s.textContent = opt[b.dataset.wert] || ""; });
      $$("option", el).forEach((o) => { const t = opt[o.value]; o.textContent = o.dataset.text + (t ? `  ·  ${t}` : ""); });
    });
  }

  function focusErstes() {
    const el = $$("#kalkForm input[type=number], #kalkForm input[type=text]").find((i) => !i.closest("[hidden]"));
    if (el) { el.focus(); el.select?.(); }
  }

  const form = $("#kalkForm");
  form.addEventListener("input", (e) => {
    const t = e.target; if (!t.name) return;
    const v = werte[produktId];
    v[t.name] = t.type === "checkbox" ? t.checked : t.type === "number" ? (t.value === "" ? "" : +t.value) : t.value;
    sichtbarkeit(); rechne();
  });
  form.addEventListener("change", (e) => { if (e.target.tagName === "SELECT") { werte[produktId][e.target.name] = e.target.value; sichtbarkeit(); rechne(); } });
  form.addEventListener("click", (e) => {
    const seg = e.target.closest(".segment button");
    if (seg) {
      werte[produktId][seg.dataset.name] = seg.dataset.wert;
      $$(`.segment button[data-name="${seg.dataset.name}"]`, form).forEach((b) => { const an = b === seg; b.classList.toggle("an", an); b.setAttribute("aria-checked", an); });
      sichtbarkeit(); rechne(); return;
    }
    const auf = e.target.closest("[data-abschnitt]");
    if (auf) {
      const k = produktId + auf.dataset.abschnitt; offen[k] = !offen[k];
      auf.classList.toggle("auf", offen[k]); auf.setAttribute("aria-expanded", offen[k]);
      sichtbarkeit(); feldInfos(); return;
    }
    const chip = e.target.closest("[data-chip-menge]");
    if (chip) {
      const inp = $("input[type=number]", chip.closest(".feld"));
      if (inp) { inp.value = chip.dataset.chipMenge; inp.dispatchEvent(new Event("input", { bubbles: true })); }
      return;
    }
    const st = e.target.closest(".step");
    if (st) {
      const inp = $("input", st.parentElement);
      const s = inp.step === "any" ? 1 : +inp.step || 1;
      let n = num(inp.value) + s * +st.dataset.step;
      if (inp.min !== "" && n < +inp.min) n = +inp.min;
      inp.value = r2(n); inp.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") { e.preventDefault(); hinzufuegen(); }
  });

  /* ======================================================================
     BERECHNUNG
     ====================================================================== */
  function rechne() {
    const p = produkt(produktId);
    try { ergebnis = p.rechne(werte[produktId], P); }
    catch (err) { console.error(err); ergebnis = { fehler: "Berechnung nicht möglich – bitte Eingaben prüfen." }; }
    const tb = $("#ergebnisTabelle tbody");
    const fehler = $("#ergebnisFehler");
    if (ergebnis.fehler) {
      fehler.hidden = false; fehler.textContent = ergebnis.fehler;
      tb.innerHTML = ""; $("#ergebnisHinweise").innerHTML = "";
      $("#ergebnisTotal").textContent = "–"; $("#btnHinzufuegen").disabled = true;
      feldInfos(); return;
    }
    fehler.hidden = true; $("#btnHinzufuegen").disabled = false;
    ergebnis.zeilen = (ergebnis.zeilen || []).filter((z) => z.total !== 0 || z.menge);
    ergebnis.total = r2(ergebnis.zeilen.reduce((s, z) => s + z.total, 0));
    tb.innerHTML = ergebnis.zeilen.map((z) => `
      <tr class="${z.total < 0 ? "neg" : ""}">
        <td>${esc(z.text)}</td>
        <td class="r nowrap">${menge(z.menge)} ${esc(z.einheit || "")}</td>
        <td class="r nowrap">${z.preis !== null && z.preis !== undefined ? chf(z.preis) : ""}</td>
        <td class="r nowrap">${chf(z.total)}</td>
      </tr>`).join("") || `<tr><td colspan="4" class="muted">Keine Leistung gewählt.</td></tr>`;
    $("#ergebnisHinweise").innerHTML = (ergebnis.hinweise || []).map((h) => `<li>${esc(h)}</li>`).join("");
    $("#ergebnisTotal").textContent = "CHF " + chf(ergebnis.total);
    feldInfos();
  }

  /* ======================================================================
     OFFERTE (Positionen)
     ====================================================================== */
  function hinzufuegen() {
    if (!ergebnis || ergebnis.fehler || !ergebnis.zeilen.length) return;
    const pos = {
      uid: editUid || uid(), produkt: produktId, werte: kopie(werte[produktId]),
      titel: ergebnis.titel, zeilen: kopie(ergebnis.zeilen), total: ergebnis.total,
    };
    if (editUid) {
      const i = offerte.positionen.findIndex((x) => x.uid === editUid);
      if (i >= 0) offerte.positionen[i] = pos;
      toast("Position aktualisiert");
      abbrechenEdit();
    } else {
      offerte.positionen.push(pos);
      toast("Zur Offerte hinzugefügt");
    }
    speichereAktuell(); renderOfferte(pos.uid);
  }
  $("#btnHinzufuegen").addEventListener("click", hinzufuegen);
  $("#btnAbbrechen").addEventListener("click", abbrechenEdit);

  function bearbeite(u) {
    const pos = offerte.positionen.find((x) => x.uid === u); if (!pos) return;
    editUid = u;
    waehleProdukt(pos.produkt, pos.werte);
    $("#editBadge").hidden = false; $("#btnAbbrechen").hidden = false;
    $("#btnHinzuText").textContent = "Position aktualisieren";
    renderOfferte();
    $(".kalkulator").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function abbrechenEdit() {
    editUid = null;
    $("#editBadge").hidden = true; $("#btnAbbrechen").hidden = true;
    $("#btnHinzuText").textContent = "Zur Offerte hinzufügen";
    renderOfferte();
  }

  function summen(o = offerte) {
    const zw = r2(o.positionen.reduce((s, p) => s + p.total, 0));
    const rabatt = -r2(zw * num(o.rabattProzent) / 100);
    const lief = r2(num(o.lieferung));
    const roh = zw + rabatt + lief;
    const rund = num(P.meta.rundung, 0.05) || 0.01;
    const total = r2(Math.round(roh / rund) * rund);
    const mwst = r2(total * P.meta.mwstSatz / (100 + P.meta.mwstSatz));
    return { zw, rabatt, lief, total, mwst, rundung: r2(total - roh) };
  }

  function renderOfferte(blinkUid) {
    $$("[data-off]").forEach((el) => {
      if (document.activeElement === el) return;
      const val = offerte[el.dataset.off];
      if (el.type === "checkbox") el.checked = !!val; else el.value = val ?? "";
    });
    const box = $("#positionen");
    if (!offerte.positionen.length) {
      box.innerHTML = `<div class="leer-offerte"><p><strong>Noch keine Positionen.</strong></p><p class="muted">Produkt links wählen, Werte eingeben und mit <kbd>↵</kbd> hinzufügen.</p></div>`;
    } else {
      box.innerHTML = offerte.positionen.map((p, i) => `
        <div class="pos ${p.uid === editUid ? "in-edit" : ""} ${p.uid === blinkUid ? "blink" : ""}" data-uid="${p.uid}">
          <div class="pos-kopf">
            <span class="pos-nr">${i + 1}</span>
            <div class="pos-titel" contenteditable="true" spellcheck="false" data-titel="${p.uid}" role="textbox" aria-label="Positionstitel (bearbeitbar)">${esc(p.titel)}</div>
            <strong class="pos-total">${chf(p.total)}</strong>
          </div>
          <ul class="pos-zeilen">${p.zeilen.map((z) => `<li><span>${esc(z.text)} · ${menge(z.menge)} ${esc(z.einheit || "")}</span><span>${chf(z.total)}</span></li>`).join("")}</ul>
          <div class="pos-aktionen">
            <button class="ico" data-pos="hoch" title="Nach oben" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="ico" data-pos="runter" title="Nach unten" ${i === offerte.positionen.length - 1 ? "disabled" : ""}>↓</button>
            <button class="ico" data-pos="edit">Bearbeiten</button>
            <button class="ico" data-pos="dup">Duplizieren</button>
            <button class="ico gefahr" data-pos="del">Entfernen</button>
          </div>
        </div>`).join("");
    }
    const s = summen();
    $("#sumZwischen").textContent = chf(s.zw);
    $("#sumRabatt").textContent = chf(s.rabatt);
    $("#sumLieferung").textContent = chf(s.lief);
    $("#sumTotal").textContent = chf(s.total);
    $("#sumMwstText").textContent = `inkl. ${P.meta.mwstSatz} % MwSt`;
    $("#sumMwst").textContent = chf(s.mwst);
    $("#mobilAnzahl").textContent = offerte.positionen.length;
    $("#mobilTotal").textContent = "CHF " + chf(s.total);
  }

  $("#positionen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pos]"); if (!b) return;
    const u = b.closest(".pos").dataset.uid, L = offerte.positionen, i = L.findIndex((x) => x.uid === u);
    const a = b.dataset.pos;
    if (a === "del") { const [weg] = L.splice(i, 1); if (editUid === u) abbrechenEdit(); toast("Position entfernt", "Rückgängig", () => { L.splice(i, 0, weg); speichereAktuell(); renderOfferte(); }); }
    if (a === "dup") { const c = kopie(L[i]); c.uid = uid(); L.splice(i + 1, 0, c); }
    if (a === "hoch" && i > 0) [L[i - 1], L[i]] = [L[i], L[i - 1]];
    if (a === "runter" && i < L.length - 1) [L[i + 1], L[i]] = [L[i], L[i + 1]];
    if (a === "edit") return bearbeite(u);
    speichereAktuell(); renderOfferte();
  });
  $("#positionen").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.dataset.titel) { e.preventDefault(); e.target.blur(); }
  });
  $("#positionen").addEventListener("input", (e) => {
    const u = e.target.dataset.titel; if (!u) return;
    const p = offerte.positionen.find((x) => x.uid === u); if (p) { p.titel = e.target.textContent.trim(); speichereAktuell(); }
  });

  // Rabatt / Lieferung / Details
  document.addEventListener("input", (e) => {
    const el = e.target; if (!el.dataset || !el.dataset.off) return;
    offerte[el.dataset.off] = el.type === "checkbox" ? el.checked : el.type === "number" ? (el.value === "" ? 0 : +el.value) : el.value;
    speichereAktuell(); renderOfferte();
  });

  function speichereAktuell() { store.set(K.aktuell, offerte); }

  /* ---------- Datum ---------- */
  function datumCH(iso) { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; }
  function plusTage(iso, t) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + num(t, 30)); return d.toISOString().slice(0, 10); }

  /* ======================================================================
     DRUCK / TEXT
     ====================================================================== */
  function renderDruck() {
    const F = P.firma, o = offerte, s = summen(), d = heute();
    $("#druck").innerHTML = `
      <div class="d-kopf">
        <div><div class="d-firma">${esc(F.name)}</div><div>${esc(F.zeile1)}</div><div>${esc(F.zeile2)}</div><div>${esc(F.email)} · ${esc(F.web)}</div></div>
        <div class="d-meta">
          <div class="d-titel">Offerte</div>
          <table><tr><td>Datum</td><td>${datumCH(d)}</td></tr>
          <tr><td>Gültig bis</td><td>${datumCH(plusTage(d, P.meta.gueltigkeitTage))}</td></tr></table>
        </div>
      </div>
      <table class="d-pos">
        <thead><tr><th>Pos.</th><th>Bezeichnung</th><th class="r">Menge</th><th class="r">Preis</th><th class="r">Betrag CHF</th></tr></thead>
        <tbody>${o.positionen.map((p, i) => `
          <tr class="d-haupt"><td>${i + 1}</td><td colspan="3"><strong>${esc(p.titel)}</strong></td><td class="r"><strong>${chf(p.total)}</strong></td></tr>
          ${o.details ? p.zeilen.map((z) => `<tr class="d-detail"><td></td><td>${esc(z.text)}</td><td class="r">${menge(z.menge)} ${esc(z.einheit || "")}</td><td class="r">${z.preis !== null && z.preis !== undefined ? chf(z.preis) : ""}</td><td class="r">${chf(z.total)}</td></tr>`).join("") : ""}`).join("")}
        </tbody>
      </table>
      <table class="d-summen">
        <tr><td>Zwischensumme</td><td class="r">${chf(s.zw)}</td></tr>
        ${s.rabatt ? `<tr><td>Rabatt ${num(o.rabattProzent)} %</td><td class="r">${chf(s.rabatt)}</td></tr>` : ""}
        ${s.lief ? `<tr><td>Lieferung / Diverses</td><td class="r">${chf(s.lief)}</td></tr>` : ""}
        ${s.rundung ? `<tr><td>Rundung</td><td class="r">${chf(s.rundung)}</td></tr>` : ""}
        <tr class="d-total"><td>Total CHF</td><td class="r">${chf(s.total)}</td></tr>
        <tr class="d-mwst"><td>inkl. ${P.meta.mwstSatz} % MwSt</td><td class="r">${chf(s.mwst)}</td></tr>
      </table>
      <div class="d-fuss">${esc(F.bedingungen)}<br>Alle Preise in CHF inkl. MwSt. · MwSt-Nr. ${esc(F.mwstNr)} · Preisliste ${esc(P.meta.preislisteVersion)}</div>`;
  }

  function alsText() {
    const o = offerte, s = summen(), L = [];
    L.push(`OFFERTE – ${datumCH(heute())}`, "");
    o.positionen.forEach((p, i) => {
      L.push(`${i + 1}. ${p.titel}  ·  CHF ${chf(p.total)}`);
      if (o.details) p.zeilen.forEach((z) => L.push(`   – ${z.text}: ${menge(z.menge)} ${z.einheit || ""} = ${chf(z.total)}`));
    });
    L.push("", `Zwischensumme: CHF ${chf(s.zw)}`);
    if (s.rabatt) L.push(`Rabatt ${o.rabattProzent} %: CHF ${chf(s.rabatt)}`);
    if (s.lief) L.push(`Lieferung / Diverses: CHF ${chf(s.lief)}`);
    L.push(`TOTAL: CHF ${chf(s.total)} (inkl. ${P.meta.mwstSatz} % MwSt CHF ${chf(s.mwst)})`);
    L.push(`Gültig bis ${datumCH(plusTage(heute(), P.meta.gueltigkeitTage))}`);
    return L.join("\n");
  }

  /* ======================================================================
     AKTIONEN
     ====================================================================== */
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-aktion]"); if (!b) return;
    const a = b.dataset.aktion;
    if (a === "drucken") {
      if (!offerte.positionen.length) return toast("Offerte ist leer");
      renderDruck(); window.print();
    }
    if (a === "kopieren") {
      try { await navigator.clipboard.writeText(alsText()); toast("Offerte als Text kopiert"); }
      catch { toast("Kopieren nicht möglich"); }
    }
    if (a === "neu") {
      if (!offerte.positionen.length) return;
      const alt = offerte;
      offerte = neueOfferte(); offerte.details = alt.details;
      abbrechenEdit(); speichereAktuell(); renderOfferte();
      toast("Offerte geleert", "Rückgängig", () => { offerte = alt; speichereAktuell(); renderOfferte(); });
    }
    if (a === "preise-export") { download("preise.js", preiseAlsJs(), "text/javascript"); toast("preise.js heruntergeladen – im Repository ersetzen"); }
    if (a === "preise-reset") {
      if (!confirm("Alle lokalen Preisänderungen verwerfen und die Preisliste aus preise.js verwenden?")) return;
      store.del(K.preise); P = kopie(BASIS); nachPreisAenderung(); renderPreisEditor(); toast("Lokale Änderungen verworfen");
    }
  });
  $("#mobilOfferte").addEventListener("click", () => $("#offertePanel").scrollIntoView({ behavior: "smooth" }));
  window.addEventListener("beforeprint", renderDruck);

  function download(name, inhalt, typ) {
    const url = URL.createObjectURL(new Blob([inhalt], { type: typ + ";charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  let toastTimer;
  function toast(text, knopf, fn) {
    const t = $("#toast");
    t.innerHTML = `<span>${esc(text)}</span>${knopf ? `<button class="btn klein">${esc(knopf)}</button>` : ""}`;
    if (knopf) $("button", t).onclick = () => { fn(); t.classList.remove("an"); };
    t.classList.add("an"); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("an"), knopf ? 5000 : 2200);
  }

  /* ======================================================================
     ANSICHTEN
     ====================================================================== */
  function zeigeView(v) {
    if (!$("#view-" + v)) v = "rechner";
    $$(".view").forEach((el) => (el.hidden = el.id !== "view-" + v));
    $$(".tab").forEach((t) => t.classList.toggle("aktiv", t.dataset.view === v));
    if (v === "preise") renderPreisEditor();
    store.set(K.ansicht, v);
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => zeigeView(t.dataset.view)));

  /* ======================================================================
     PREIS-EDITOR (generisch über preise.js)
     ====================================================================== */
  let sektion = Object.keys(P)[0];

  function renderPreisEditor() {
    $("#preisSektionen").innerHTML = `<div class="pgruppe"><h3><span>Preisliste</span></h3>${Object.keys(P).map((k) =>
      `<button class="pitem ${k === sektion ? "aktiv" : ""}" data-sektion="${k}"><span class="pitem-titel">${esc(P[k]._titel || k)}</span></button>`).join("")}</div>`;
    $("#preisTitel").textContent = P[sektion]._titel || sektion;
    $("#preisInhalt").innerHTML = knoten(P[sektion], [sektion]);
    $("#overrideBanner").hidden = !store.get(K.preise, null);
  }

  const istTabelle = (o) => o && typeof o === "object" && Array.isArray(o.zeilen) && Array.isArray(o.spalten);
  function knoten(obj, pfad) {
    const labels = obj._labels || {};
    let einfach = "", rest = "";
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("_") || k === "zeilenTitel" || k === "spalten" || k === "auflagen") continue;
      const p = [...pfad, k];
      if (istTabelle(v)) rest += tabelle(v, p);
      else if (typeof v === "number" || v === null) einfach += `<label class="pfeld"><span>${esc(labels[k] || k)}</span><input type="number" step="any" data-pfad='${JSON.stringify(p)}' value="${v ?? ""}"></label>`;
      else if (typeof v === "string") einfach += `<label class="pfeld ${v.length > 60 ? "voll" : ""}"><span>${esc(labels[k] || k)}</span>${v.length > 60
        ? `<textarea rows="3" data-pfad='${JSON.stringify(p)}' data-typ="text">${esc(v)}</textarea>`
        : `<input type="text" data-pfad='${JSON.stringify(p)}' data-typ="text" value="${esc(v)}">`}</label>`;
      else if (v && typeof v === "object" && !Array.isArray(v)) rest += `<div class="psub"><h3>${esc(v._titel || k)}</h3>${knoten(v, p)}</div>`;
    }
    return (einfach ? `<div class="pfelder">${einfach}</div>` : "") + rest;
  }

  function tabelle(t, pfad) {
    const P2 = JSON.stringify(pfad);
    return `<div class="ptab"><h3>${esc(t._titel || pfad[pfad.length - 1])}</h3>
      <div class="ptab-scroll"><table class="zeilen edit">
        <thead><tr><th>${esc(t.zeilenTitel || "")}</th>${t.spalten.map((s) => `<th>${esc(s)}</th>`).join("")}<th></th></tr></thead>
        <tbody>${t.zeilen.map((z, i) => `<tr>${z.map((c, j) => {
          const p = JSON.stringify([...pfad, "zeilen", i, j]);
          const txt = typeof c === "string";
          return `<td><input ${txt ? `type="text" data-typ="text"` : `type="number" step="any" placeholder="${j === 0 ? "∞" : "–"}"`} data-pfad='${p}' value="${esc(c ?? "")}" class="${j === 0 ? "erste" : ""}"></td>`;
        }).join("")}<td><button class="ico gefahr" data-zeile-del='${P2}' data-i="${i}" title="Zeile löschen">×</button></td></tr>`).join("")}
        </tbody></table></div>
      <button class="btn klein ghost" data-zeile-neu='${P2}'>+ Zeile</button></div>`;
  }

  const holePfad = (pfad) => pfad.reduce((o, k) => o[k], P);
  function setzePfad(pfad, wert) { const l = pfad[pfad.length - 1]; holePfad(pfad.slice(0, -1))[l] = wert; }

  $("#preisInhalt").addEventListener("change", (e) => {
    const el = e.target; if (!el.dataset.pfad) return;
    const pfad = JSON.parse(el.dataset.pfad);
    const wert = el.dataset.typ === "text" ? el.value : (el.value === "" ? null : +el.value);
    setzePfad(pfad, wert); speicherePreise(); nachPreisAenderung();
  });
  $("#preisInhalt").addEventListener("click", (e) => {
    const neu = e.target.closest("[data-zeile-neu]"), del = e.target.closest("[data-zeile-del]");
    if (neu) {
      const t = holePfad(JSON.parse(neu.dataset.zeileNeu));
      const vorlage = t.zeilen[t.zeilen.length - 1] || [];
      t.zeilen.push(vorlage.map((c) => (typeof c === "string" ? "" : null)));
    } else if (del) {
      const t = holePfad(JSON.parse(del.dataset.zeileDel));
      if (!confirm("Diese Zeile löschen?")) return;
      t.zeilen.splice(+del.dataset.i, 1);
    } else return;
    speicherePreise(); nachPreisAenderung(); renderPreisEditor();
  });
  $("#preisSektionen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sektion]"); if (!b) return;
    sektion = b.dataset.sektion; renderPreisEditor(); window.scrollTo({ top: 0 });
  });

  function speicherePreise() { store.set(K.preise, { basis: basisHash, gespeichert: new Date().toISOString(), preise: P }); $("#overrideBanner").hidden = false; }
  function nachPreisAenderung() {
    $("#brandFirma").textContent = `${P.firma.name} · Preisliste ${P.meta.preislisteVersion}`;
    Object.keys(werte).forEach((id) => { werte[id] = { ...standardWerte(produkt(id)), ...werte[id] }; });
    renderFormular(); rechne(); renderOfferte(); renderProduktliste($("#suche").value);
  }

  // JS-Datei mit kompakten Tabellenzeilen erzeugen
  function preiseAlsJs() {
    const ser = (v, ind) => {
      const pad = "  ".repeat(ind);
      if (Array.isArray(v)) {
        if (v.every((x) => x === null || typeof x !== "object")) return "[" + v.map((x) => JSON.stringify(x)).join(", ") + "]";
        return "[\n" + v.map((x) => pad + "  " + ser(x, ind + 1)).join(",\n") + "\n" + pad + "]";
      }
      if (v && typeof v === "object") {
        return "{\n" + Object.entries(v).map(([k, x]) => `${pad}  ${JSON.stringify(k)}: ${ser(x, ind + 1)}`).join(",\n") + "\n" + pad + "}";
      }
      return JSON.stringify(v);
    };
    return `/* ==========================================================================
   PREISLISTE – exportiert aus dem Offertenrechner am ${new Date().toLocaleString("de-CH")}
   • Alle Preise in CHF inkl. MwSt.
   • Tabellen: erste Zahl einer Zeile = Mengengrenze ("bis Menge"), null = "und mehr".
   • Felder mit "_" am Anfang sind Beschriftungen.
   ========================================================================== */
window.PREISE = ${ser(P, 0)};
`;
  }

  window.CQApp = { preiseAlsJs, preise: () => P };

  /* ======================================================================
     START
     ====================================================================== */
  if (ov && ov.basis !== basisHash) {
    setTimeout(() => toast("Hinweis: preise.js wurde aktualisiert – lokale Preisänderungen basieren auf einer älteren Version."), 600);
  }
  $("#brandFirma").textContent = `${P.firma.name} · Preisliste ${P.meta.preislisteVersion}`;
  $("#overrideBanner").hidden = !ov;
  waehleProdukt(produktId);
  renderOfferte();
  zeigeView(store.get(K.ansicht, "rechner"));
})();
