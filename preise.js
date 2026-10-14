/* ==========================================================================
   PREISLISTE – hier werden alle Preise gepflegt.
   --------------------------------------------------------------------------
   • Alle Preise in CHF inkl. MwSt.
   • Tabellen haben "spalten" (Überschriften) und "zeilen".
     Die erste Zahl einer Zeile ist die Mengen-Grenze ("bis Menge").
     null = "und mehr" (offenes Ende).
   • Felder, die mit "_" beginnen, sind nur Beschriftungen/Hinweise.
   • Alternativ: im Rechner unter "Preise bearbeiten" ändern und die
     neue preise.js herunterladen.
   ========================================================================== */
window.PREISE = {
  "meta": {
    "_titel": "Allgemein",
    "_labels": {
      "preislisteVersion": "Preisliste Version",
      "mwstSatz": "MwSt-Satz in % (in Preisen enthalten)",
      "rundung": "Rundung Endbetrag (CHF)",
      "gueltigkeitTage": "Offerte gültig (Tage)"
    },
    "preislisteVersion": "2024",
    "mwstSatz": 8.1,
    "rundung": 0.05,
    "gueltigkeitTage": 30
  },

  "firma": {
    "_titel": "Firma (Kopf der Offerte)",
    "_labels": {
      "name": "Firmenname",
      "zeile1": "Adresszeile 1",
      "zeile2": "Adresszeile 2",
      "telefon": "Telefon",
      "email": "E-Mail",
      "web": "Webseite",
      "mwstNr": "MwSt-Nr.",
      "bedingungen": "Konditionen (Fusszeile)"
    },
    "name": "Copy Quick Digital AG",
    "zeile1": "Birmensdorferstr. 155, 8003 Zürich · Tel. 044 463 38 88",
    "zeile2": "Bahnhof Stadelhofen, Stadelhoferstr. 8, 8001 Zürich · Tel. 044 252 67 25",
    "telefon": "044 463 38 88",
    "email": "info@copy-quick.ch",
    "web": "www.copy-quick.ch",
    "mwstNr": "CHE-101.416.444",
    "bedingungen": "Unsere Preise sind Abholpreise. Beträge unter Fr. 300.– gegen Bar- oder Kartenzahlung (Debit-, Kreditkarten, TWINT). Für grössere Aufträge verlangen wir eine Anzahlung. Lieferung an Ihre Adresse gegen bescheidenen Unkostenbeitrag. Reklamationen sind sofort bei Abholung anzubringen. Preisänderungen vorbehalten."
  },

  /* ---------------------------------------------------------------- Kopien */
  "farbkopie": {
    "_titel": "Farblaserkopie A4/A3 (90 g/m² hochweiss satiniert)",
    "_labels": {
      "pdfErstes": "PDF Grundpreis (erstes PDF)",
      "pdfWeiteres": "jedes weitere PDF",
      "aufwendig": "Aufwendige Daten (Word, PS, Excel …)",
      "proMinute": "Datenaufbereitung pro Minute"
    },
    "pdfErstes": 2.00,
    "pdfWeiteres": 0.50,
    "aufwendig": 5.00,
    "proMinute": 2.00,
    "staffel": {
      "_titel": "Preis pro Kopie/Bogen – Staffel nach Kopien pro Original",
      "zeilenTitel": "bis Kopien",
      "spalten": ["A4 1-seitig", "A4 2-seitig", "A3 1-seitig", "A3 2-seitig"],
      "zeilen": [
        [20,   1.20, 2.20, 1.70, 2.70],
        [50,   1.00, 2.00, 1.50, 2.50],
        [100,  0.90, 1.70, 1.40, 2.40],
        [200,  0.80, 1.50, 1.30, 2.30],
        [300,  0.70, 1.40, 1.20, 2.20],
        [400,  0.60, 1.20, 1.10, 2.10],
        [500,  0.50, 1.00, 1.00, 2.00],
        [1000, 0.40, 0.80, 0.90, 1.90],
        [null, 0.35, 0.70, 0.85, 1.80]
      ]
    },
    "papier": {
      "_titel": "Papierzuschlag Farbkopie (pro Bogen)",
      "zeilenTitel": "Papier",
      "spalten": ["A4", "A3"],
      "zeilen": [
        ["Standard 90 g/m² hochweiss satiniert", 0.00, 0.00],
        ["Color Copy hochweiss 120 g/m²", 0.10, 0.20],
        ["Color Copy hochweiss 160 g/m²", 0.15, 0.30],
        ["Color Copy hochweiss 200 g/m²", 0.20, 0.40],
        ["Color Copy hochweiss 250 g/m²", 0.30, 0.60],
        ["Color Copy hochweiss 300 g/m²", 0.40, 0.80],
        ["Color Copy hochweiss 350 g/m²", 0.45, 0.90]
      ]
    },
    "spezial": {
      "_titel": "Zuschläge für Spezialarbeiten",
      "zeilenTitel": "Arbeit",
      "spalten": ["Preis", "Einheit"],
      "zeilen": [
        ["A4 Projektionsfolie (OHP)", 2.50, "Folie"],
        ["Farbumwandlung / Farbabstimmung", 1.50, "Einstellung"],
        ["Vergrössern / verkleinern (25–400 %)", 1.00, "Einstellung"],
        ["Verzerren, X/Y-Achsen-Verschiebung", 2.00, "Einstellung"],
        ["Umkehrung positiv / negativ", 1.00, "Einstellung"],
        ["Bildwiederholung (Vorder-/Rückseite Pass)", 1.50, "Einstellung"]
      ]
    }
  },

  "buchkopie": {
    "_titel": "Kopieren aus Büchern / gehefteten Vorlagen",
    "_labels": { "stunde": "Arbeitszeit pro Stunde", "a4": "Kopie A4", "a3": "Kopie A3" },
    "stunde": 60.00,
    "a4": 0.30,
    "a3": 0.50
  },

  "swkopie": {
    "_titel": "Seriekopie S/W (A4, einseitig)",
    "_labels": {
      "einzelBis9": "Preis pro Kopie bei 1–9 Kopien",
      "pro100Ueber1000": "über 1000 Kopien: pro weitere 100",
      "faktorA3": "Faktor A3 (× A4-Tarif)",
      "vorlagenrabattAb": "Vorlagenrabatt: Gesamtmenge ab … Vorlagen",
      "heftenProKlammer": "Heften pro Klammer",
      "einstellung": "Bildüberlagerung/Editieren pro Einstellung",
      "papierRabattProBlatt": "Rabatt angeliefertes Papier pro Blatt",
      "papierRabattAb": "Rabatt angeliefertes Papier ab Blatt"
    },
    "einzelBis9": 0.30,
    "pro100Ueber1000": 8.00,
    "faktorA3": 1.5,
    "vorlagenrabattAb": 20,
    "heftenProKlammer": 0.10,
    "einstellung": 2.00,
    "papierRabattProBlatt": 0.01,
    "papierRabattAb": 500,
    "staffel": {
      "_titel": "Gesamtpreis nach Anzahl Kopien (Zwischenwerte werden interpoliert)",
      "zeilenTitel": "Kopien",
      "spalten": ["Preis total"],
      "zeilen": [
        [10, 2.80], [15, 3.90], [20, 5.00], [25, 6.50], [30, 7.00], [35, 7.90],
        [40, 8.70], [45, 9.70], [50, 10.60], [60, 11.70], [70, 13.10], [80, 14.30],
        [90, 15.40], [100, 16.60], [110, 17.80], [120, 18.90], [130, 20.20],
        [140, 21.40], [150, 22.60], [160, 23.70], [170, 24.80], [180, 25.90],
        [190, 27.20], [200, 28.30], [250, 33.40], [300, 38.40], [350, 43.40],
        [400, 48.50], [450, 53.50], [500, 58.80], [600, 65.90], [700, 73.00],
        [800, 80.20], [900, 87.30], [1000, 94.40]
      ]
    }
  },

  "papierzuschlag": {
    "_titel": "Papierzuschläge S/W-Kopie (Rappen pro Blatt)",
    "a4": {
      "_titel": "Format A4 – Rappen pro Blatt",
      "zeilenTitel": "Papier",
      "spalten": ["1–100", "101–500", "501–1000", "ab 1001"],
      "zeilen": [
        ["Weiss 100 g/m²", 5.0, 4.5, 4.0, 3.5],
        ["Weiss 120 g/m²", 8.5, 7.5, 6.0, 5.5],
        ["Weiss 160 g/m²", 15.0, 13.0, 12.0, 11.0],
        ["Weiss 200 g/m²", 18.0, 15.0, 14.0, 13.0],
        ["Biotop 80 g/m²", 7.0, 6.0, 5.5, 5.0],
        ["Biotop 160 g/m²", 17.0, 15.0, 13.0, 11.0],
        ["Umweltschutz (UWS) 80 g/m²", 8.0, 7.0, 6.5, 6.0],
        ["Farbig 80 g/m²", 7.5, 6.5, 5.5, 5.0],
        ["Farbig 100 g/m²", 11.0, 10.0, 9.0, 8.0],
        ["Farbig 160 g/m²", 18.0, 16.0, 15.0, 13.0],
        ["QR-Rechnungspapier 80 g/m²", 20.0, 20.0, 20.0, 20.0]
      ]
    },
    "a3": {
      "_titel": "Format A3 – Rappen pro Blatt (fehlende Sorten = 2 × A4)",
      "zeilenTitel": "Papier",
      "spalten": ["1–100", "101–500", "501–1000", "ab 1001"],
      "zeilen": [
        ["Weiss 100 g/m²", 10.0, 9.0, 8.0, 7.0],
        ["Weiss 120 g/m²", 17.0, 15.0, 12.0, 11.0],
        ["Weiss 160 g/m²", 30.0, 26.0, 24.0, 22.0],
        ["Weiss 200 g/m²", 36.0, 30.0, 28.0, 26.0],
        ["Farbig 80 g/m²", 14.0, 13.0, 11.0, 10.0],
        ["Farbig 100 g/m²", 22.0, 20.0, 18.0, 16.0],
        ["Farbig 160 g/m²", 36.0, 32.0, 30.0, 26.0]
      ]
    },
    "grenzen": {
      "_titel": "Mengengrenzen der Spalten (Blatt)",
      "zeilenTitel": "",
      "spalten": ["Spalte 1 bis", "Spalte 2 bis", "Spalte 3 bis"],
      "zeilen": [["Blatt", 100, 500, 1000]]
    }
  },

  /* -------------------------------------------------------- Drucksachen */
  "visitenkarten": {
    "_titel": "Visitenkarten Laserdruck (max. A7, 300 g/m², inkl. Satz & Gestaltung)",
    "_labels": {
      "faktorDoppelseitig": "Faktor doppelseitig",
      "faktor41": "Faktor doppelseitig 4/1-farbig",
      "faktorDoppelkarte": "Faktor Doppelkarte 4-seitig",
      "nachdruckRabatt": "Rabatt Nachdruck ohne Satzänderung (CHF)",
      "boexli": "VK-Böxli pro Stück"
    },
    "faktorDoppelseitig": 1.5,
    "faktor41": 1.3,
    "faktorDoppelkarte": 1.8,
    "nachdruckRabatt": 10.00,
    "boexli": 2.50,
    "preise": {
      "_titel": "Gesamtpreis pro Auflage (leere Zelle = nicht angeboten)",
      "zeilenTitel": "Auflage",
      "spalten": ["S/W 1-farbig", "4-farbig"],
      "zeilen": [
        [50, 40.00, 70.00], [100, 45.00, 79.00], [200, 65.00, 104.00],
        [300, 83.00, 129.00], [400, 95.00, 154.00], [500, 102.00, 179.00],
        [600, 112.00, 199.00], [700, 124.00, 219.00], [800, 136.00, 239.00],
        [900, 148.00, 259.00], [1000, 155.00, 279.00], [2000, 200.00, null]
      ]
    }
  },

  "broschueren": {
    "_titel": "Broschüren S/W (inkl. Druck, Zusammentragen, Falzen, 2× Heften, Schneiden)",
    "_labels": {
      "umschlagA5": "Farbiger Umschlag 160 g bei A5 (pro Ex.)",
      "umschlagA4": "Farbiger Umschlag 160 g bei A4 (pro Ex.)"
    },
    "umschlagA5": 0.20,
    "umschlagA4": 0.40,
    "A5": {
      "_titel": "Format A5 – Gesamtpreis",
      "zeilenTitel": "Seiten",
      "spalten": ["50 Ex", "100 Ex", "250 Ex", "500 Ex", "1000 Ex"],
      "auflagen": [50, 100, 250, 500, 1000],
      "zeilen": [
        [8, 83.00, 139.00, 252.00, 386.00, 687.00],
        [16, 117.00, 207.00, 391.00, 578.00, 1009.00],
        [24, 152.00, 276.00, 530.00, 769.00, 1350.00],
        [32, 186.00, 339.00, 687.00, 945.00, 1636.00],
        [40, 220.00, 348.00, 566.00, 1099.00, 1707.00],
        [48, 216.00, 352.00, 817.00, 1215.00, 1983.00]
      ]
    },
    "A4": {
      "_titel": "Format A4 – Gesamtpreis",
      "zeilenTitel": "Seiten",
      "spalten": ["50 Ex", "100 Ex", "250 Ex", "500 Ex", "1000 Ex"],
      "auflagen": [50, 100, 250, 500, 1000],
      "zeilen": [
        [8, 117.00, 207.00, 391.00, 578.00, 1009.00],
        [16, 186.00, 344.00, 669.00, 961.00, 1689.00],
        [24, 254.00, 481.00, 947.00, 1344.00, 2370.00],
        [32, 322.00, 613.00, 1124.00, 1711.00, 2997.00],
        [40, 391.00, 626.00, 1267.00, 2003.00, 3085.00],
        [48, 382.00, 653.00, 1421.00, 2185.00, 3537.00]
      ]
    }
  },

  "broschuerenManuell": {
    "_titel": "Broschüren manuell binden A5 (falten, 2× heften, Frontschnitt)",
    "_labels": {
      "einrichtenMin": "Einrichten minimal",
      "einrichtenMax": "Einrichten maximal",
      "zuschlagAbBogen": "Zuschlag ab Anzahl Bogen",
      "zuschlagProzent": "Zuschlag in %"
    },
    "einrichtenMin": 5.00,
    "einrichtenMax": 25.00,
    "zuschlagAbBogen": 7,
    "zuschlagProzent": 20,
    "staffel": {
      "_titel": "Preis pro Broschüre",
      "zeilenTitel": "bis Auflage",
      "spalten": ["pro Stück"],
      "zeilen": [[50, 1.00], [100, 0.80], [null, 0.70]]
    }
  },

  "durchschreibe": {
    "_titel": "Durchschreibegarnituren A4 (80 g/m², alle Blätter gleich bedruckt)",
    "_labels": { "zuschlag500bis1000": "Zwischen 500 und 1000: Preis 1000 + Zuschlag %" },
    "zuschlag500bis1000": 20,
    "preise": {
      "_titel": "Gesamtpreis",
      "zeilenTitel": "Auflage",
      "spalten": ["2-fach", "3-fach"],
      "zeilen": [
        [100, 174.00, 208.00], [200, 212.00, 254.00], [300, 239.00, 286.00],
        [400, 266.00, 319.00], [500, 294.00, 352.00], [1000, 447.00, 535.00]
      ]
    }
  },

  /* ----------------------------------------------------------- Grossformat */
  "planplot": {
    "_titel": "Planplot / Grosskopie (CAD, 90/120 g/m², bis 89 cm Breite)",
    "_labels": {
      "abDatentraeger": "Ausdruck ab Datenträger (pro Auftrag)",
      "transparentM2": "Transparentpapier 95 g/m² (pro m²)",
      "plotpapier120M2": "Plotpapier 120 g/m² (pro m²)"
    },
    "abDatentraeger": 5.00,
    "transparentM2": 17.00,
    "plotpapier120M2": 2.50,
    "flaecheM2": {
      "_titel": "Fläche pro Format (m²) – für Materialzuschläge",
      "zeilenTitel": "",
      "spalten": ["A2", "A1", "A0"],
      "zeilen": [["m²", 0.25, 0.5, 1.0]]
    },
    "sw": {
      "_titel": "S/W – Preis pro Plot",
      "zeilenTitel": "bis Anzahl",
      "spalten": ["A2", "A1", "A0", "pro m²"],
      "zeilen": [
        [4, 4.50, 9.00, 18.00, 18.00],
        [7, 4.00, 8.00, 16.00, 16.00],
        [null, 3.50, 7.00, 14.00, 14.00]
      ]
    },
    "farbig": {
      "_titel": "Farbig – Preis pro Plot",
      "zeilenTitel": "bis Anzahl",
      "spalten": ["A2", "A1", "A0", "pro m²"],
      "zeilen": [
        [4, 9.00, 17.50, 35.00, 35.00],
        [7, 7.50, 15.00, 30.00, 30.00],
        [null, 6.50, 12.00, 25.00, 25.00]
      ]
    },
    "falten": {
      "_titel": "Falten pro Plot",
      "zeilenTitel": "",
      "spalten": ["A2", "A1", "A0", "pro m²"],
      "zeilen": [["Preis", 0.80, 1.20, 2.00, 2.00]]
    }
  },

  "grafikplot": {
    "_titel": "Grafikplot Farbplotter (4-farbig ab Datei, 140 g/m² Satin inkl.)",
    "_labels": {
      "schwarzRabatt": "Nur Schwarzdruck: Rabatt %",
      "scanA4": "Vorlage bis A4 scannen",
      "scanA3": "Vorlage bis A3 scannen",
      "stunde": "Farbkorrekturen/Änderungen/Montagen pro Stunde"
    },
    "schwarzRabatt": 20,
    "scanA4": 25.00,
    "scanA3": 35.00,
    "stunde": 120.00,
    "formate": {
      "_titel": "Formate (Fläche in m² für Materialzuschlag)",
      "zeilenTitel": "Format",
      "spalten": ["Fläche m²"],
      "zeilen": [
        ["A3/A2 (30×42 / 42×60 cm)", 0.252],
        ["A1 (60×84 cm)", 0.504],
        ["70×100 cm", 0.70],
        ["A0 (84×119 cm)", 1.00],
        ["F4/BA Weltformat (89.5×128 cm)", 1.146],
        ["F12 (128×268 cm)", 3.430]
      ]
    },
    "staffel": {
      "_titel": "Preis pro Plot (Spalten = Formate oben, gleiche Reihenfolge)",
      "zeilenTitel": "bis Anzahl",
      "spalten": ["A3/A2", "A1", "70×100", "A0", "F4/BA", "F12"],
      "zeilen": [
        [1, 16.00, 30.00, 42.00, 59.00, 67.00, 160.00],
        [4, 13.00, 24.00, 33.00, 47.00, 54.00, 130.00],
        [9, 11.00, 21.00, 29.00, 40.00, 46.00, 110.00],
        [null, 7.00, 15.00, 22.00, 30.00, 34.00, 80.00]
      ]
    },
    "material": {
      "_titel": "Materialzuschläge (pro m²)",
      "zeilenTitel": "Material",
      "spalten": ["pro m²"],
      "zeilen": [
        ["Papier 140 g/m² Satin weiss (inklusive)", 0.00],
        ["PET Film", 20.00],
        ["Fotopapier satin 180 g/m²", 18.00],
        ["Vinyl glanz", 20.00],
        ["Canvas Leinwand 500 g", 48.00],
        ["Backlit (Schaufenster mit Hinterlicht)", 40.00],
        ["Banner", 35.00]
      ]
    }
  },

  "scan": {
    "_titel": "Scan Klein- und Grossformat",
    "_labels": {
      "grundA4": "Grundpreis pro PDF (A4)",
      "grundA3": "Grundpreis pro PDF (A3)",
      "proSeite": "Scan pro Seite",
      "grossFarbigMin": "Grossformat farbig: mindestens",
      "grossFarbigM2": "Grossformat farbig: pro m²",
      "grossSwMin": "Grossformat S/W: mindestens",
      "grossSwM2": "Grossformat S/W: pro m²"
    },
    "grundA4": 2.00,
    "grundA3": 3.00,
    "proSeite": 0.50,
    "grossFarbigMin": 15.00,
    "grossFarbigM2": 30.00,
    "grossSwMin": 10.00,
    "grossSwM2": 20.00
  },

  /* ------------------------------------------------------ Weiterverarbeitung */
  "bindung": {
    "_titel": "Bindungen (Preise 1–20 Stück, inkl. Rücken & Deckel glasklar)",
    "_labels": {
      "a3Zuschlag": "A3 binden: Zuschlag pro Stück",
      "kalenderZuschlag": "Kalenderbindung Wire-O: Zuschlag %",
      "klemmschieneNormal": "Klemmschiene normal",
      "klemmschieneOrdner": "Klemmschiene Ordner"
    },
    "a3Zuschlag": 2.00,
    "kalenderZuschlag": 50,
    "klemmschieneNormal": 0.50,
    "klemmschieneOrdner": 1.00,
    "gbc": {
      "_titel": "Plastik-Spiralbindung GBC",
      "zeilenTitel": "Durchmesser",
      "spalten": ["max. Blatt", "Preis"],
      "zeilen": [
        ["6 mm", 30, 8.00], ["8 mm", 50, 8.20], ["10 mm", 90, 9.20],
        ["12 mm", 110, 9.50], ["14 mm", 130, 9.70], ["16 mm", 150, 9.90],
        ["19 mm", 160, 10.40], ["20 mm", 170, 11.10], ["22 mm", 200, 12.00],
        ["25 mm", 225, 12.70], ["28 mm", 250, 13.80], ["32 mm", 300, 14.40],
        ["45 mm", 440, 16.00], ["51 mm", 500, 18.20]
      ]
    },
    "wireo": {
      "_titel": "Wire-O Drahtbindung (schwarz oder weiss)",
      "zeilenTitel": "Nummer",
      "spalten": ["max. Blatt", "Preis"],
      "zeilen": [
        ["6.9 mm", 45, 8.80], ["8.0 mm", 60, 9.20], ["9.5 mm", 70, 9.70],
        ["11.0 mm", 85, 10.00], ["12.7 mm", 100, 11.00], ["14.3 mm", 120, 12.00],
        ["16.0 mm", 135, 13.10], ["19.0 mm", 150, 13.50], ["22.0 mm", 165, 14.70],
        ["25.4 mm", 180, 15.20], ["27.5 mm", 200, 16.30], ["32.0 mm", 250, 16.80],
        ["38.0 mm", 300, 17.90]
      ]
    },
    "fastback": {
      "_titel": "Fastback Heissleimbindung (Deckel glasklar, Rücken Chromolux)",
      "zeilenTitel": "Grösse",
      "spalten": ["max. Blatt", "Preis"],
      "zeilen": [
        ["Klein (3–125 Blatt)", 125, 7.00],
        ["Mittel (126–250 Blatt)", 250, 8.50],
        ["Gross (251–350 Blatt, max. 3.7 cm)", 350, 10.00]
      ]
    },
    "mengenrabatt": {
      "_titel": "Mengenrabatt GBC / Wire-O / Fastback",
      "zeilenTitel": "ab Stück",
      "spalten": ["Rabatt %"],
      "zeilen": [[21, 10], [51, 15]]
    }
  },

  "rillen": {
    "_titel": "Rillen / Perforieren",
    "_labels": {
      "maschineEinrichten1": "Maschine: Einrichten 1×",
      "maschineEinrichten2": "Maschine: Einrichten 2×",
      "maschinePro100_1": "Maschine: pro 100 Stück 1×",
      "maschinePro100_2": "Maschine: pro 100 Stück 2×",
      "handEinrichten1": "Von Hand (bis A4): Einrichten 1×",
      "handEinrichten2": "Von Hand (bis A4): Einrichten 2×",
      "handProBogen1": "Von Hand: pro Bogen 1×",
      "handProBogen2": "Von Hand: pro Bogen 2×",
      "handMinimum": "Von Hand: Mindestverrechnung pro Auftrag",
      "manuellGrund": "Manuell rillen: Grundpreis",
      "manuellProStueck": "Manuell rillen: pro Stück"
    },
    "maschineEinrichten1": 40.00,
    "maschineEinrichten2": 60.00,
    "maschinePro100_1": 2.50,
    "maschinePro100_2": 3.00,
    "handEinrichten1": 10.00,
    "handEinrichten2": 20.00,
    "handProBogen1": 0.30,
    "handProBogen2": 0.40,
    "handMinimum": 10.00,
    "manuellGrund": 5.00,
    "manuellProStueck": 0.30
  },

  "leimen": {
    "_titel": "Blockleimung (leimen und trennen, A5-Block)",
    "_labels": {
      "grundpreis": "Grundpreis",
      "zuschlagA4": "Zuschlag A4-Block %",
      "graukarton": "Graukarton pro Block"
    },
    "grundpreis": 5.00,
    "zuschlagA4": 20,
    "graukarton": 1.00,
    "staffel": {
      "_titel": "Preis pro Block",
      "zeilenTitel": "bis Blöcke",
      "spalten": ["bis 50 Blatt", "51–100 Blatt"],
      "zeilen": [[20, 2.80, 3.30], [50, 2.50, 3.10], [null, 2.40, 2.90]]
    }
  },

  "schneiden": {
    "_titel": "Schneiden / Blockschnitt",
    "_labels": { "grundpreis": "Schneiden: Grundpreis", "blockschnitt": "Blockschnitt pro Schnitt" },
    "grundpreis": 5.00,
    "blockschnitt": 2.00,
    "proTausend": {
      "_titel": "Schneiden pro 1000 Blatt",
      "zeilenTitel": "",
      "spalten": ["A6", "A5", "A4", "A3"],
      "zeilen": [["pro 1000", 10.00, 9.00, 8.50, 8.00]]
    }
  },

  "falzen": {
    "_titel": "Falzen (Offsetpapier 80/100 g/m², A4, inkl. Bandieren & Verpacken)",
    "_labels": { "formatstufe": "Zuschlag pro Formatstufe ≠ A4 (%)", "handStunde": "Falzen von Hand pro Stunde" },
    "formatstufe": 20,
    "handStunde": 60.00,
    "preise": {
      "_titel": "Gesamtpreis",
      "zeilenTitel": "Auflage",
      "spalten": ["Parallelbruch 1×", "Parallelbruch 2×", "Kreuzbruch / Parallel 3×"],
      "zeilen": [
        [100, 30, 34, 45], [200, 34, 38, 50], [300, 36, 40, 55], [400, 40, 44, 60],
        [500, 44, 49, 65], [600, 48, 54, 70], [700, 52, 59, 75], [800, 56, 65, 80],
        [900, 60, 69, 85], [1000, 64, 72, 88], [1500, 72, 81, 99], [2000, 80, 90, 110],
        [3000, 96, 108, 132], [4000, 112, 126, 154], [5000, 128, 144, 176],
        [6000, 144, 162, 198], [7000, 160, 180, 220], [8000, 176, 198, 242],
        [9000, 192, 216, 264], [10000, 208, 238, 286]
      ]
    },
    "zuschlaege": {
      "_titel": "Zuschläge",
      "zeilenTitel": "Zuschlag",
      "spalten": ["%"],
      "zeilen": [
        ["Papier unter 60 g/m²", 20],
        ["Papier über 120 g/m²", 20],
        ["Gestrichene Papiere", 10],
        ["Gerillt oder perforiert", 20]
      ]
    }
  },

  "zusammentragen": {
    "_titel": "Zusammentragen (Papier normal 80–120 g/m², A4)",
    "preise": {
      "_titel": "Gesamtpreis nach Anzahl Blatt",
      "zeilenTitel": "Blatt",
      "spalten": ["Preis"],
      "zeilen": [
        [1000, 40], [1500, 55], [2000, 70], [2500, 85], [3000, 100], [3500, 115],
        [4000, 130], [4500, 145], [5000, 160], [6000, 190], [7000, 220], [8000, 250],
        [9000, 280], [10000, 305], [11000, 330], [12000, 355], [13000, 380],
        [14000, 405], [15000, 430], [16000, 455], [17000, 480], [18000, 505],
        [19000, 530], [20000, 555]
      ]
    },
    "zuschlaege": {
      "_titel": "Papierzuschläge",
      "zeilenTitel": "Papier",
      "spalten": ["%"],
      "zeilen": [
        ["Papier normal 80–120 g/m²", 0],
        ["Vervielfältigungspapier", 10],
        ["Halbkarton", 15],
        ["Kunstdruckpapier", 20],
        ["Karton über 220 g/m²", 80]
      ]
    }
  },

  "lochen": {
    "_titel": "Lochen (2er/4er Norm-Lochung, Papier 80 g/m²)",
    "_labels": { "zuschlag120": "Zuschlag Papier 120 g/m² (%)" },
    "zuschlag120": 20,
    "preise": {
      "_titel": "Gesamtpreis nach Blatt (letzte Zeile: pro weitere 1000 Blatt)",
      "zeilenTitel": "Blatt",
      "spalten": ["2er", "4er"],
      "zeilen": [
        [500, 15, 25], [1000, 20, 33], [2000, 28, 41], [3000, 32, 49],
        [4000, 36, 57], [5000, 40, 65], [null, 3.50, 7.00]
      ]
    }
  },

  "heften": {
    "_titel": "Einfache Klammerheftung (1–14 Blatt)",
    "preise": {
      "_titel": "Gesamtpreis",
      "zeilenTitel": "Auflage",
      "spalten": ["Preis"],
      "zeilen": [[100, 20], [200, 28], [300, 36], [400, 44], [500, 52], [1000, 92], [2000, 172]]
    }
  },

  "laminieren": {
    "_titel": "Laminieren (Heisslaminieren beidseitig glasklar)",
    "_labels": { "zuschlagSelbstklebend": "Grossformat einseitig selbstklebend: Zuschlag %" },
    "zuschlagSelbstklebend": 60,
    "standard": {
      "_titel": "Matt / Glanz, 125 oder 80 Micron – pro Stück",
      "zeilenTitel": "bis Stück",
      "spalten": ["A3", "A4", "A5", "Kreditkarte"],
      "zeilen": [
        [1, 5.50, 4.70, 2.70, 2.10], [5, 5.20, 4.60, 2.50, 1.90],
        [10, 5.00, 4.30, 2.30, 1.70], [49, 4.80, 4.10, 2.10, 1.50],
        [null, 3.50, 2.80, 1.20, 0.80]
      ]
    },
    "selbstklebend": {
      "_titel": "Selbstklebend glänzend 125 Micron – pro Stück",
      "zeilenTitel": "bis Stück",
      "spalten": ["A3", "A4", "A5"],
      "zeilen": [[1, 7.50, 5.00, 3.40], [5, 7.20, 4.80, 3.20], [10, 6.90, 4.60, 3.00], [null, 6.60, 4.40, 2.80]]
    },
    "gross": {
      "_titel": "Grossformate 75 Micron Glanz oder matt – pro Stück",
      "zeilenTitel": "bis Stück",
      "spalten": ["A2", "A1", "A0"],
      "zeilen": [[1, 22, 33, 56], [5, 18, 28, 50], [10, 16, 25, 46], [20, 14, 23, 44], [null, 13, 21, 41]]
    }
  },

  "aufziehen": {
    "_titel": "Aufziehen auf Sandwichplatte 5 mm",
    "_labels": { "steller": "Steller (klein)", "anhaenger": "Anhänger" },
    "steller": 5.00,
    "anhaenger": 2.00,
    "formate": {
      "_titel": "Preis pro Platte",
      "zeilenTitel": "",
      "spalten": ["A4", "A3", "A2", "A1", "70×100 cm"],
      "zeilen": [["Preis", 8.00, 16.00, 32.00, 49.00, 77.00]]
    },
    "rabatt": {
      "_titel": "Mengenrabatt",
      "zeilenTitel": "ab Stück",
      "spalten": ["Rabatt %"],
      "zeilen": [[10, 5], [20, 10]]
    }
  },

  /* ---------------------------------------------------------------- Papier */
  "kopierpapier": {
    "_titel": "Kopierpapier 80 g/m² weiss SK3, A4 (A3 = doppelter Preis)",
    "_labels": {
      "paket500": "Paket 500 Blatt",
      "proTausend": "ab 1000 Blatt: pro 1000",
      "proTausend5000": "ab 5000 Blatt: pro 1000",
      "proTausend10000": "ab 10000 Blatt: pro 1000",
      "recyclingZuschlag": "Zuschlag Recycling/Biotop pro 1000"
    },
    "paket500": 11.00,
    "proTausend": 19.00,
    "proTausend5000": 18.50,
    "proTausend10000": 17.80,
    "recyclingZuschlag": 10.00
  },

  "papierFarbig": {
    "_titel": "Farbige Papiere holzfrei (Verkauf)",
    "staffel": {
      "_titel": "Pro 1000 Blatt (ab Paketmenge) + Kleinmengen in Rappen pro Blatt (bis 10/50/100/500 Bl.)",
      "zeilenTitel": "Sorte",
      "spalten": ["Paket Bl.", "Paketpreis", "pro 1000 (ab 1000)", "pro 1000 (ab 2000)", "pro 1000 (ab 5000)", "Rp. 1–10", "Rp. –50", "Rp. –100", "Rp. –500"],
      "zeilen": [
        ["A4 80 g/m² alle Farben", 500, 21.50, 43.00, 41.50, 39.00, 17, 12, 9, 7],
        ["A3 80 g/m² alle Farben", 500, 43.00, 86.00, 83.00, 78.00, 34, 24, 18, 14],
        ["A4 120 g/m² alle Farben", 250, 18.75, 75.00, 70.00, 66.00, 24, 18, 16, 15],
        ["A3 120 g/m² alle Farben", 250, 37.50, 150.00, 140.00, 134.00, 40, 36, 32, 30],
        ["A4 160 g/m² alle Farben", 250, 41.25, 165.00, 160.00, 152.00, 33, 30, 27, 25]
      ]
    }
  },

  "papierWeiss": {
    "_titel": "Weisse Papiere Laser/Kopierer A4 (Verkauf, A3 = doppelter Preis)",
    "staffel": {
      "_titel": "Pro 1000 Blatt + Paketpreis (unter 1000 Blatt: ganze Pakete)",
      "zeilenTitel": "Sorte",
      "spalten": ["Paket Bl.", "Paketpreis", "pro 1000 (ab 1000)", "pro 1000 (ab 2000)", "pro 1000 (ab 5000)"],
      "zeilen": [
        ["100 g/m² matt", 500, 20.00, 40.00, 37.00, 34.00],
        ["120 g/m² matt", 250, 11.75, 47.00, 45.00, 42.00],
        ["160 g/m² matt", 250, 20.00, 80.00, 77.00, 73.00],
        ["300 g/m² matt", 120, 20.40, 170.00, 162.00, 150.00],
        ["90 g/m² satiniert", 500, 17.00, 46.00, 42.00, 38.00],
        ["100 g/m² satiniert", 500, 24.50, 49.00, 45.00, 41.00],
        ["120 g/m² satiniert", 250, 17.25, 69.00, 66.00, 62.00],
        ["160 g/m² satiniert", 250, 23.00, 92.00, 89.00, 85.00],
        ["200 g/m² satiniert", 250, 26.25, 105.00, 101.00, 96.00],
        ["250 g/m² satiniert", 125, 17.50, 140.00, 132.00, 118.00],
        ["300 g/m² satiniert", 125, 22.00, 190.00, 183.00, 170.00]
      ]
    }
  },

  "material": {
    "_titel": "Material & Zubehör (Stückpreise)",
    "artikel": {
      "_titel": "Artikel",
      "zeilenTitel": "Artikel",
      "spalten": ["Preis", "Einheit"],
      "zeilen": [
        ["Kartonrolle 62 cm", 3.30, "Stk."],
        ["Kartonrolle 80 cm", 6.60, "Stk."],
        ["Kartonrolle 100 cm", 7.90, "Stk."],
        ["Graukarton A4", 1.00, "Stk."],
        ["Graukarton A3", 2.00, "Stk."],
        ["Graukarton A2", 4.00, "Stk."],
        ["Faltschachtel 4.5 cm tief", 2.50, "Stk."],
        ["Faltschachtel 8 cm tief", 2.80, "Stk."],
        ["Faltschachtel 10 cm tief", 3.20, "Stk."],
        ["Register", 1.90, "Stk."],
        ["Register XEROX 10er", 4.50, "Stk."],
        ["Register XEROX 5er", 4.10, "Stk."],
        ["Adressetiketten Einzelbogen (24/30 Etiketten)", 0.80, "Bogen"],
        ["Adressetiketten Schachtel à 100 Bogen", 49.00, "Schachtel"],
        ["Etikettenbogen A4 ungestanzt", 0.80, "Bogen"],
        ["Hellraumfolie S/W (zzgl. Kopie)", 0.80, "Stk."],
        ["Hellraumfolien Paket à 100", 64.00, "Paket"],
        ["Selbstklebefolie A4 matt oder klar", 3.50, "Folie"],
        ["Visitenkarten-Böxli", 2.50, "Stk."]
      ]
    }
  },

  "arbeit": {
    "_titel": "Arbeitszeit",
    "saetze": {
      "_titel": "Stundensätze",
      "zeilenTitel": "Tätigkeit",
      "spalten": ["pro Stunde"],
      "zeilen": [
        ["Allgemeine Arbeitszeit (Kopieren aus Büchern, Falzen von Hand …)", 60.00],
        ["Grafik: Farbkorrekturen, Änderungen, Montagen", 120.00],
        ["Datenaufbereitung (Fr. 2.– pro Minute)", 120.00]
      ]
    }
  }
};
