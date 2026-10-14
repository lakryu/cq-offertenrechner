/* ==========================================================================
   PRODUKTE – Eingabefelder und Rechenlogik pro Produkt.
   Die Preise selbst stehen in preise.js.

   Jedes Produkt:
     id, gruppe, titel, info
     felder(P)      -> Liste von Eingabefeldern
     rechne(v, P)   -> { titel, zeilen: [{text, menge, einheit, preis, total}],
                         hinweise: [], fehler }
   Feldtypen: zahl, auswahl, knopf (Segment-Auswahl), check, text
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Hilfsfunktionen ---------- */
  // kaufmännisch runden (auch negative Beträge: -2.725 -> -2.73)
  const r2 = (x) => Math.sign(x) * Math.round((Math.abs(x) + Number.EPSILON) * 100) / 100;
  const num = (x, d = 0) => (Number.isFinite(+x) && x !== "" && x !== null ? +x : d);
  const fmtZahl = (x) => new Intl.NumberFormat("de-CH").format(x);

  // Zeile einer Staffel: erste Zeile mit Grenze >= menge (null = offen). Sonst letzte Zeile.
  function stufe(tab, menge) {
    for (const z of tab.zeilen) if (z[0] === null || menge <= z[0]) return z;
    return tab.zeilen[tab.zeilen.length - 1];
  }

  // Gesamtpreis-Tabelle: auf nächsthöhere Auflage aufrunden; über dem Maximum
  // wird mit der Steigung der letzten zwei Zeilen hochgerechnet.
  function auflagePreis(tab, menge, spalte) {
    const z = tab.zeilen.filter((r) => r[0] !== null && r[spalte] !== null && r[spalte] !== undefined);
    for (const r of z) if (menge <= r[0]) return { preis: r[spalte], stufe: r[0], hoch: false };
    const a = z[z.length - 2], b = z[z.length - 1];
    const steigung = (b[spalte] - a[spalte]) / (b[0] - a[0]);
    return { preis: b[spalte] + (menge - b[0]) * steigung, stufe: menge, hoch: true };
  }

  // Zeile nach Name suchen (erste Spalte)
  const zeileNach = (tab, name) => tab.zeilen.find((z) => z[0] === name);
  const optionen = (tab) => tab.zeilen.map((z) => ({ wert: z[0], text: z[0] }));

  function rabattAus(tab, anzahl) {
    let r = 0;
    for (const z of tab.zeilen) if (anzahl >= z[0]) r = z[1];
    return r;
  }

  const Z = (text, menge, einheit, preis, total) => ({
    text, menge, einheit, preis,
    total: r2(total !== undefined ? total : menge * preis),
  });
  const pauschal = (text, total) => ({ text, menge: 1, einheit: "Pausch.", preis: r2(total), total: r2(total) });

  /* ---------- Produkte ---------- */
  const PRODUKTE = [

    /* ===================== KOPIEREN & DRUCKEN ===================== */
    {
      id: "farbkopie", gruppe: "Kopieren & Drucken", titel: "Farbkopie A4/A3",
      info: "Farblaserkopie auf 90 g/m² hochweiss satiniert. Staffelpreis nach Anzahl Kopien pro Original.",
      felder: (P) => [
        { id: "format", typ: "knopf", label: "Format", opt: ["A4", "A3"], std: "A4" },
        { id: "seiten", typ: "knopf", label: "Druck", opt: [{ wert: "1", text: "1-seitig" }, { wert: "2", text: "2-seitig" }], std: "1" },
        { id: "originale", typ: "zahl", label: "Anzahl Originale (Seiten)", std: 1, min: 1 },
        { id: "ex", typ: "zahl", label: "Exemplare (Kopien pro Original)", std: 10, min: 1 },
        { id: "papier", typ: "auswahl", label: "Papier", opt: optionen(P.farbkopie.papier), std: P.farbkopie.papier.zeilen[0][0] },
        { id: "daten", typ: "knopf", label: "Daten", opt: [
          { wert: "keine", text: "Papiervorlage" }, { wert: "pdf", text: "PDF" }, { wert: "aufwendig", text: "Word/Excel/…" }], std: "pdf" },
        { id: "pdfs", typ: "zahl", label: "Anzahl PDF-Dateien", std: 1, min: 1, wenn: (v) => v.daten === "pdf" },
        { id: "minuten", typ: "zahl", label: "Aufbereitung (Minuten)", std: 0, min: 0, wenn: (v) => v.daten === "aufwendig" },
        { id: "_sp", typ: "titel", label: "Spezialarbeiten (Anzahl)" },
        ...P.farbkopie.spezial.zeilen.map((z, i) => ({ id: "sp" + i, typ: "zahl", label: z[0], std: 0, min: 0, klein: true })),
      ],
      rechne(v, P) {
        const F = P.farbkopie;
        const orig = num(v.originale, 1), ex = num(v.ex, 1), duplex = v.seiten === "2";
        const bogenProEx = duplex ? Math.ceil(orig / 2) : orig;
        const bogen = bogenProEx * ex;
        const sp = (v.format === "A3" ? 2 : 0) + (duplex ? 1 : 0) + 1;
        const z = stufe(F.staffel, ex);
        const zeilen = [Z(`Farbkopie ${v.format} ${duplex ? "2-seitig" : "1-seitig"} (${orig} Orig. × ${ex} Ex.)`, bogen, duplex ? "Bogen" : "Kopien", z[sp])];
        const pap = zeileNach(F.papier, v.papier);
        if (pap) { const zu = pap[v.format === "A3" ? 2 : 1]; if (zu > 0) zeilen.push(Z(`Papierzuschlag ${pap[0]}`, bogen, "Bogen", zu)); }
        if (v.daten === "pdf") {
          const n = num(v.pdfs, 1);
          zeilen.push(Z("Datenübernahme PDF (Grundpreis)", 1, "Datei", F.pdfErstes));
          if (n > 1) zeilen.push(Z("weitere PDF-Dateien", n - 1, "Datei", F.pdfWeiteres));
        } else if (v.daten === "aufwendig") {
          zeilen.push(Z("Datenübernahme aufwendige Daten", 1, "Pausch.", F.aufwendig));
          const m = num(v.minuten);
          if (m > 0) zeilen.push(Z("Datenaufbereitung", m, "Min.", F.proMinute));
        }
        F.spezial.zeilen.forEach((s, i) => { const n = num(v["sp" + i]); if (n > 0) zeilen.push(Z(s[0], n, s[2], s[1])); });
        return {
          titel: `Farbkopien ${v.format} ${duplex ? "2-seitig" : "1-seitig"}, ${orig} Orig. × ${ex} Ex.`,
          zeilen,
          hinweise: [`Preisstufe: ${z[0] === null ? "über " + F.staffel.zeilen[F.staffel.zeilen.length - 2][0] : "bis " + z[0]} Kopien pro Original → Fr. ${z[sp].toFixed(2)}`],
        };
      },
    },

    {
      id: "swkopie", gruppe: "Kopieren & Drucken", titel: "S/W-Kopie (Seriekopie)",
      info: "Schwarzweiss-Kopien. Doppelseitig = 2 × einseitig, A3 = A4-Tarif × 1.5. Ab 20 Vorlagen zählt die Gesamtmenge.",
      felder: (P) => [
        { id: "format", typ: "knopf", label: "Format", opt: ["A4", "A3"], std: "A4" },
        { id: "seiten", typ: "knopf", label: "Druck", opt: [{ wert: "1", text: "einseitig" }, { wert: "2", text: "doppelseitig" }], std: "1" },
        { id: "originale", typ: "zahl", label: "Anzahl Vorlagen (Seiten)", std: 1, min: 1 },
        { id: "ex", typ: "zahl", label: "Exemplare pro Vorlage", std: 50, min: 1 },
        { id: "papier", typ: "auswahl", label: "Papier", opt: [{ wert: "", text: "Standard 80 g/m² weiss (inkl.)" }, ...optionen(P.papierzuschlag.a4)], std: "" },
        { id: "angeliefert", typ: "check", label: "Papier wird angeliefert", std: false },
        { id: "klammern", typ: "zahl", label: "Heftklammern pro Exemplar", std: 0, min: 0, klein: true },
        { id: "einstellungen", typ: "zahl", label: "Bildüberlagerung/Editieren (Einstellungen)", std: 0, min: 0, klein: true },
      ],
      rechne(v, P) {
        const S = P.swkopie;
        const orig = num(v.originale, 1), ex = num(v.ex, 1), duplex = v.seiten === "2";
        const kopienPreis = (n) => {
          if (n <= 0) return 0;
          const t = S.staffel.zeilen;
          if (n < t[0][0]) return n * S.einzelBis9;
          if (n > t[t.length - 1][0]) return t[t.length - 1][1] + ((n - t[t.length - 1][0]) / 100) * S.pro100Ueber1000;
          for (let i = 0; i < t.length; i++) {
            if (n === t[i][0]) return t[i][1];
            if (n < t[i + 1][0]) return t[i][1] + ((n - t[i][0]) / (t[i + 1][0] - t[i][0])) * (t[i + 1][1] - t[i][1]);
          }
        };
        const gesamt = orig * ex;
        const vorlagenrabatt = orig >= S.vorlagenrabattAb;
        let preis = vorlagenrabatt ? kopienPreis(gesamt) : orig * kopienPreis(ex);
        if (v.format === "A3") preis *= S.faktorA3;
        const blatt = (duplex ? Math.ceil(orig / 2) : orig) * ex;
        const zeilen = [{
          text: `S/W-Kopien ${v.format} ${duplex ? "doppelseitig" : "einseitig"} (${orig} Vorl. × ${ex} Ex.)`,
          menge: gesamt, einheit: "Kopien", preis: r2(preis / gesamt * 1000) / 1000, total: r2(preis),
        }];
        if (v.papier) {
          const grenzen = P.papierzuschlag.grenzen.zeilen[0].slice(1);
          let idx = grenzen.findIndex((g) => blatt <= g); if (idx < 0) idx = 3;
          let rp, z3 = zeileNach(P.papierzuschlag.a3, v.papier), z4 = zeileNach(P.papierzuschlag.a4, v.papier);
          if (v.format === "A3") rp = z3 ? z3[idx + 1] : z4[idx + 1] * 2; else rp = z4[idx + 1];
          zeilen.push(Z(`Papierzuschlag ${v.papier} ${v.format}`, blatt, "Blatt", rp / 100));
        }
        if (v.angeliefert && blatt >= S.papierRabattAb) zeilen.push(Z("Rabatt angeliefertes Papier", blatt, "Blatt", -S.papierRabattProBlatt));
        const kl = num(v.klammern) * ex;
        if (kl > 0) zeilen.push(Z("Heften", kl, "Klammern", S.heftenProKlammer));
        const e = num(v.einstellungen);
        if (e > 0) zeilen.push(Z("Bildüberlagerung / Editieren", e, "Einst.", S.einstellung));
        const hinweise = [vorlagenrabatt
          ? `Vorlagenrabatt: ab ${S.vorlagenrabattAb} Vorlagen wird die Gesamtmenge (${fmtZahl(gesamt)} Kopien) berechnet.`
          : `Unter ${S.vorlagenrabattAb} Vorlagen: ${orig} × Preis für ${ex} Kopien.`];
        if (duplex) hinweise.push(`${fmtZahl(blatt)} Blatt Papier (doppelseitig bedruckt).`);
        if (v.angeliefert && blatt < S.papierRabattAb) hinweise.push(`Papierrabatt erst ab ${S.papierRabattAb} Blatt.`);
        return { titel: `S/W-Kopien ${v.format} ${duplex ? "doppelseitig" : "einseitig"}, ${orig} Vorl. × ${ex} Ex.`, zeilen, hinweise };
      },
    },

    {
      id: "buchkopie", gruppe: "Kopieren & Drucken", titel: "Kopieren aus Büchern",
      info: "Kopieren aus Büchern oder gehefteten Vorlagen: Arbeitszeit plus Kopierpreis.",
      felder: () => [
        { id: "stunden", typ: "zahl", label: "Arbeitszeit (Stunden)", std: 0.5, min: 0, schritt: 0.25 },
        { id: "a4", typ: "zahl", label: "Kopien A4", std: 0, min: 0 },
        { id: "a3", typ: "zahl", label: "Kopien A3", std: 0, min: 0 },
      ],
      rechne(v, P) {
        const B = P.buchkopie, zeilen = [];
        if (num(v.stunden) > 0) zeilen.push(Z("Arbeitszeit Kopieren aus Büchern", num(v.stunden), "Std.", B.stunde));
        if (num(v.a4) > 0) zeilen.push(Z("Kopien A4", num(v.a4), "Kopien", B.a4));
        if (num(v.a3) > 0) zeilen.push(Z("Kopien A3", num(v.a3), "Kopien", B.a3));
        return { titel: "Kopieren aus Büchern / gehefteten Vorlagen", zeilen };
      },
    },

    {
      id: "visitenkarten", gruppe: "Kopieren & Drucken", titel: "Visitenkarten",
      info: "Laserdruck, max. A7, 300 g/m², inkl. Satz und Gestaltung. Es gilt der Preis der nächsthöheren Auflage.",
      felder: () => [
        { id: "druck", typ: "knopf", label: "Druck", opt: [{ wert: "1", text: "S/W 1-farbig" }, { wert: "2", text: "4-farbig" }], std: "2" },
        { id: "auflage", typ: "zahl", label: "Auflage (Stück)", std: 250, min: 1 },
        { id: "variante", typ: "auswahl", label: "Ausführung", opt: [
          { wert: "1", text: "einseitig" },
          { wert: "41", text: "doppelseitig 4/1-farbig (× 1.3)" },
          { wert: "ds", text: "doppelseitig (× 1.5)" },
          { wert: "dk", text: "Doppelkarte 4-seitig (× 1.8)" }], std: "1" },
        { id: "nachdruck", typ: "check", label: "Nachdruck ohne Satzänderung", std: false },
        { id: "boexli", typ: "zahl", label: "VK-Böxli (Stück)", std: 0, min: 0, klein: true },
      ],
      rechne(v, P) {
        const V = P.visitenkarten, sp = v.druck === "2" ? 2 : 1;
        const a = auflagePreis(V.preise, num(v.auflage, 1), sp);
        const fak = { "1": 1, "41": V.faktor41, ds: V.faktorDoppelseitig, dk: V.faktorDoppelkarte }[v.variante] || 1;
        const name = { "1": "einseitig", "41": "doppelseitig 4/1", ds: "doppelseitig", dk: "Doppelkarte 4-seitig" }[v.variante];
        const zeilen = [Z(`Visitenkarten ${sp === 2 ? "4-farbig" : "S/W"}, ${name}`, num(v.auflage, 1), "Stk.", null, a.preis * fak)];
        zeilen[0].preis = null;
        if (v.nachdruck) zeilen.push(pauschal("Rabatt Nachdruck ohne Satzänderung", -V.nachdruckRabatt));
        if (num(v.boexli) > 0) zeilen.push(Z("VK-Böxli", num(v.boexli), "Stk.", V.boexli));
        const hinweise = [a.hoch ? "Auflage über Preisliste – hochgerechnet, bitte prüfen." : `Preisstufe: Auflage ${a.stufe}${fak !== 1 ? ` × ${fak}` : ""}`];
        if (v.druck === "2" && num(v.auflage) > 1000) hinweise.push("4-farbig ist in der Preisliste nur bis 1000 Stück aufgeführt.");
        return { titel: `Visitenkarten ${sp === 2 ? "4-farbig" : "S/W"} ${name}, ${fmtZahl(num(v.auflage, 1))} Stk.`, zeilen, hinweise };
      },
    },

    {
      id: "broschueren", gruppe: "Kopieren & Drucken", titel: "Broschüren S/W",
      info: "Laserdruck S/W auf 80 g weiss: Druck, Zusammentragen, Falzen, 2 Drahtklammern, Schneiden, Verpacken.",
      felder: () => [
        { id: "format", typ: "knopf", label: "Format", opt: ["A5", "A4"], std: "A5" },
        { id: "seiten", typ: "zahl", label: "Seiten (inkl. Umschlag)", std: 16, min: 4, schritt: 4 },
        { id: "auflage", typ: "zahl", label: "Auflage (Exemplare)", std: 100, min: 1 },
        { id: "umschlag", typ: "check", label: "Farbiger Umschlag 160 g/m²", std: false },
      ],
      rechne(v, P) {
        const B = P.broschueren, T = B[v.format];
        const seiten = num(v.seiten, 8), aufl = num(v.auflage, 1);
        const zeile = T.zeilen.find((z) => seiten <= z[0]);
        if (!zeile) return { fehler: `Mehr als ${T.zeilen[T.zeilen.length - 1][0]} Seiten: Preis auf Anfrage.` };
        // Auflage-Spalte: nächsthöhere Auflage, darüber hochrechnen
        const tab = { zeilen: T.auflagen.map((a, i) => [a, zeile[i + 1]]) };
        const a = auflagePreis(tab, aufl, 1);
        const zeilen = [{ text: `Broschüre ${v.format}, ${zeile[0]} Seiten S/W`, menge: aufl, einheit: "Ex.", preis: null, total: r2(a.preis) }];
        if (v.umschlag) zeilen.push(Z("Farbiger Umschlag 160 g/m²", aufl, "Ex.", v.format === "A5" ? B.umschlagA5 : B.umschlagA4));
        const hinweise = [a.hoch ? "Auflage über 1000 – hochgerechnet, bitte prüfen." : `Preisstufe: ${zeile[0]} Seiten / ${a.stufe} Ex.`];
        if (seiten !== zeile[0]) hinweise.push(`${seiten} Seiten → berechnet als ${zeile[0]} Seiten.`);
        return { titel: `Broschüren ${v.format}, ${seiten} Seiten, ${fmtZahl(aufl)} Ex.`, zeilen, hinweise };
      },
    },

    {
      id: "durchschreibe", gruppe: "Kopieren & Drucken", titel: "Durchschreibesätze A4",
      info: "Durchschreibegarnituren A4 im Xerox-Verfahren, alle Blätter 80 g/m², gleich bedruckt.",
      felder: () => [
        { id: "fach", typ: "knopf", label: "Ausführung", opt: [{ wert: "1", text: "2-fach" }, { wert: "2", text: "3-fach" }], std: "1" },
        { id: "auflage", typ: "zahl", label: "Auflage (Sätze)", std: 100, min: 1 },
      ],
      rechne(v, P) {
        const D = P.durchschreibe, aufl = num(v.auflage, 1), sp = +v.fach;
        let preis, hinweis;
        if (aufl > 500 && aufl < 1000) {
          preis = auflagePreis(D.preise, 1000, sp).preis * (1 + D.zuschlag500bis1000 / 100);
          hinweis = `Zwischen 500 und 1000: Preis 1000 + ${D.zuschlag500bis1000} % (gemäss Preisliste).`;
        } else {
          const a = auflagePreis(D.preise, aufl, sp); preis = a.preis;
          hinweis = a.hoch ? "Über 1000 – hochgerechnet, bitte prüfen." : `Preisstufe: ${a.stufe} Sätze`;
        }
        const name = sp === 1 ? "2-fach" : "3-fach";
        return { titel: `Durchschreibesätze A4 ${name}, ${fmtZahl(aufl)} Sätze`,
          zeilen: [{ text: `Durchschreibegarnitur A4 ${name}`, menge: aufl, einheit: "Sätze", preis: null, total: r2(preis) }], hinweise: [hinweis] };
      },
    },

    /* ===================== GROSSFORMAT ===================== */
    {
      id: "planplot", gruppe: "Grossformat & Scan", titel: "Planplot / Grosskopie",
      info: "CAD-Plotfile, Papier 90/120 g/m², bis 89 cm Breite. Staffel nach Anzahl.",
      felder: () => [
        { id: "farbe", typ: "knopf", label: "Druck", opt: [{ wert: "sw", text: "S/W" }, { wert: "farbig", text: "Farbig" }], std: "sw" },
        { id: "format", typ: "knopf", label: "Format", opt: ["A2", "A1", "A0", { wert: "m2", text: "Sonderformat (m²)" }], std: "A1" },
        { id: "m2", typ: "zahl", label: "Fläche pro Plot (m²)", std: 1, min: 0.1, schritt: 0.1, wenn: (v) => v.format === "m2" },
        { id: "anzahl", typ: "zahl", label: "Anzahl Plots", std: 1, min: 1 },
        { id: "material", typ: "auswahl", label: "Material", opt: [
          { wert: "", text: "Standard 90/120 g/m² (inkl.)" }, { wert: "plot120", text: "Plotpapier 120 g/m² (+ pro m²)" },
          { wert: "transparent", text: "Transparentpapier 95 g/m² (+ pro m²)" }], std: "" },
        { id: "falten", typ: "check", label: "Falten", std: false },
        { id: "datentraeger", typ: "check", label: "Ausdruck ab Datenträger", std: false },
      ],
      rechne(v, P) {
        const L = P.planplot, T = L[v.farbe], n = num(v.anzahl, 1);
        const sp = { A2: 1, A1: 2, A0: 3, m2: 4 }[v.format];
        const flaeche = v.format === "m2" ? num(v.m2, 1) : L.flaecheM2.zeilen[0][sp];
        const z = stufe(T, n);
        const einzel = v.format === "m2" ? z[sp] * flaeche : z[sp];
        const fname = v.format === "m2" ? `${flaeche} m²` : v.format;
        const zeilen = [Z(`Planplot ${v.farbe === "sw" ? "S/W" : "farbig"} ${fname}`, n, "Plots", r2(einzel))];
        if (v.material) {
          const satz = v.material === "plot120" ? L.plotpapier120M2 : L.transparentM2;
          zeilen.push(Z(v.material === "plot120" ? "Zuschlag Plotpapier 120 g/m²" : "Zuschlag Transparentpapier 95 g/m²", r2(flaeche * n), "m²", satz));
        }
        if (v.falten) {
          const f = L.falten.zeilen[0][sp];
          zeilen.push(Z("Falten", n, "Plots", v.format === "m2" ? r2(f * flaeche) : f));
        }
        if (v.datentraeger) zeilen.push(pauschal("Ausdruck ab Datenträger", L.abDatentraeger));
        return { titel: `Planplot ${v.farbe === "sw" ? "S/W" : "farbig"} ${fname}, ${n} Stk.`, zeilen,
          hinweise: [`Preisstufe: ${z[0] === null ? "ab 8" : "bis " + z[0]} Plots`] };
      },
    },

    {
      id: "grafikplot", gruppe: "Grossformat & Scan", titel: "Grafikplot / Poster",
      info: "4-farbig ab Datei auf Grossformat-Farbplotter. Papier 140 g/m² Satin weiss inklusive.",
      felder: (P) => [
        { id: "format", typ: "auswahl", label: "Format", opt: P.grafikplot.formate.zeilen.map((z, i) => ({ wert: String(i), text: z[0] })), std: "1" },
        { id: "anzahl", typ: "zahl", label: "Anzahl", std: 1, min: 1 },
        { id: "material", typ: "auswahl", label: "Material", opt: optionen(P.grafikplot.material), std: P.grafikplot.material.zeilen[0][0] },
        { id: "schwarz", typ: "check", label: "Nur Schwarzdruck", std: false },
        { id: "_b", typ: "titel", label: "Bearbeitung" },
        { id: "scanA4", typ: "zahl", label: "Vorlagen bis A4 scannen", std: 0, min: 0, klein: true },
        { id: "scanA3", typ: "zahl", label: "Vorlagen bis A3 scannen", std: 0, min: 0, klein: true },
        { id: "stunden", typ: "zahl", label: "Farbkorrekturen / Montagen (Std.)", std: 0, min: 0, schritt: 0.25, klein: true },
      ],
      rechne(v, P) {
        const G = P.grafikplot, i = num(v.format, 0), n = num(v.anzahl, 1);
        const fmt = G.formate.zeilen[i], z = stufe(G.staffel, n);
        let einzel = z[i + 1];
        if (v.schwarz) einzel = einzel * (1 - G.schwarzRabatt / 100);
        const zeilen = [Z(`Grafikplot ${fmt[0]}${v.schwarz ? " (nur Schwarz)" : ""}`, n, "Stk.", r2(einzel))];
        const mat = zeileNach(G.material, v.material);
        if (mat && mat[1] > 0) zeilen.push(Z(`Material ${mat[0]}`, r2(fmt[1] * n), "m²", mat[1]));
        if (num(v.scanA4) > 0) zeilen.push(Z("Vorlage bis A4 scannen", num(v.scanA4), "Vorl.", G.scanA4));
        if (num(v.scanA3) > 0) zeilen.push(Z("Vorlage bis A3 scannen", num(v.scanA3), "Vorl.", G.scanA3));
        if (num(v.stunden) > 0) zeilen.push(Z("Farbkorrekturen, Änderungen, Montagen", num(v.stunden), "Std.", G.stunde));
        return { titel: `Grafikplot ${fmt[0]}, ${n} Stk.`, zeilen,
          hinweise: [`Preisstufe: ${z[0] === null ? "ab 10" : "bis " + z[0]} Stk.`] };
      },
    },

    {
      id: "scan", gruppe: "Grossformat & Scan", titel: "Scannen",
      info: "Scan Klein- und Grossformat. Kleinformat: Grundpreis pro PDF plus Preis pro Seite.",
      felder: () => [
        { id: "art", typ: "knopf", label: "Format", opt: ["A4", "A3", { wert: "gross", text: "Grossformat" }], std: "A4" },
        { id: "pdfs", typ: "zahl", label: "Anzahl PDF-Dateien", std: 1, min: 1, wenn: (v) => v.art !== "gross" },
        { id: "seiten", typ: "zahl", label: "Anzahl Seiten", std: 10, min: 1, wenn: (v) => v.art !== "gross" },
        { id: "farbe", typ: "knopf", label: "Scan", opt: [{ wert: "sw", text: "S/W" }, { wert: "farbig", text: "Farbig" }], std: "farbig", wenn: (v) => v.art === "gross" },
        { id: "m2", typ: "zahl", label: "Fläche total (m²)", std: 1, min: 0.1, schritt: 0.1, wenn: (v) => v.art === "gross" },
      ],
      rechne(v, P) {
        const S = P.scan;
        if (v.art === "gross") {
          const farbig = v.farbe === "farbig", m2 = num(v.m2, 1);
          const satz = farbig ? S.grossFarbigM2 : S.grossSwM2, min = farbig ? S.grossFarbigMin : S.grossSwMin;
          const z = Z(`Grossformat-Scan ${farbig ? "farbig" : "S/W"}`, m2, "m²", satz);
          const hinweise = [];
          if (z.total < min) { z.total = min; hinweise.push(`Mindestpreis Fr. ${min.toFixed(2)} angewendet.`); }
          return { titel: `Grossformat-Scan ${farbig ? "farbig" : "S/W"}, ${m2} m²`, zeilen: [z], hinweise };
        }
        const grund = v.art === "A3" ? S.grundA3 : S.grundA4;
        return { titel: `Scan ${v.art}, ${num(v.seiten, 1)} Seiten`, zeilen: [
          Z(`Grundpreis PDF ${v.art}`, num(v.pdfs, 1), "Datei", grund),
          Z(`Scan ${v.art}`, num(v.seiten, 1), "Seiten", S.proSeite)] };
      },
    },

    /* ===================== WEITERVERARBEITUNG ===================== */
    {
      id: "bindung", gruppe: "Weiterverarbeitung", titel: "Binden",
      info: "Spiral-, Draht- und Heissleimbindung inkl. Rücken und Deckel glasklar. Die passende Grösse wird automatisch gewählt.",
      felder: () => [
        { id: "art", typ: "knopf", label: "Bindung", opt: [
          { wert: "gbc", text: "Plastikspirale" }, { wert: "wireo", text: "Wire-O Draht" },
          { wert: "fastback", text: "Heissleim" }, { wert: "klemm", text: "Klemmschiene" }], std: "wireo" },
        { id: "blatt", typ: "zahl", label: "Blatt pro Exemplar", std: 50, min: 1, wenn: (v) => v.art !== "klemm" },
        { id: "klemmtyp", typ: "knopf", label: "Klemmschiene", opt: [{ wert: "n", text: "Normal" }, { wert: "o", text: "Ordner" }], std: "n", wenn: (v) => v.art === "klemm" },
        { id: "anzahl", typ: "zahl", label: "Anzahl Exemplare", std: 1, min: 1 },
        { id: "a3", typ: "check", label: "Format A3", std: false, wenn: (v) => v.art !== "klemm" },
        { id: "kalender", typ: "check", label: "Kalenderbindung", std: false, wenn: (v) => v.art === "wireo" },
      ],
      rechne(v, P) {
        const B = P.bindung, n = num(v.anzahl, 1);
        if (v.art === "klemm") {
          const o = v.klemmtyp === "o";
          return { titel: `Klemmschiene ${o ? "Ordner" : "normal"}, ${n} Stk.`,
            zeilen: [Z(`Klemmschiene ${o ? "Ordner" : "normal"}`, n, "Stk.", o ? B.klemmschieneOrdner : B.klemmschieneNormal)] };
        }
        const T = B[v.art], blatt = num(v.blatt, 1);
        const z = T.zeilen.find((r) => blatt <= r[1]);
        if (!z) return { fehler: `Zu viele Blatt: maximal ${T.zeilen[T.zeilen.length - 1][1]} Blatt für diese Bindung.` };
        const name = { gbc: "Plastik-Spiralbindung", wireo: "Wire-O Drahtbindung", fastback: "Fastback Heissleimbindung" }[v.art];
        let einzel = z[2];
        if (v.art === "wireo" && v.kalender) einzel *= 1 + B.kalenderZuschlag / 100;
        if (v.a3) einzel += B.a3Zuschlag;
        const zeilen = [Z(`${name} ${z[0]}${v.kalender && v.art === "wireo" ? ", Kalender" : ""}${v.a3 ? ", A3" : ""}`, n, "Stk.", r2(einzel))];
        const rab = rabattAus(B.mengenrabatt, n);
        if (rab > 0) zeilen.push(pauschal(`Mengenrabatt ${rab} %`, -zeilen[0].total * rab / 100));
        return { titel: `${name} (${blatt} Blatt), ${n} Stk.`, zeilen, hinweise: [`Gewählt: ${z[0]} (bis ${z[1]} Blatt)`] };
      },
    },

    {
      id: "falzen", gruppe: "Weiterverarbeitung", titel: "Falzen",
      info: "Maschinell falzen (Offsetpapier 80/100 g, A4), inkl. Bandieren und Verpacken. Nächsthöhere Auflage gilt.",
      felder: (P) => [
        { id: "methode", typ: "knopf", label: "Methode", opt: [{ wert: "m", text: "Maschine" }, { wert: "h", text: "Von Hand" }], std: "m" },
        { id: "bruch", typ: "auswahl", label: "Falzart", opt: P.falzen.preise.spalten.map((s, i) => ({ wert: String(i + 1), text: s })), std: "1", wenn: (v) => v.methode === "m" },
        { id: "auflage", typ: "zahl", label: "Auflage (Stück)", std: 500, min: 1, wenn: (v) => v.methode === "m" },
        { id: "stufen", typ: "zahl", label: "Formatstufen grösser/kleiner als A4", std: 0, min: 0, klein: true, wenn: (v) => v.methode === "m" },
        ...P.falzen.zuschlaege.zeilen.map((z, i) => ({ id: "zu" + i, typ: "check", label: `${z[0]} (+${z[1]} %)`, std: false, wenn: (v) => v.methode === "m" })),
        { id: "stunden", typ: "zahl", label: "Zeitaufwand (Std.)", std: 1, min: 0, schritt: 0.25, wenn: (v) => v.methode === "h" },
      ],
      rechne(v, P) {
        const F = P.falzen;
        if (v.methode === "h") return { titel: "Falzen von Hand", zeilen: [Z("Falzen von Hand", num(v.stunden), "Std.", F.handStunde)] };
        const sp = num(v.bruch, 1), aufl = num(v.auflage, 1);
        const a = auflagePreis(F.preise, aufl, sp);
        const zeilen = [{ text: `Falzen ${F.preise.spalten[sp - 1]}`, menge: aufl, einheit: "Stk.", preis: null, total: r2(a.preis) }];
        let pz = num(v.stufen) * F.formatstufe; const namen = [];
        if (num(v.stufen) > 0) namen.push(`${num(v.stufen)} Formatstufe(n)`);
        F.zuschlaege.zeilen.forEach((z, i) => { if (v["zu" + i]) { pz += z[1]; namen.push(z[0]); } });
        if (pz > 0) zeilen.push(pauschal(`Zuschlag ${pz} % (${namen.join(", ")})`, a.preis * pz / 100));
        return { titel: `Falzen ${F.preise.spalten[sp - 1]}, ${fmtZahl(aufl)} Stk.`, zeilen,
          hinweise: [a.hoch ? "Über 10'000 – hochgerechnet, bitte prüfen." : `Preisstufe: ${fmtZahl(a.stufe)} Stk.`] };
      },
    },

    {
      id: "rillen", gruppe: "Weiterverarbeitung", titel: "Rillen / Perforieren",
      info: "Umschläge und Blätter ab 160 g/m² werden gerillt und anschliessend gefaltet. Perforation z. B. für Abreisskarten.",
      felder: () => [
        { id: "art", typ: "knopf", label: "Arbeit", opt: ["Rillen", "Perforieren"], std: "Rillen" },
        { id: "methode", typ: "knopf", label: "Methode", opt: [{ wert: "m", text: "Maschine" }, { wert: "h", text: "Von Hand (bis A4)" }, { wert: "e", text: "Manuell einfach" }], std: "m" },
        { id: "linien", typ: "knopf", label: "Anzahl Linien", opt: [{ wert: "1", text: "1×" }, { wert: "2", text: "2×" }], std: "1", wenn: (v) => v.methode !== "e" },
        { id: "anzahl", typ: "zahl", label: "Anzahl Bogen", std: 100, min: 1 },
      ],
      rechne(v, P) {
        const R = P.rillen, n = num(v.anzahl, 1), l = v.linien === "2" ? 2 : 1, zeilen = [], hinweise = [];
        if (v.methode === "m") {
          zeilen.push(pauschal(`Einrichten ${v.art} ${l}× (Maschine)`, R["maschineEinrichten" + l]));
          zeilen.push(Z(`${v.art} ${l}× pro 100 Stk.`, Math.ceil(n / 100), "× 100", R["maschinePro100_" + l]));
          hinweise.push(`Abrechnung pro angefangene 100 Stück (${Math.ceil(n / 100)} × 100).`);
        } else if (v.methode === "h") {
          zeilen.push(pauschal(`Einrichten ${v.art} ${l}× (von Hand)`, R["handEinrichten" + l]));
          zeilen.push(Z(`${v.art} ${l}× von Hand`, n, "Bogen", R["handProBogen" + l]));
          const summe = zeilen.reduce((s, z) => s + z.total, 0);
          if (summe < R.handMinimum) { zeilen.push(pauschal("Ergänzung auf Mindestverrechnung", R.handMinimum - summe)); }
        } else {
          zeilen.push(pauschal(`${v.art} manuell – Grundpreis`, R.manuellGrund));
          zeilen.push(Z(`${v.art} manuell`, n, "Stk.", R.manuellProStueck));
        }
        return { titel: `${v.art}${v.methode !== "e" ? " " + l + "×" : ""}, ${fmtZahl(n)} Bogen`, zeilen, hinweise };
      },
    },

    {
      id: "zusammentragen", gruppe: "Weiterverarbeitung", titel: "Zusammentragen",
      info: "Zusammentragen von Papier 80–120 g/m² A4. Abrechnung nach Anzahl Blatt total (mind. 1000).",
      felder: (P) => [
        { id: "blattProSatz", typ: "zahl", label: "Blatt pro Satz", std: 10, min: 1 },
        { id: "saetze", typ: "zahl", label: "Anzahl Sätze", std: 100, min: 1 },
        { id: "papier", typ: "auswahl", label: "Papier", opt: optionen(P.zusammentragen.zuschlaege), std: P.zusammentragen.zuschlaege.zeilen[0][0] },
      ],
      rechne(v, P) {
        const Zt = P.zusammentragen, blatt = num(v.blattProSatz, 1) * num(v.saetze, 1);
        const a = auflagePreis(Zt.preise, blatt, 1);
        const zeilen = [{ text: `Zusammentragen ${num(v.blattProSatz, 1)} Blatt × ${num(v.saetze, 1)} Sätze`, menge: blatt, einheit: "Blatt", preis: null, total: r2(a.preis) }];
        const pz = (zeileNach(Zt.zuschlaege, v.papier) || [0, 0])[1];
        if (pz > 0) zeilen.push(pauschal(`Zuschlag ${v.papier} ${pz} %`, a.preis * pz / 100));
        return { titel: `Zusammentragen ${fmtZahl(blatt)} Blatt`, zeilen,
          hinweise: [a.hoch ? "Über 20'000 Blatt – hochgerechnet." : `Preisstufe: ${fmtZahl(a.stufe)} Blatt`] };
      },
    },

    {
      id: "lochen", gruppe: "Weiterverarbeitung", titel: "Lochen",
      info: "2er und 4er Norm-Lochung (Abstand 8 cm, Ø 5.5–7 mm). Preise für Papier 80 g/m².",
      felder: () => [
        { id: "art", typ: "knopf", label: "Lochung", opt: [{ wert: "1", text: "2er" }, { wert: "2", text: "4er" }], std: "1" },
        { id: "blatt", typ: "zahl", label: "Anzahl Blatt", std: 500, min: 1 },
        { id: "p120", typ: "check", label: "Papier 120 g/m²", std: false },
      ],
      rechne(v, P) {
        const L = P.lochen, n = num(v.blatt, 1), sp = +v.art;
        const fest = L.preise.zeilen.filter((z) => z[0] !== null), offen = L.preise.zeilen.find((z) => z[0] === null);
        let preis, hinweis;
        const z = fest.find((r) => n <= r[0]);
        if (z) { preis = z[sp]; hinweis = `Preisstufe: ${fmtZahl(z[0])} Blatt`; }
        else {
          const letzte = fest[fest.length - 1], extra = Math.ceil((n - letzte[0]) / 1000);
          preis = letzte[sp] + extra * offen[sp];
          hinweis = `${fmtZahl(letzte[0])} Blatt + ${extra} × 1000 Blatt`;
        }
        if (v.p120) preis *= 1 + L.zuschlag120 / 100;
        return { titel: `Lochen ${sp === 1 ? "2er" : "4er"}, ${fmtZahl(n)} Blatt`,
          zeilen: [{ text: `Lochen ${sp === 1 ? "2er" : "4er"}${v.p120 ? " (120 g/m²)" : ""}`, menge: n, einheit: "Blatt", preis: null, total: r2(preis) }], hinweise: [hinweis] };
      },
    },

    {
      id: "heften", gruppe: "Weiterverarbeitung", titel: "Heften (Klammer)",
      info: "Einfache Klammerheftung für 1–14 Blatt. Nächsthöhere Auflage gilt.",
      felder: () => [{ id: "auflage", typ: "zahl", label: "Auflage (Exemplare)", std: 100, min: 1 }],
      rechne(v, P) {
        const a = auflagePreis(P.heften.preise, num(v.auflage, 1), 1);
        return { titel: `Klammerheftung, ${fmtZahl(num(v.auflage, 1))} Ex.`,
          zeilen: [{ text: "Einfache Klammerheftung (1–14 Blatt)", menge: num(v.auflage, 1), einheit: "Ex.", preis: null, total: r2(a.preis) }],
          hinweise: [a.hoch ? "Über 2000 – hochgerechnet." : `Preisstufe: ${fmtZahl(a.stufe)} Ex.`] };
      },
    },

    {
      id: "leimen", gruppe: "Weiterverarbeitung", titel: "Blockleimung",
      info: "Leimen und trennen. Zusammentragen wird zusätzlich verrechnet.",
      felder: () => [
        { id: "format", typ: "knopf", label: "Blockformat", opt: ["A5", { wert: "A4", text: "A4" }], std: "A5" },
        { id: "blatt", typ: "knopf", label: "Blatt pro Block", opt: [{ wert: "1", text: "bis 50" }, { wert: "2", text: "51–100" }], std: "1" },
        { id: "bloecke", typ: "zahl", label: "Anzahl Blöcke", std: 10, min: 1 },
        { id: "graukarton", typ: "check", label: "Graukarton-Rückwand", std: true },
      ],
      rechne(v, P) {
        const L = P.leimen, n = num(v.bloecke, 1), z = stufe(L.staffel, n);
        let einzel = z[+v.blatt];
        if (v.format === "A4") einzel *= 1 + L.zuschlagA4 / 100;
        const zeilen = [pauschal("Blockleimung Grundpreis", L.grundpreis),
          Z(`Block ${v.format} ${v.blatt === "1" ? "bis 50" : "51–100"} Blatt leimen & trennen`, n, "Blöcke", r2(einzel))];
        if (v.graukarton) zeilen.push(Z("Graukarton", n, "Stk.", L.graukarton));
        return { titel: `Blockleimung ${v.format}, ${n} Blöcke`, zeilen, hinweise: ["Zusammentragen wird separat verrechnet."] };
      },
    },

    {
      id: "schneiden", gruppe: "Weiterverarbeitung", titel: "Schneiden",
      info: "Schneiden pro 1000 Blatt oder Blockschnitt (Stapelschnitt) pro Schnitt.",
      felder: (P) => [
        { id: "art", typ: "knopf", label: "Art", opt: [{ wert: "s", text: "Schneiden" }, { wert: "b", text: "Blockschnitt" }], std: "s" },
        { id: "format", typ: "knopf", label: "Endformat", opt: P.schneiden.proTausend.spalten, std: "A5", wenn: (v) => v.art === "s" },
        { id: "blatt", typ: "zahl", label: "Anzahl Blatt", std: 1000, min: 1, wenn: (v) => v.art === "s" },
        { id: "schnitte", typ: "zahl", label: "Anzahl Schnitte", std: 4, min: 1, wenn: (v) => v.art === "b" },
      ],
      rechne(v, P) {
        const S = P.schneiden;
        if (v.art === "b") return { titel: `Blockschnitt, ${num(v.schnitte, 1)} Schnitte`, zeilen: [Z("Blockschnitt (Stapelschnitt)", num(v.schnitte, 1), "Schnitte", S.blockschnitt)] };
        const i = S.proTausend.spalten.indexOf(v.format), satz = S.proTausend.zeilen[0][i + 1], n = num(v.blatt, 1);
        return { titel: `Schneiden ${v.format}, ${fmtZahl(n)} Blatt`, zeilen: [
          pauschal("Schneiden Grundpreis", S.grundpreis),
          Z(`Schneiden auf ${v.format}`, r2(n / 1000), "× 1000", satz)] };
      },
    },

    {
      id: "laminieren", gruppe: "Weiterverarbeitung", titel: "Laminieren",
      info: "Heisslaminieren beidseitig glasklar. Staffelpreis pro Stück.",
      felder: (P) => [
        { id: "typ", typ: "knopf", label: "Art", opt: [{ wert: "standard", text: "Matt/Glanz" }, { wert: "selbstklebend", text: "Selbstklebend" }, { wert: "gross", text: "Grossformat" }], std: "standard" },
        { id: "fs", typ: "knopf", label: "Format", opt: P.laminieren.standard.spalten, std: "A4", wenn: (v) => v.typ === "standard" },
        { id: "fk", typ: "knopf", label: "Format", opt: P.laminieren.selbstklebend.spalten, std: "A4", wenn: (v) => v.typ === "selbstklebend" },
        { id: "fg", typ: "knopf", label: "Format", opt: P.laminieren.gross.spalten, std: "A1", wenn: (v) => v.typ === "gross" },
        { id: "anzahl", typ: "zahl", label: "Anzahl", std: 1, min: 1 },
        { id: "einseitig", typ: "check", label: "Einseitig selbstklebend", std: false, wenn: (v) => v.typ === "gross" },
      ],
      rechne(v, P) {
        const L = P.laminieren, T = L[v.typ], n = num(v.anzahl, 1);
        const f = { standard: v.fs, selbstklebend: v.fk, gross: v.fg }[v.typ];
        const i = T.spalten.indexOf(f), z = stufe(T, n);
        let einzel = z[i + 1];
        if (v.typ === "gross" && v.einseitig) einzel *= 1 + L.zuschlagSelbstklebend / 100;
        const name = { standard: "Laminieren matt/glanz", selbstklebend: "Laminieren selbstklebend", gross: "Laminieren Grossformat" }[v.typ];
        return { titel: `${name} ${f}, ${n} Stk.`, zeilen: [Z(`${name} ${f}${v.einseitig && v.typ === "gross" ? ", einseitig selbstklebend" : ""}`, n, "Stk.", r2(einzel))] };
      },
    },

    {
      id: "aufziehen", gruppe: "Weiterverarbeitung", titel: "Aufziehen (Platte)",
      info: "Einseitig aufziehen auf 5 mm Sandwichplatte. Angelieferte Materialien auf Risiko des Kunden.",
      felder: (P) => [
        { id: "format", typ: "knopf", label: "Format", opt: P.aufziehen.formate.spalten, std: "A3" },
        { id: "anzahl", typ: "zahl", label: "Anzahl Platten", std: 1, min: 1 },
        { id: "steller", typ: "zahl", label: "Steller (klein)", std: 0, min: 0, klein: true },
        { id: "anhaenger", typ: "zahl", label: "Anhänger", std: 0, min: 0, klein: true },
      ],
      rechne(v, P) {
        const A = P.aufziehen, n = num(v.anzahl, 1);
        const preis = A.formate.zeilen[0][A.formate.spalten.indexOf(v.format) + 1];
        const zeilen = [Z(`Aufziehen auf Sandwichplatte 5 mm, ${v.format}`, n, "Stk.", preis)];
        const rab = rabattAus(A.rabatt, n);
        if (rab > 0) zeilen.push(pauschal(`Mengenrabatt ${rab} %`, -zeilen[0].total * rab / 100));
        if (num(v.steller) > 0) zeilen.push(Z("Steller (klein)", num(v.steller), "Stk.", A.steller));
        if (num(v.anhaenger) > 0) zeilen.push(Z("Anhänger", num(v.anhaenger), "Stk.", A.anhaenger));
        return { titel: `Aufziehen ${v.format}, ${n} Stk.`, zeilen };
      },
    },

    {
      id: "broschuerenManuell", gruppe: "Weiterverarbeitung", titel: "Broschüren manuell binden",
      info: "A5-Broschüren von Hand: falten, 2× heften, Frontschnitt. Druck wird separat berechnet.",
      felder: (P) => [
        { id: "auflage", typ: "zahl", label: "Auflage (Broschüren)", std: 50, min: 1 },
        { id: "bogen", typ: "zahl", label: "Bogen pro Broschüre", std: 4, min: 1 },
        { id: "einrichten", typ: "zahl", label: `Einrichten (Fr. ${P.broschuerenManuell.einrichtenMin}–${P.broschuerenManuell.einrichtenMax})`, std: P.broschuerenManuell.einrichtenMin, min: 0, schritt: 1 },
      ],
      rechne(v, P) {
        const B = P.broschuerenManuell, n = num(v.auflage, 1);
        let einzel = stufe(B.staffel, n)[1];
        const zu = num(v.bogen, 1) >= B.zuschlagAbBogen;
        if (zu) einzel *= 1 + B.zuschlagProzent / 100;
        return { titel: `Broschüren A5 manuell binden, ${n} Stk.`, zeilen: [
          pauschal("Einrichten", num(v.einrichten, B.einrichtenMin)),
          Z(`Broschüre A5 binden${zu ? ` (ab ${B.zuschlagAbBogen} Bogen +${B.zuschlagProzent} %)` : ""}`, n, "Stk.", r2(einzel))],
          hinweise: ["Druck/Kopien separat als eigene Position erfassen."] };
      },
    },

    /* ===================== PAPIER & MATERIAL ===================== */
    {
      id: "papierverkauf", gruppe: "Papier & Material", titel: "Papierverkauf",
      info: "Verkauf von Kopierpapier, farbigen und weissen Spezialpapieren.",
      felder: (P) => [
        { id: "sorte", typ: "auswahl", label: "Papier", opt: [
          { gruppe: "Kopierpapier 80 g/m² weiss", opt: [{ wert: "kp", text: "Kopierpapier 80 g/m² weiss SK3" }, { wert: "kpr", text: "Recycling / Biotop 80 g/m²" }] },
          { gruppe: "Farbige Papiere", opt: P.papierFarbig.staffel.zeilen.map((z) => ({ wert: "f:" + z[0], text: z[0] })) },
          { gruppe: "Weisse Papiere Laser/Kopierer", opt: P.papierWeiss.staffel.zeilen.map((z) => ({ wert: "w:" + z[0], text: z[0] })) }], std: "kp" },
        { id: "format", typ: "knopf", label: "Format", opt: [{ wert: "A4", text: "A4" }, { wert: "A3", text: "A3" }], std: "A4", wenn: (v) => !String(v.sorte).startsWith("f:") },
        { id: "blatt", typ: "zahl", label: "Anzahl Blatt", std: 500, min: 1 },
      ],
      rechne(v, P) {
        const n = num(v.blatt, 1), s = String(v.sorte), a3 = s.startsWith("f:") ? 1 : (v.format === "A3" ? 2 : 1);
        const fmt = v.format === "A3" && !s.startsWith("f:") ? " A3" : "";
        if (s === "kp" || s === "kpr") {
          const K = P.kopierpapier; let total, hinweis;
          if (n < 1000) { const p = Math.ceil(n / 500); total = p * K.paket500; hinweis = `${p} Paket(e) à 500 Blatt`; }
          else {
            const satz = n >= 10000 ? K.proTausend10000 : n >= 5000 ? K.proTausend5000 : K.proTausend;
            total = (n / 1000) * satz; hinweis = `Fr. ${satz.toFixed(2)} pro 1000 Blatt`;
          }
          const zeilen = [{ text: `Kopierpapier 80 g/m² weiss${fmt}`, menge: n, einheit: "Blatt", preis: null, total: r2(total * a3) }];
          if (s === "kpr") zeilen.push(Z("Zuschlag Recycling/Biotop", r2(n / 1000), "× 1000", K.recyclingZuschlag * a3));
          return { titel: `Papier: Kopierpapier 80 g/m²${s === "kpr" ? " Recycling" : ""}${fmt}, ${fmtZahl(n)} Blatt`, zeilen, hinweise: [hinweis] };
        }
        if (s.startsWith("f:")) {
          const z = zeileNach(P.papierFarbig.staffel, s.slice(2)); let total, hinweis;
          if (n < 500) {
            const grenzen = [10, 50, 100, 500]; const i = grenzen.findIndex((g) => n <= g);
            total = n * z[6 + i] / 100; hinweis = `Kleinmengentarif ${z[6 + i]} Rp. pro Blatt`;
          } else {
            const satz = n >= 5000 ? z[5] : n >= 2000 ? z[4] : z[3];
            total = (n / 1000) * satz; hinweis = `Fr. ${satz.toFixed(2)} pro 1000 Blatt`;
          }
          return { titel: `Papier: ${z[0]}, ${fmtZahl(n)} Blatt`,
            zeilen: [{ text: `Papier farbig ${z[0]}`, menge: n, einheit: "Blatt", preis: null, total: r2(total) }], hinweise: [hinweis] };
        }
        const z = zeileNach(P.papierWeiss.staffel, s.slice(2)); let total, hinweis;
        if (n < 1000) { const p = Math.ceil(n / z[1]); total = p * z[2]; hinweis = `${p} Paket(e) à ${z[1]} Blatt`; }
        else {
          const satz = n >= 5000 ? z[5] : n >= 2000 ? z[4] : z[3];
          total = (n / 1000) * satz; hinweis = `Fr. ${satz.toFixed(2)} pro 1000 Blatt`;
        }
        return { titel: `Papier: ${z[0]}${fmt}, ${fmtZahl(n)} Blatt`,
          zeilen: [{ text: `Papier weiss ${z[0]}${fmt}`, menge: n, einheit: "Blatt", preis: null, total: r2(total * a3) }], hinweise: [hinweis] };
      },
    },

    {
      id: "material", gruppe: "Papier & Material", titel: "Material & Zubehör",
      info: "Kartonrollen, Schachteln, Graukarton, Register, Etiketten, Folien …",
      felder: (P) => [
        { id: "artikel", typ: "auswahl", label: "Artikel", opt: optionen(P.material.artikel), std: P.material.artikel.zeilen[0][0] },
        { id: "anzahl", typ: "zahl", label: "Anzahl", std: 1, min: 1 },
      ],
      rechne(v, P) {
        const z = zeileNach(P.material.artikel, v.artikel) || P.material.artikel.zeilen[0];
        return { titel: `${z[0]}`, zeilen: [Z(z[0], num(v.anzahl, 1), z[2], z[1])] };
      },
    },

    /* ===================== DIVERSES ===================== */
    {
      id: "arbeit", gruppe: "Diverses", titel: "Arbeitszeit",
      info: "Arbeitszeit nach Aufwand.",
      felder: (P) => [
        { id: "satz", typ: "auswahl", label: "Tätigkeit", opt: optionen(P.arbeit.saetze), std: P.arbeit.saetze.zeilen[0][0] },
        { id: "stunden", typ: "zahl", label: "Stunden", std: 1, min: 0, schritt: 0.25 },
        { id: "text", typ: "text", label: "Beschreibung (optional)", std: "" },
      ],
      rechne(v, P) {
        const z = zeileNach(P.arbeit.saetze, v.satz) || P.arbeit.saetze.zeilen[0];
        const t = v.text || z[0].replace(/\s*\(.*\)$/, "");
        return { titel: t, zeilen: [Z(t, num(v.stunden), "Std.", z[1])] };
      },
    },

    {
      id: "frei", gruppe: "Diverses", titel: "Freie Position",
      info: "Beliebige Position mit eigenem Text und Preis (z. B. Offsetdruck, Lieferung, Spezialarbeit).",
      felder: () => [
        { id: "text", typ: "text", label: "Bezeichnung", std: "", platzhalter: "z. B. Lieferung Zürich" },
        { id: "menge", typ: "zahl", label: "Menge", std: 1, min: 0, schritt: "any" },
        { id: "einheit", typ: "text", label: "Einheit", std: "Stk.", klein: true },
        { id: "preis", typ: "zahl", label: "Einzelpreis CHF", std: 0, schritt: "any" },
      ],
      rechne(v) {
        const t = v.text || "Freie Position";
        return { titel: t, zeilen: [Z(t, num(v.menge, 1), v.einheit || "Stk.", num(v.preis))] };
      },
    },
  ];

  /* ==========================================================================
     PREIS-INFOS direkt bei den Eingabefeldern
     ab(P)                -> kurzer "ab"-Preis für die Produktliste
     feldInfo[feldId](v, P, ergebnis) -> {
        chips: [{t: Beschriftung, p: Preis, an: aktiv, menge: Wert beim Anklicken}],
        chipTitel, text, opt: { optionWert: "Preistext" } }
     ========================================================================== */
  const f2 = (x) => (x === null || x === undefined ? "–" : (+x).toFixed(2));

  // Staffel als Chips; zeigt bei langen Tabellen ein Fenster um die aktive Stufe
  function chips(tab, sp, menge, { max = 7, art = "bis", einheit = "" } = {}) {
    const rows = tab.zeilen.filter((z) => z[sp] !== null && z[sp] !== undefined);
    let ai = rows.findIndex((z) => z[0] === null || menge <= z[0]);
    if (ai < 0) ai = rows.length - 1;
    const label = (z, i) => {
      if (z[0] === null) return `ab ${fmtZahl((rows[i - 1] ? rows[i - 1][0] : 0) + 1)}`;
      return art === "bis" ? `bis ${fmtZahl(z[0])}` : `${fmtZahl(z[0])}${einheit}`;
    };
    const liste = rows.map((z, i) => ({ t: label(z, i), p: f2(z[sp]), an: i === ai,
      menge: z[0] === null ? (rows[i - 1] ? rows[i - 1][0] + 1 : 1) : z[0] }));
    if (liste.length <= max) return liste;
    const start = Math.max(0, Math.min(ai - Math.floor(max / 2), liste.length - max));
    return liste.slice(start, start + max);
  }
  const optPreise = (tab, fn) => Object.fromEntries(tab.zeilen.map((z) => [z[0], fn(z)]));
  const staffelSp = (tab, i) => tab.zeilen.map((z) => z[i]).filter((x) => x !== null && x !== undefined);
  const minSp = (tab, i) => Math.min(...staffelSp(tab, i));

  const INFO = {
    farbkopie: {
      ab: (P) => `ab ${f2(minSp(P.farbkopie.staffel, 1))} / Kopie`,
      feldInfo: {
        format: (v, P) => ({ opt: { A4: `ab ${f2(minSp(P.farbkopie.staffel, 1))}`, A3: `ab ${f2(minSp(P.farbkopie.staffel, 3))}` } }),
        ex: (v, P) => {
          const sp = (v.format === "A3" ? 2 : 0) + (v.seiten === "2" ? 1 : 0) + 1;
          return { chipTitel: `Preis pro ${v.seiten === "2" ? "Bogen" : "Kopie"}`, chips: chips(P.farbkopie.staffel, sp, num(v.ex, 1), { max: 9 }) };
        },
        papier: (v, P) => ({ opt: optPreise(P.farbkopie.papier, (z) => { const p = z[v.format === "A3" ? 2 : 1]; return p > 0 ? `+${f2(p)} / Bogen` : "inkl."; }) }),
        daten: (v, P) => ({ opt: { keine: "", pdf: `${f2(P.farbkopie.pdfErstes)} + ${f2(P.farbkopie.pdfWeiteres)} je weitere`, aufwendig: `${f2(P.farbkopie.aufwendig)} + ${f2(P.farbkopie.proMinute)}/Min.` } }),
        ...Object.fromEntries(window.PREISE.farbkopie.spezial.zeilen.map((_, i) => ["sp" + i, (v, P) => {
          const z = P.farbkopie.spezial.zeilen[i]; return z ? { text: `${f2(z[1])} pro ${z[2]}` } : {};
        }])),
      },
    },
    swkopie: {
      ab: (P) => { const t = P.swkopie.staffel.zeilen, l = t[t.length - 1]; return `ab ${f2(l[1] / l[0])} / Kopie`; },
      feldInfo: {
        format: (v, P) => ({ opt: { A3: `× ${P.swkopie.faktorA3}` } }),
        seiten: () => ({ opt: { "2": "× 2" } }),
        ex: (v, P, e) => {
          const S = P.swkopie, orig = num(v.originale, 1), ex = num(v.ex, 1);
          const n = orig >= S.vorlagenrabattAb ? orig * ex : ex;
          const kop = e && e.zeilen && e.zeilen[0];
          const tab = { zeilen: [[9, S.einzelBis9 * 9], ...S.staffel.zeilen] };
          return {
            chipTitel: "Gesamtpreis A4 einseitig", chips: chips(tab, 1, n, { art: "genau", einheit: " Kop." }),
            text: kop ? `≈ ${f2(kop.total / kop.menge)} pro Kopie · 1–9 Kopien: ${f2(S.einzelBis9)} pro Stück` : "",
          };
        },
        originale: (v, P) => ({ text: num(v.originale, 1) >= P.swkopie.vorlagenrabattAb ? `Vorlagenrabatt aktiv (ab ${P.swkopie.vorlagenrabattAb} Vorlagen)` : `Ab ${P.swkopie.vorlagenrabattAb} Vorlagen gilt der Preis der Gesamtmenge` }),
        papier: (v, P) => {
          const blatt = (v.seiten === "2" ? Math.ceil(num(v.originale, 1) / 2) : num(v.originale, 1)) * num(v.ex, 1);
          const g = P.papierzuschlag.grenzen.zeilen[0].slice(1);
          let i = g.findIndex((x) => blatt <= x); if (i < 0) i = 3;
          const o = {};
          P.papierzuschlag.a4.zeilen.forEach((z) => {
            const z3 = zeileNach(P.papierzuschlag.a3, z[0]);
            const rp = v.format === "A3" ? (z3 ? z3[i + 1] : z[i + 1] * 2) : z[i + 1];
            o[z[0]] = `+${rp} Rp./Blatt`;
          });
          return { opt: o, text: v.papier ? `Zuschlag für ${fmtZahl(blatt)} Blatt` : "" };
        },
        angeliefert: (v, P) => ({ text: `−${P.swkopie.papierRabattProBlatt * 100} Rp. pro Blatt ab ${P.swkopie.papierRabattAb} Blatt` }),
        klammern: (v, P) => ({ text: `${f2(P.swkopie.heftenProKlammer)} pro Klammer` }),
        einstellungen: (v, P) => ({ text: `${f2(P.swkopie.einstellung)} pro Einstellung` }),
      },
    },
    buchkopie: {
      ab: (P) => `${f2(P.buchkopie.stunde)} / Std. + Kopien`,
      feldInfo: {
        stunden: (v, P) => ({ text: `${f2(P.buchkopie.stunde)} pro Stunde` }),
        a4: (v, P) => ({ text: `${f2(P.buchkopie.a4)} pro Kopie` }),
        a3: (v, P) => ({ text: `${f2(P.buchkopie.a3)} pro Kopie` }),
      },
    },
    visitenkarten: {
      ab: (P) => `ab ${f2(P.visitenkarten.preise.zeilen[0][1])} / ${P.visitenkarten.preise.zeilen[0][0]} Stk.`,
      feldInfo: {
        druck: (v, P) => ({ opt: { "1": `ab ${f2(minSp(P.visitenkarten.preise, 1))}`, "2": `ab ${f2(minSp(P.visitenkarten.preise, 2))}` } }),
        auflage: (v, P) => ({ chipTitel: "Preis pro Auflage (einseitig)", chips: chips(P.visitenkarten.preise, v.druck === "2" ? 2 : 1, num(v.auflage, 1), { art: "genau", einheit: " Stk.", max: 8 }) }),
        nachdruck: (v, P) => ({ text: `−${f2(P.visitenkarten.nachdruckRabatt)}` }),
        boexli: (v, P) => ({ text: `${f2(P.visitenkarten.boexli)} pro Böxli` }),
      },
    },
    broschueren: {
      ab: (P) => `ab ${f2(P.broschueren.A5.zeilen[0][1])} / 50 Ex.`,
      feldInfo: {
        seiten: (v, P) => {
          const T = P.broschueren[v.format], aufl = num(v.auflage, 1);
          let ai = T.auflagen.findIndex((a) => aufl <= a); if (ai < 0) ai = T.auflagen.length - 1;
          return { chipTitel: `Gesamtpreis bei ${fmtZahl(T.auflagen[ai])} Ex.`, chips: chips({ zeilen: T.zeilen.map((z) => [z[0], z[ai + 1]]) }, 1, num(v.seiten, 8), { art: "genau", einheit: " S.", max: 6 }) };
        },
        auflage: (v, P) => {
          const T = P.broschueren[v.format], z = T.zeilen.find((r) => num(v.seiten, 8) <= r[0]);
          if (!z) return {};
          return { chipTitel: `Gesamtpreis bei ${z[0]} Seiten`, chips: chips({ zeilen: T.auflagen.map((a, i) => [a, z[i + 1]]) }, 1, num(v.auflage, 1), { art: "genau", einheit: " Ex." }) };
        },
        umschlag: (v, P) => ({ text: `+${f2(v.format === "A5" ? P.broschueren.umschlagA5 : P.broschueren.umschlagA4)} pro Exemplar` }),
      },
    },
    durchschreibe: {
      ab: (P) => `ab ${f2(P.durchschreibe.preise.zeilen[0][1])} / 100 Sätze`,
      feldInfo: {
        fach: (v, P) => ({ opt: { "1": `ab ${f2(P.durchschreibe.preise.zeilen[0][1])}`, "2": `ab ${f2(P.durchschreibe.preise.zeilen[0][2])}` } }),
        auflage: (v, P) => ({ chipTitel: "Gesamtpreis", chips: chips(P.durchschreibe.preise, +v.fach, num(v.auflage, 1), { art: "genau", einheit: " Sätze" }) }),
      },
    },
    planplot: {
      ab: (P) => `ab ${f2(minSp(P.planplot.sw, 1))} / Plot A2`,
      feldInfo: {
        format: (v, P) => {
          const z = stufe(P.planplot[v.farbe], num(v.anzahl, 1));
          return { opt: { A2: f2(z[1]), A1: f2(z[2]), A0: f2(z[3]), m2: `${f2(z[4])}/m²` } };
        },
        farbe: (v, P) => ({ opt: { sw: `ab ${f2(minSp(P.planplot.sw, 1))}`, farbig: `ab ${f2(minSp(P.planplot.farbig, 1))}` } }),
        anzahl: (v, P) => {
          const sp = { A2: 1, A1: 2, A0: 3, m2: 4 }[v.format];
          return { chipTitel: `Preis pro Plot ${v.format === "m2" ? "(pro m²)" : v.format}`, chips: chips(P.planplot[v.farbe], sp, num(v.anzahl, 1)) };
        },
        material: (v, P) => ({ opt: { "": "inkl.", plot120: `+${f2(P.planplot.plotpapier120M2)}/m²`, transparent: `+${f2(P.planplot.transparentM2)}/m²` } }),
        falten: (v, P) => { const sp = { A2: 1, A1: 2, A0: 3, m2: 4 }[v.format]; return { text: `${f2(P.planplot.falten.zeilen[0][sp])} pro ${v.format === "m2" ? "m²" : "Plot"}` }; },
        datentraeger: (v, P) => ({ text: `${f2(P.planplot.abDatentraeger)} pro Auftrag` }),
      },
    },
    grafikplot: {
      ab: (P) => `ab ${f2(minSp(P.grafikplot.staffel, 1))} / Stk.`,
      feldInfo: {
        format: (v, P) => {
          const z = stufe(P.grafikplot.staffel, num(v.anzahl, 1));
          return { opt: Object.fromEntries(P.grafikplot.formate.zeilen.map((_, i) => [String(i), `${f2(z[i + 1])} / Stk.`])) };
        },
        anzahl: (v, P) => ({ chipTitel: "Preis pro Stück", chips: chips(P.grafikplot.staffel, num(v.format, 0) + 1, num(v.anzahl, 1)) }),
        material: (v, P) => ({ opt: optPreise(P.grafikplot.material, (z) => (z[1] > 0 ? `+${f2(z[1])}/m²` : "inkl.")) }),
        schwarz: (v, P) => ({ text: `−${P.grafikplot.schwarzRabatt} % auf den Druckpreis` }),
        scanA4: (v, P) => ({ text: `${f2(P.grafikplot.scanA4)} pro Vorlage` }),
        scanA3: (v, P) => ({ text: `${f2(P.grafikplot.scanA3)} pro Vorlage` }),
        stunden: (v, P) => ({ text: `${f2(P.grafikplot.stunde)} pro Stunde` }),
      },
    },
    scan: {
      ab: (P) => `${f2(P.scan.grundA4)} + ${f2(P.scan.proSeite)} / Seite`,
      feldInfo: {
        art: (v, P) => ({ opt: { A4: `${f2(P.scan.grundA4)} + ${f2(P.scan.proSeite)}/S.`, A3: `${f2(P.scan.grundA3)} + ${f2(P.scan.proSeite)}/S.`, gross: `ab ${f2(P.scan.grossSwMin)}` } }),
        pdfs: (v, P) => ({ text: `Grundpreis ${f2(v.art === "A3" ? P.scan.grundA3 : P.scan.grundA4)} pro PDF` }),
        seiten: (v, P) => ({ text: `${f2(P.scan.proSeite)} pro Seite` }),
        farbe: (v, P) => ({ opt: { sw: `${f2(P.scan.grossSwM2)}/m²`, farbig: `${f2(P.scan.grossFarbigM2)}/m²` } }),
        m2: (v, P) => { const f = v.farbe === "farbig"; return { text: `${f2(f ? P.scan.grossFarbigM2 : P.scan.grossSwM2)} pro m², mindestens ${f2(f ? P.scan.grossFarbigMin : P.scan.grossSwMin)}` }; },
      },
    },
    bindung: {
      ab: (P) => `ab ${f2(P.bindung.fastback.zeilen[0][2])} / Stk.`,
      feldInfo: {
        art: (v, P) => ({ opt: { gbc: `ab ${f2(P.bindung.gbc.zeilen[0][2])}`, wireo: `ab ${f2(P.bindung.wireo.zeilen[0][2])}`, fastback: `ab ${f2(P.bindung.fastback.zeilen[0][2])}`, klemm: `ab ${f2(P.bindung.klemmschieneNormal)}` } }),
        blatt: (v, P) => {
          const T = P.bindung[v.art]; if (!T) return {};
          const tab = { zeilen: T.zeilen.map((z) => [z[1], z[2]]) };
          return { chipTitel: "Preis pro Stück nach Blattzahl", chips: chips(tab, 1, num(v.blatt, 1), { art: "bis", max: 6 }).map((c) => ({ ...c, t: c.t + " Bl." })) };
        },
        klemmtyp: (v, P) => ({ opt: { n: f2(P.bindung.klemmschieneNormal), o: f2(P.bindung.klemmschieneOrdner) } }),
        anzahl: (v, P) => (v.art === "klemm" ? {} : { text: "Mengenrabatt: " + P.bindung.mengenrabatt.zeilen.map((z) => `ab ${z[0]} Stk. −${z[1]} %`).join(", ") }),
        a3: (v, P) => ({ text: `+${f2(P.bindung.a3Zuschlag)} pro Stück` }),
        kalender: (v, P) => ({ text: `+${P.bindung.kalenderZuschlag} %` }),
      },
    },
    falzen: {
      ab: (P) => `ab ${f2(P.falzen.preise.zeilen[0][1])} / 100 Stk.`,
      feldInfo: {
        bruch: (v, P) => {
          const a = num(v.auflage, 1);
          return { opt: Object.fromEntries(P.falzen.preise.spalten.map((_, i) => [String(i + 1), `${f2(auflagePreis(P.falzen.preise, a, i + 1).preis)} für ${fmtZahl(a)} Stk.`])) };
        },
        auflage: (v, P) => ({ chipTitel: "Gesamtpreis", chips: chips(P.falzen.preise, num(v.bruch, 1), num(v.auflage, 1), { art: "genau", einheit: " Stk." }) }),
        stufen: (v, P) => ({ text: `+${P.falzen.formatstufe} % pro Formatstufe` }),
        stunden: (v, P) => ({ text: `${f2(P.falzen.handStunde)} pro Stunde` }),
      },
    },
    rillen: {
      ab: (P) => `ab ${f2(P.rillen.manuellGrund)} + ${f2(P.rillen.manuellProStueck)} / Stk.`,
      feldInfo: {
        methode: (v, P) => {
          const R = P.rillen, l = v.linien === "2" ? 2 : 1;
          return { opt: { m: `${f2(R["maschineEinrichten" + l])} + ${f2(R["maschinePro100_" + l])}/100`, h: `${f2(R["handEinrichten" + l])} + ${f2(R["handProBogen" + l])}/Bogen`, e: `${f2(R.manuellGrund)} + ${f2(R.manuellProStueck)}/Stk.` } };
        },
        anzahl: (v, P) => (v.methode === "h" ? { text: `Mindestverrechnung ${f2(P.rillen.handMinimum)} pro Auftrag` } : {}),
      },
    },
    zusammentragen: {
      ab: (P) => `ab ${f2(P.zusammentragen.preise.zeilen[0][1])} / 1000 Blatt`,
      feldInfo: {
        saetze: (v, P) => {
          const blatt = num(v.blattProSatz, 1) * num(v.saetze, 1);
          return { chipTitel: `Gesamtpreis (${fmtZahl(blatt)} Blatt total)`, chips: chips(P.zusammentragen.preise, 1, blatt, { art: "genau", einheit: " Bl." }) };
        },
        papier: (v, P) => ({ opt: optPreise(P.zusammentragen.zuschlaege, (z) => (z[1] ? `+${z[1]} %` : "")) }),
      },
    },
    lochen: {
      ab: (P) => `ab ${f2(P.lochen.preise.zeilen[0][1])} / 500 Blatt`,
      feldInfo: {
        art: (v, P) => ({ opt: { "1": `ab ${f2(P.lochen.preise.zeilen[0][1])}`, "2": `ab ${f2(P.lochen.preise.zeilen[0][2])}` } }),
        blatt: (v, P) => {
          const L = P.lochen.preise, offen = L.zeilen.find((z) => z[0] === null);
          return { chipTitel: "Gesamtpreis", chips: chips({ zeilen: L.zeilen.filter((z) => z[0] !== null) }, +v.art, num(v.blatt, 1), { art: "genau", einheit: " Bl." }),
            text: offen ? `über ${fmtZahl(L.zeilen[L.zeilen.length - 2][0])} Blatt: +${f2(offen[+v.art])} pro weitere 1000` : "" };
        },
        p120: (v, P) => ({ text: `+${P.lochen.zuschlag120} %` }),
      },
    },
    heften: {
      ab: (P) => `ab ${f2(P.heften.preise.zeilen[0][1])} / 100 Ex.`,
      feldInfo: { auflage: (v, P) => ({ chipTitel: "Gesamtpreis", chips: chips(P.heften.preise, 1, num(v.auflage, 1), { art: "genau", einheit: " Ex." }) }) },
    },
    leimen: {
      ab: (P) => `${f2(P.leimen.grundpreis)} + ab ${f2(minSp(P.leimen.staffel, 1))} / Block`,
      feldInfo: {
        format: (v, P) => ({ opt: { A4: `+${P.leimen.zuschlagA4} %` } }),
        blatt: (v, P) => { const z = stufe(P.leimen.staffel, num(v.bloecke, 1)); return { opt: { "1": `${f2(z[1])}/Block`, "2": `${f2(z[2])}/Block` } }; },
        bloecke: (v, P) => ({ chipTitel: `Preis pro Block (+ Grundpreis ${f2(P.leimen.grundpreis)})`, chips: chips(P.leimen.staffel, +v.blatt, num(v.bloecke, 1)) }),
        graukarton: (v, P) => ({ text: `${f2(P.leimen.graukarton)} pro Block` }),
      },
    },
    schneiden: {
      ab: (P) => `${f2(P.schneiden.grundpreis)} + ab ${f2(Math.min(...P.schneiden.proTausend.zeilen[0].slice(1)))} / 1000`,
      feldInfo: {
        art: (v, P) => ({ opt: { s: `${f2(P.schneiden.grundpreis)} + pro 1000`, b: `${f2(P.schneiden.blockschnitt)}/Schnitt` } }),
        format: (v, P) => ({ opt: Object.fromEntries(P.schneiden.proTausend.spalten.map((s, i) => [s, `${f2(P.schneiden.proTausend.zeilen[0][i + 1])}/1000`])) }),
        blatt: (v, P) => ({ text: `Grundpreis ${f2(P.schneiden.grundpreis)} + Preis pro 1000 Blatt` }),
        schnitte: (v, P) => ({ text: `${f2(P.schneiden.blockschnitt)} pro Schnitt` }),
      },
    },
    laminieren: {
      ab: (P) => `ab ${f2(minSp(P.laminieren.standard, 4))} / Stk.`,
      feldInfo: {
        ...Object.fromEntries([["fs", "standard"], ["fk", "selbstklebend"], ["fg", "gross"]].map(([id, typ]) => [id, (v, P) => {
          const T = P.laminieren[typ], z = stufe(T, num(v.anzahl, 1));
          return { opt: Object.fromEntries(T.spalten.map((s, i) => [s, f2(z[i + 1])])) };
        }])),
        anzahl: (v, P) => {
          const T = P.laminieren[v.typ], f = { standard: v.fs, selbstklebend: v.fk, gross: v.fg }[v.typ];
          return { chipTitel: `Preis pro Stück ${f}`, chips: chips(T, T.spalten.indexOf(f) + 1, num(v.anzahl, 1)) };
        },
        einseitig: (v, P) => ({ text: `+${P.laminieren.zuschlagSelbstklebend} %` }),
      },
    },
    aufziehen: {
      ab: (P) => `ab ${f2(P.aufziehen.formate.zeilen[0][1])} / Platte A4`,
      feldInfo: {
        format: (v, P) => ({ opt: Object.fromEntries(P.aufziehen.formate.spalten.map((s, i) => [s, f2(P.aufziehen.formate.zeilen[0][i + 1])])) }),
        anzahl: (v, P) => ({ text: "Mengenrabatt: " + P.aufziehen.rabatt.zeilen.map((z) => `ab ${z[0]} Stk. −${z[1]} %`).join(", ") }),
        steller: (v, P) => ({ text: `${f2(P.aufziehen.steller)} pro Stück` }),
        anhaenger: (v, P) => ({ text: `${f2(P.aufziehen.anhaenger)} pro Stück` }),
      },
    },
    broschuerenManuell: {
      ab: (P) => `ab ${f2(minSp(P.broschuerenManuell.staffel, 1))} / Stk. + Einrichten`,
      feldInfo: {
        auflage: (v, P) => ({ chipTitel: "Preis pro Broschüre", chips: chips(P.broschuerenManuell.staffel, 1, num(v.auflage, 1)) }),
        bogen: (v, P) => ({ text: `ab ${P.broschuerenManuell.zuschlagAbBogen} Bogen +${P.broschuerenManuell.zuschlagProzent} %` }),
      },
    },
    papierverkauf: {
      ab: (P) => `ab ${f2(P.kopierpapier.paket500)} / 500 Blatt`,
      feldInfo: {
        format: () => ({ opt: { A3: "× 2" } }),
        blatt: (v, P) => {
          const s = String(v.sorte), K = P.kopierpapier;
          if (s === "kp" || s === "kpr") return { text: `Paket 500 Bl. ${f2(K.paket500)} · ab 1000: ${f2(K.proTausend)}/1000 · ab 5000: ${f2(K.proTausend5000)}/1000 · ab 10'000: ${f2(K.proTausend10000)}/1000${s === "kpr" ? ` · Recycling +${f2(K.recyclingZuschlag)}/1000` : ""}` };
          if (s.startsWith("f:")) {
            const z = zeileNach(P.papierFarbig.staffel, s.slice(2)); if (!z) return {};
            return { text: `Kleinmengen (Rp./Blatt): bis 10: ${z[6]} · bis 50: ${z[7]} · bis 100: ${z[8]} · bis 500: ${z[9]} — ab 500: ${f2(z[3])}/1000 · ab 2000: ${f2(z[4])}/1000 · ab 5000: ${f2(z[5])}/1000` };
          }
          const z = zeileNach(P.papierWeiss.staffel, s.slice(2)); if (!z) return {};
          return { text: `Paket ${z[1]} Bl. ${f2(z[2])} · ab 1000: ${f2(z[3])}/1000 · ab 2000: ${f2(z[4])}/1000 · ab 5000: ${f2(z[5])}/1000` };
        },
      },
    },
    material: {
      ab: () => "Stückpreise",
      feldInfo: {
        artikel: (v, P) => ({ opt: optPreise(P.material.artikel, (z) => `${f2(z[1])} / ${z[2]}`) }),
      },
    },
    arbeit: {
      ab: (P) => `ab ${f2(Math.min(...staffelSp(P.arbeit.saetze, 1)))} / Std.`,
      feldInfo: { satz: (v, P) => ({ opt: optPreise(P.arbeit.saetze, (z) => `${f2(z[1])} / Std.`) }) },
    },
    frei: { ab: () => "eigener Text & Preis" },
  };
  PRODUKTE.forEach((p) => Object.assign(p, INFO[p.id] || {}));

  // Spezialarbeiten bei der Farbkopie einklappbar machen
  const fk = PRODUKTE.find((p) => p.id === "farbkopie"), fkFelder = fk.felder;
  fk.felder = (P) => fkFelder(P).map((f) => (f.id === "_sp" ? { ...f, einklappbar: true } : f));
  const gp = PRODUKTE.find((p) => p.id === "grafikplot"), gpFelder = gp.felder;
  gp.felder = (P) => gpFelder(P).map((f) => (f.id === "_b" ? { ...f, einklappbar: true } : f));

  window.PRODUKTE = PRODUKTE;
  window.CQ = { r2, num, fmtZahl };
})();
