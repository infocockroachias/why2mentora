/**
 * MENTORA IAS — Doubt Engine (server-side, deterministic)
 *
 * A rule-based "AI" answer engine for UPSC/IAS doubts. No external AI calls:
 * it classifies the question by topic keywords, then renders an exam-oriented
 * explanation from original templates, echoing parts of the question so the
 * answer feels tailored. Same question + subject always yields the same answer.
 *
 * Output shape is consumed by POST /api/doubt and stored on the Doubt row:
 *   - summary : 1–2 sentence framing of what the question demands
 *   - points  : 4–6 structured explanation strings ("Lead: detail")
 *   - concept : one prerequisite to revise ("Revise: X")
 *
 * All prose is original educational writing — no copyrighted textbook text.
 */

export interface DoubtAnswer {
  summary: string;
  points: string[];
  concept: string;
}

export type DoubtTopic =
  | "polity"
  | "history"
  | "geography"
  | "economy"
  | "environment"
  | "ir"
  | "science"
  | "csat"
  | "current"
  | "fallback";

/* --------------------------------- helpers -------------------------------- */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasTerm(text: string, term: string): boolean {
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`, "i");
  return re.test(text);
}

/** Strip question stems and return the core phrase to echo back. */
function corePhrase(question: string): string {
  let t = question.replace(/\s+/g, " ").trim().replace(/[?.!]+$/, "");
  t = t.replace(/^(please|kindly)\s+/i, "");
  t = t.replace(
    /^(can you|could you|will you|i want to know( about)?|i want|tell me)\s+/i,
    ""
  );
  t = t.replace(
    /^(what|why|how|when|where|which|who|whom|explain|discuss|describe|elaborate|examine|evaluate|analyse|analyze|clarify|comment on|write a short note on|short note on|throw light on)\s+/i,
    ""
  );
  t = t.replace(/^(is|are|was|were|do|does|did|the|a|an)\s+/i, "");
  if (!t) t = "this concept";
  if (t.length > 90) t = `${t.slice(0, 90).replace(/\s+\S*$/, "")}…`;
  return t;
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/* ------------------------------ classification ----------------------------- */

type StaticTopic = Exclude<DoubtTopic, "fallback">;

const TOPIC_TERMS: Array<{ topic: StaticTopic; terms: string[] }> = [
  {
    topic: "polity",
    terms: [
      "constitution", "constitutional", "fundamental right", "fundamental rights",
      "fundamental duty", "directive principle", "dpsp", "preamble", "article 14",
      "article 19", "article 21", "article 32", "article 226", "article 352",
      "article 356", "article 360", "article 368", "article 110", "article 123",
      "writ", "habeas corpus", "mandamus", "certiorari", "quo warranto",
      "parliament", "lok sabha", "rajya sabha", "president", "governor",
      "prime minister", "council of ministers", "supreme court", "high court",
      "judiciary", "judicial review", "judicial activism", "basic structure",
      "kesavananda", "amendment", "federalism", "cooperative federalism",
      "union list", "state list", "concurrent list", "seventh schedule",
      "emergency", "ordinance", "money bill", "finance bill", "appropriation",
      "attorney general", "advocate general", "election commission", "cag",
      "comptroller and auditor", "anti defection", "anti-defection",
      "tenth schedule", "panchayat", "municipality", "73rd", "74th",
      "citizenship", "caa", "nrc", "uniform civil code", "ucc",
      "impeachment", "no confidence", "no-confidence", "censure motion",
      "speaker", "vice president", "collector", "pil", "public interest litigation",
    ],
  },
  {
    topic: "history",
    terms: [
      "1857", "revolt", "sepoy mutiny", "mangal pandey", "jhansi", "awadh",
      "east india company", "company rule", "plassey", "buxar",
      "subsidiary alliance", "doctrine of lapse", "annexation",
      "permanent settlement", "ryotwari", "mahalwari", "zamindari",
      "indigo revolt", "santhal", "munda rebellion", "birsa", "moderate",
      "extremist", "surat split", "lucknow pact", "home rule league",
      "morley minto", "morley-minto", "montagu", "government of india act",
      "rowlatt", "jallianwala", "khilafat", "non cooperation",
      "non-cooperation", "chauri chaura", "swaraj party", "simon commission",
      "nehru report", "lahore session", "purna swaraj", "civil disobedience",
      "dandi", "salt satyagraha", "gandhi irwin", "gandhi-irwin",
      "round table conference", "communal award", "poona pact", "cripps mission",
      "quit india", "august offer", "individual satyagraha", "cabinet mission",
      "direct action day", "mountbatten plan", "indian independence act",
      "partition", "princely states", "swadeshi", "boycott",
      "partition of bengal", "ghadar", "komagata maru", "kakori", "hsra",
      "bhagat singh", "chandrashekhar azad", "surya sen", "chittagong",
      "subhas bose", "ina", "azad hind", "gandhi", "nehru", "tilak", "gokhale",
      "jinnah", "ambedkar", "patel", "vijayanagara", "chola", "pallava",
      "pandya", "mauryan", "ashoka", "gupta", "harshavardhana", "harappa",
      "mohenjo", "indus valley", "vedic", "buddhism", "jainism", "buddha",
      "mahavira", "mughal", "akbar", "aurangzeb", "shivaji", "maratha",
      "sultanate", "bhakti", "sufi", "alauddin", "sangam", "rock edict",
      "dhamma", "brahmo", "arya samaj", "ramakrishna", "vivekananda",
      "dayanand", "rammohan", "theosophical", "aligarh", "deoband",
      "prarthana samaj", "renaissance", "socio religious reform",
      "socio-religious reform",
    ],
  },
  {
    topic: "geography",
    terms: [
      "monsoon", "jet stream", "el nino", "el niño", "la nina", "la niña",
      "enso", "indian ocean dipole", "cyclone", "typhoon", "hurricane",
      "coriolis", "pressure belt", "trade wind", "westerlies", "ocean current",
      "gulf stream", "kuroshio", "salinity", "tide", "continental drift",
      "plate tectonic", "seismic", "earthquake", "epicentre", "epicenter",
      "volcano", "volcanic", "magma", "fold mountain", "block mountain",
      "himalaya", "karakoram", "purvanchal", "western ghats", "sahyadri",
      "eastern ghats", "aravalli", "deccan trap", "plateau", "peninsular",
      "indo gangetic", "indo-gangetic", "delta", "estuary", "tributary",
      "distributary", "godavari", "krishna", "kaveri", "cauvery", "narmada",
      "tapi", "tapti", "mahanadi", "brahmaputra", "ganga", "indus", "sutlej",
      "yamuna", "soil", "alluvium", "alluvial", "black soil", "regur",
      "laterite", "red soil", "desertification", "erosion", "latitude",
      "longitude", "prime meridian", "international date line", "time zone",
      "indian standard time", "tropic of cancer", "equator", "glacier",
      "snowline", "moraine", "cirque", "lagoon", "backwater", "coral", "atoll",
      "mangrove", "koppen", "temperature inversion", "insolation", "albedo",
      "convection", "orographic", "rain shadow", "anticyclone", "geomorphology",
      "climatology", "oceanography", "monsoon trough", "depression",
    ],
  },
  {
    topic: "economy",
    terms: [
      "inflation", "cpi", "wpi", "deflation", "disinflation", "stagflation",
      "core inflation", "repo", "reverse repo", "bank rate", "monetary policy",
      "fiscal policy", "rbi", "reserve bank", "mpc", "monetary policy committee",
      "inflation targeting", "interest rate", "liquidity", "budget",
      "union budget", "fiscal deficit", "revenue deficit", "primary deficit",
      "frbm", "gst", "goods and services tax", "igst", "cgst", "sgst",
      "taxation", "direct tax", "indirect tax", "corporate tax", "laffer",
      "cess", "surcharge", "gdp", "gnp", "national income", "per capita income",
      "base year", "recession", "growth rate", "money supply", "broad money",
      "credit creation", "cash reserve ratio", "crr", "slr",
      "open market operation", "npa", "priority sector", "payment bank",
      "small finance bank", "nbfc", "basel", "msp", "minimum support price",
      "subsidy", "fertiliser subsidy", "food subsidy", "disinvestment",
      "strategic sale", "privatisation", "public sector", "balance of payment",
      "bop", "exchange rate", "depreciation", "rupee", "convertibility", "fdi",
      "fii", "fpi", "current account deficit", "capital account", "remittance",
      "imf", "world bank", "insurance", "irdai", "sebi", "stock market",
      "mutual fund", "bond", "gilt", "treasury bill", "treasury bills",
      "crowding out", "demand pull", "cost push", "philips curve",
      "purchasing power parity", "hdi", "demographic dividend", "poverty line",
      "multidimensional poverty", "unemployment", "lfpr", "labour force",
      "plfs", "informal sector", "gig economy", "aggregate demand", "multiplier",
      "economic survey", "finance commission",
    ],
  },
  {
    topic: "environment",
    terms: [
      "climate change", "global warming", "greenhouse gas", "ghg",
      "carbon emission", "carbon credit", "carbon footprint", "carbon trading",
      "net zero", "net-zero", "paris agreement", "unfccc", "kyoto", "cop27",
      "cop28", "cop29", "loss and damage", "ipcc", "nationally determined",
      "ndc", "biodiversity", "biodiversity hotspot", "species", "endangered",
      "vulnerable species", "critically endangered", "iucn", "red list",
      "cites", "convention on migratory", "cbd", "cartagena", "nagoya",
      "tiger reserve", "project tiger", "ntca", "national park",
      "wildlife sanctuary", "conservation reserve", "community reserve",
      "biosphere reserve", "ramsar", "wetland", "mangrove", "coral reef",
      "eia", "environment impact assessment", "environmental impact",
      "pollution", "air quality", "aqi", "smog", "particulate", "pm2.5",
      "pm10", "water pollution", "plastic", "single use plastic",
      "solid waste", "e waste", "e-waste", "biomedical waste", "groundwater",
      "water stress", "unccd", "napcc", "green tribunal", "ngt",
      "environment protection act", "wildlife protection act",
      "forest conservation act", "forest rights act", "campa",
      "compensatory afforestation", "joint forest management", "isfr",
      "forest cover", "tree cover", "renewable energy", "solar park",
      "wind energy", "biomass", "green hydrogen", "circular economy",
      "sustainability", "sdg", "agenda 21", "ecosystem services",
      "invasive species", "keystone species", "flagship species",
      "umbrella species", "environment",
    ],
  },
  {
    topic: "ir",
    terms: [
      "foreign policy", "international relations", "bilateral", "multilateral",
      "strategic autonomy", "quad", "quadrilateral", "brics", "g20", "g7",
      "g77", "saarc", "bimstec", "asean", "east asia summit",
      "shanghai cooperation", "sco", "ibsa", "chabahar", "instc",
      "international north south", "united nations", "unsc",
      "general assembly", "veto", "peacekeeping", "treaty", "summit",
      "state visit", "line of actual control", "lac", "line of control",
      "loc", "mcmahon", "durand", "radcliffe", "india china", "china border",
      "india pakistan", "india nepal", "india bangladesh", "india sri lanka",
      "india maldives", "india myanmar", "india afghanistan", "india us",
      "india russia", "india japan", "india australia", "indo pacific",
      "indo-pacific", "look east", "act east", "neighbourhood first",
      "belt and road", "bri", "string of pearls", "doklam", "galwan",
      "silk route", "wto", "dispute settlement", "trade facilitation",
      "sanction", "embargo", "nato", "npt", "ctbt", "mctr", "wassenaar",
      "diaspora", "pravasi", "soft power", "cultural diplomacy",
      "vaccine maitri", "hormuz", "malacca", "suez", "red sea",
      "south china sea", "nine dash", "west asia", "gcc", "abraham accord",
      "two state", "russia ukraine", "black sea", "global south",
      "humanitarian assistance", "diplomacy",
    ],
  },
  {
    topic: "science",
    terms: [
      "quantum", "semiconductor", "chip", "photonic", "artificial intelligence",
      "machine learning", "deep learning", "neural network", "generative ai",
      "blockchain", "distributed ledger", "cryptocurrency", "cbdc",
      "digital rupee", "nanotechnology", "biotechnology", "crispr",
      "gene editing", "genome", "genomics", "gm crop", "bt cotton", "mrna",
      "vaccine", "immunisation", "antibiotic resistance", "microbiome",
      "stem cell", "cloning", "recombinant", "isro", "nasa", "satellite",
      "payload", "gaganyaan", "chandrayaan", "aditya", "mangalyaan", "pslv",
      "gslv", "lvm3", "sslv", "reusable launch", "scramjet", "cryogenic",
      "navic", "gps", "gnss", "remote sensing", "space station", "mission shakti",
      "antisat", "nuclear", "fission", "fusion", "tokamak", "iter", "phwr",
      "npcil", "thorium", "three stage", "radioactive", "isotope",
      "fuel cell", "electric vehicle", "lithium", "sodium ion",
      "superconductor", "graphene", "quantum dot", "5g", "6g", "bharatnet",
      "optical fibre", "encryption", "cybersecurity", "cyber security",
      "quantum key", "post quantum", "laser", "lidar", "drone", "uav",
      "robotics", "3d printing", "additive manufacturing", "higgs", "boson",
      "neutrino", "gravitational wave", "ligo", "dark matter", "exoplanet",
      "telescope", "mri", "telemedicine", "genome india", "national quantum mission",
    ],
  },
  {
    topic: "csat",
    terms: [
      "ratio", "proportion", "percentage", "profit and loss", "simple interest",
      "compound interest", "average", "speed distance", "time and work",
      "pipes and cistern", "probability", "permutation", "combination",
      "number series", "sequence and series", "seating arrangement",
      "syllogism", "blood relation", "direction sense", "clock", "calendar",
      "data interpretation", "data sufficiency", "bar graph", "pie chart",
      "line graph", "venn diagram", "logical reasoning",
      "statement and assumption", "statement and conclusion", "coding decoding",
      "odd one out", "puzzle", "number system", "lcm", "hcf", "remainder",
      "unit digit", "ages problem", "boat and stream", "train", "mixture",
      "alligation", "geometry", "mensuration", "trigonometry",
      "height and distance", "mean median", "standard deviation",
      "counting figures", "order and ranking", "input output", "decision making",
      "comprehension", "reading comprehension", "csat", "paper 2", "paper ii",
    ],
  },
  {
    topic: "current",
    terms: [
      "in news", "in the news", "current affairs", "recently", "latest",
      "this year", "last year", "2023", "2024", "2025", "2026",
      "recent development", "new scheme", "newly launched",
      "government launched", "recently announced", "recently approved",
      "cabinet approved", "union cabinet", "budget 2025", "budget 2026",
      "economic survey 2025", "economic survey 2026", "this month",
      "last month",
    ],
  },
];

const SUBJECT_HINTS: Array<[RegExp, StaticTopic]> = [
  [/polity|constitution|governance|law|ethic/i, "polity"],
  [/history|culture/i, "history"],
  [/geograph/i, "geography"],
  [/econom/i, "economy"],
  [/environment|ecolog/i, "environment"],
  [/international|relation|world|diploma/i, "ir"],
  [/science|tech/i, "science"],
  [/csat|quant|aptitude|reasoning|math/i, "csat"],
  [/current/i, "current"],
];

function classifyDoubt(question: string, subject: string): DoubtTopic {
  const q = question.toLowerCase();
  const scores = new Map<StaticTopic, number>();

  for (const { topic, terms } of TOPIC_TERMS) {
    let score = 0;
    for (const term of terms) {
      if (hasTerm(q, term)) score += term.includes(" ") ? 2 : 1;
    }
    if (score > 0) scores.set(topic, score);
  }

  const order: StaticTopic[] = [
    "polity", "history", "geography", "economy", "environment",
    "ir", "science", "csat", "current",
  ];
  let best: StaticTopic | null = null;
  let bestScore = 0;
  for (const topic of order) {
    const s = scores.get(topic) ?? 0;
    if (s > bestScore) {
      best = topic;
      bestScore = s;
    }
  }
  if (best) return best;

  const subjectLower = (subject ?? "").toLowerCase();
  for (const [re, topic] of SUBJECT_HINTS) {
    if (re.test(subjectLower)) return topic;
  }
  return "fallback";
}

/* ---------------------------- topic sub-references ------------------------- */

function polityArticleRef(q: string): string {
  if (/\bamendment\b/i.test(q) || /basic structure/i.test(q)) {
    return "Article 368 vests amendment power in Parliament, but the basic structure doctrine (Kesavananda Bharati, 1973) bars destroying the Constitution's identity.";
  }
  if (/fundamental right|article 21|liberty|privacy|personal freedom/i.test(q)) {
    return "Articles 14, 19 and 21 form the Golden Triangle; Article 21's scope expanded from Gopalan (1950) to Maneka Gandhi (1978) to Puttaswamy (2017).";
  }
  if (/writ|remedy|enforce/i.test(q)) {
    return "Article 32 (Supreme Court) and Article 226 (High Courts) are the enforcement routes; Ambedkar called Article 32 the heart and soul of the Constitution.";
  }
  if (/money bill|budget|appropriation|finance/i.test(q)) {
    return "Article 110 defines a Money Bill (the Speaker's certificate is final) and Article 112 places the annual financial statement before Parliament.";
  }
  if (/emergency|356|president's rule|presidents rule/i.test(q)) {
    return "Articles 352, 356 and 360 cover national, State and financial emergencies; S.R. Bommai (1994) made Article 356 judicially reviewable.";
  }
  if (/ordinance|president/i.test(q)) {
    return "Article 123 empowers the President to promulgate ordinances when both Houses are not in session (Governors get the parallel power under Article 213); D.C. Wadhwa (1987) checked re-promulgation.";
  }
  if (/panchayat|municipal|local government|73rd|74th/i.test(q)) {
    return "The 73rd and 74th Amendments (1992) inserted Parts IX and IX-A, giving constitutional status to panchayats and municipalities (Articles 243 onwards).";
  }
  if (/governor/i.test(q)) {
    return "Articles 153–163 govern the Governor, including the Article 161 pardon power and the discretionary space that Nabam Rebia (2016) partly delimited.";
  }
  if (/defection|tenth schedule/i.test(q)) {
    return "The Tenth Schedule (52nd Amendment, 1985) regulates disqualification; Kihoto Hollohan (1992) preserved judicial review of the Speaker's final order.";
  }
  if (/dpsp|directive/i.test(q)) {
    return "Part IV (Articles 36–51) holds the Directive Principles — non-justiciable (Article 37) yet fundamental in governance, harmonised with rights in Minerva Mills (1980).";
  }
  return "Ground the answer in the specific Part and Articles invoked (Article 14's equality code, Article 21's life-and-liberty guarantee, Article 32's remedies), because UPSC rewards precise article mapping.";
}

function polityCaseRef(q: string): string {
  if (/privacy|liberty|life/i.test(q)) {
    return "Maneka Gandhi (1978) expanded Article 21 beyond Gopalan's narrow reading, and Puttaswamy (2017) recognised privacy as intrinsic to it.";
  }
  if (/amendment|basic structure/i.test(q)) {
    return "Kesavananda Bharati (1973) held that amendment power cannot destroy the Constitution's basic structure — reaffirmed in Minerva Mills (1980).";
  }
  if (/emergency|356/i.test(q)) {
    return "S.R. Bommai (1994) made President's Rule under Article 356 judicially reviewable and curbed its partisan misuse.";
  }
  if (/defection|tenth schedule/i.test(q)) {
    return "Kihoto Hollohan (1992) kept the Speaker's Tenth Schedule disqualification order subject to judicial review.";
  }
  if (/governor/i.test(q)) {
    return "Nabam Rebia (2016) held that a Governor cannot act against the aid and advice of the Council of Ministers on ordinary bills.";
  }
  if (/money bill/i.test(q)) {
    return "In the Aadhaar judgment (2018) and Rojer Mathew (2019), the Supreme Court scrutinised what may legitimately pass as a Money Bill under Article 110.";
  }
  return "Kesavananda Bharati (1973) → Minerva Mills (1980) → Puttaswamy (2017) is a safe citation chain whenever rights and constitutional structure are in play.";
}

function historyActorRef(q: string): string {
  if (/gandhi|satyagraha|champaran|kheda|ahmedabad|dandi|salt/i.test(q)) {
    return "Gandhi standardised satyagraha through Champaran (1917), Ahmedabad (1918) and Kheda (1918) before nationalising it at Dandi (1930)";
  }
  if (/1857|sepoy|mutiny|revolt/i.test(q)) {
    return "the 1857 outbreak at Barrackpore and Meerut with Bahadur Shah II as the symbolic figurehead, and Awadh/Jhansi as its storm centres";
  }
  if (/brahmo|arya samaj|reform|renaissance|rammohan|dayanand|vivekananda/i.test(q)) {
    return "Rammohan Roy's Brahmo Sabha (1828) and Dayanand Saraswati's Arya Samaj (1875) as the twin reform engines";
  }
  if (/bhagat singh|hsra|kakori|revolutionary|chittagong/i.test(q)) {
    return "the HSRA after the Kakori action (1925), and Bhagat Singh's turn to conscious martyrdom (1929–31)";
  }
  if (/subhas|ina|azad hind/i.test(q)) {
    return "Subhas Bose's Azad Hind Fauj (1943 revival) and the RIN mutiny (1946) that hastened the endgame";
  }
  return "the Moderates (1885–1905) versus Extremists (1905–1919) divide, then the Gandhian mass phase (1919–42)";
}

function mapRef(q: string): string {
  if (/cyclone|storm|monsoon depression/i.test(q)) {
    return "Kanyakumari up the Odisha–West Bengal storm belt on the east coast";
  }
  if (/western ghats|orographic|rain shadow/i.test(q)) {
    return "Mahabaleshwar's windward slopes against the rain shadow at Pune";
  }
  if (/himalaya|glacier|mountain/i.test(q)) {
    return "the Shiwalik–Himachal–Himadri sequence and the Duns between them";
  }
  if (/soil|black cotton|regur/i.test(q)) {
    return "the black regur belt of the Deccan versus the alluvium of the Ganga plain";
  }
  if (/river|delta|tributary/i.test(q)) {
    return "the Godavari–Krishna–Kaveri eastward drainage versus Narmada–Tapi westward rift-valley flow";
  }
  return "the Tropic of Cancer's sweep across eight States, marking arid west to humid east";
}

function economyRef(q: string): string {
  if (/inflation|cpi|price rise/i.test(q)) {
    return "the flexible inflation-targeting framework (2016): 4% CPI-C with a ±2% band";
  }
  if (/repo|monetary|mpc|liquidity/i.test(q)) {
    return "the MPC's six-member vote under the RBI Act's Chapter III-F and the repo corridor that anchors overnight rates";
  }
  if (/budget|fiscal|deficit/i.test(q)) {
    return "the FRBM Act, 2003 consolidation path and how fiscal deficit is financed (market borrowing dominates)";
  }
  if (/gst|tax/i.test(q)) {
    return "Article 279A's GST Council and the destination-based, dual GST design";
  }
  if (/msp|subsidy|procurement/i.test(q)) {
    return "CACP's price recommendation logic and the Swaminathan Commission's C2+50% framing";
  }
  if (/gdp|national income|growth/i.test(q)) {
    return "how GDP is measured at constant prices (base year 2011-12) and the rebasing debate";
  }
  return "the exact official definition of the term before any argument — examiners score definitions first";
}

function irRef(q: string): string {
  if (/quad|quadrilateral/i.test(q)) {
    return "the Quad's 2017 revival and 2021 leaders'-summit institutionalisation";
  }
  if (/brics/i.test(q)) {
    return "BRICS's 2009 summit origins and the 2024 enlargement round";
  }
  if (/unsc|security council/i.test(q)) {
    return "India's eight UNSC stints and the G4 cohort's reform push";
  }
  if (/sco|shanghai/i.test(q)) {
    return "the SCO's 2001 charter and the 2017 round that admitted India and Pakistan";
  }
  if (/belt and road|bri|silk/i.test(q)) {
    return "the Belt and Road's 2013 launch and India's sovereignty-based objection since 2017";
  }
  return "the grouping's founding year, membership roster and India's entry date";
}

function csatSolvePath(q: string): string {
  if (/work|pipe|cistern/i.test(q)) {
    return "convert every worker or pipe into its per-day (or per-hour) rate, then add rates — never add times.";
  }
  if (/speed|train|boat|stream/i.test(q)) {
    return "fix units first (km/h vs m/s), apply distance = rate × time leg by leg, and use relative speed for same/opposite directions.";
  }
  if (/probability|dice|card|coin/i.test(q)) {
    return "count the total sample space and the favourable cases explicitly; use combinations only when order does not matter.";
  }
  if (/series|sequence|pattern/i.test(q)) {
    return "test first differences, then ratios, then alternating or square/cube overlays — stop when one rule explains every term.";
  }
  if (/syllogism|venn/i.test(q)) {
    return "draw the minimal Venn set, then check each conclusion independently against the valid diagrams.";
  }
  if (/direction|displacement/i.test(q)) {
    return "plot the path on a grid with fixed north, then compute net displacement with Pythagoras instead of tracking turns mentally.";
  }
  if (/seating|arrangement|puzzle/i.test(q)) {
    return "fix the most-constrained person first, translate every clue into the diagram, and re-read unused clues after each placement.";
  }
  if (/data interpretation|bar|pie|graph/i.test(q)) {
    return "read the exact unit and year on the axes before computing — most DI errors are unit errors, not arithmetic errors.";
  }
  if (/percentage|profit|interest|discount/i.test(q)) {
    return "convert percentages to fraction equivalents (12.5% = 1/8, 16.67% = 1/6) and calculate on the base actually asked.";
  }
  if (/average|mean/i.test(q)) {
    return "track the sum, not the average — the average shift equals the newcomer's deviation divided by the new count.";
  }
  return "translate the words into one or two equations before computing anything — a mis-set-up causes more errors than mis-arithmetic.";
}

/* ------------------------------ topic builders ----------------------------- */

function buildPolity(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” sits at the heart of Indian Polity — the answer must pin the exact constitutional provision, cite one controlling precedent, and state why it matters today. UPSC rewards article-level precision here, not essay-level generalities.`,
    points: [
      `Constitutional basis: ${polityArticleRef(q)}`,
      `Key judgment: ${polityCaseRef(q)} One accurate case name with its year adds more credibility in ${exam} Mains than three generic claims.`,
      `Institutional dimension: Identify the actors involved — Parliament, President, Governor, judiciary or the Election Commission — and the constitutional check that disciplines their power over ${p}.`,
      `Prelims trap: Look-alike provisions are the classic bait — Articles 32 vs 226 (writ jurisdiction), 352 vs 356 vs 360 (emergencies), 108 vs 112 (joint sitting vs annual financial statement) — so bind each number to its function while revising.`,
      `Mains pointer: Pair the provision with one current example or committee recommendation touching ${p}; a 2023–25 example converts a textbook answer into an analytical one.`,
      `Value addition: Close on the doctrine this question touches — federalism, basic structure or judicial review — that is the “so what” line markers look for.`,
    ],
    concept:
      "Revise: Fundamental Rights (Part III) with an article-to-right map, the DPSP–FR relationship, and the five writ types under Articles 32 and 226.",
  };
}

function buildHistory(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” is a Modern India staple — the examiner wants period-accurate facts, the cause-and-effect chain, and the event's long-run significance. Narration alone scores little; analysis of significance scores well.`,
    points: [
      `Historical context: Situate ${p} in its arc — Company rule → Crown rule → Freedom struggle — and lead with the trigger event, the actors and the year; markers scan for these first.`,
      `Key developments: Give three or four dated milestones instead of a story. For mass movements the arc 1919 (Rowlatt and Jallianwala) → 1920–22 (Non-Cooperation) → 1930–34 (Civil Disobedience) → 1942 (Quit India) shows escalating participation.`,
      `Cause–effect chain: Separate the immediate spark, the structural causes and the short-versus long-term consequences for ${p} — ${exam} rewards that analysis over the narrative.`,
      `Personality angle: Attach the right names and bodies — ${historyActorRef(q)} — one accurate attribution outweighs three vague ones.`,
      `PYQ angle: Prelims asks statement pairs with subtle year or person swaps; Mains asks significance. Practise converting this topic into both formats.`,
      `Common trap: Anachronism — do not import later ideologies into earlier periods, e.g. reading 1940s partition logic back into the 1905 Swadeshi movement.`,
    ],
    concept:
      "Revise: the 1857–1947 Modern India timeline as movement → year → leader triads before re-attempting this topic.",
  };
}

function buildGeography(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” tests your grip on physical processes — define the mechanism, trace the process chain, and land it on an Indian landscape. In Geography, the diagram is the answer.`,
    points: [
      `Core concept: State ${p} in one line through its physical driver — pressure gradient, Coriolis effect, relief or plate interaction — before adding any detail.`,
      `Process chain: Walk cause → process → result, and sketch the relevant cross-section (rain-shadow, monsoon trough or subduction zone); the sketch alone often carries the marks.`,
      `India-specific link: Anchor the mechanism locally — Western Ghats orographic rainfall, Himalayan glacial feed for rivers, or Deccan-trap regur soil — so the concept maps onto a real Indian landscape.`,
      `Map pointer: One or two placed names earn the map-reading marks — ${mapRef(q)} — practise marking these on an outline map.`,
      `PYQ angle: ${exam} papers love matched pairs (soil–crop, wind–season, current–coast); build the pairing table while revising rather than rereading paragraphs.`,
      `Mains pointer: Close with the human stakes — settlements, agriculture or disaster vulnerability tied to this feature — that converts physical geography into a complete answer.`,
    ],
    concept:
      "Revise: India's physical divisions (Himalaya → Plains → Peninsula) and the monsoon mechanism chapter in Physical Geography.",
  };
}

function buildEconomy(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” is an Economy question about a mechanism, not an opinion — trace the chain from policy to transmission to outcome, and quote one official figure. Structure beats commentary here.`,
    points: [
      `Definitions first: Anchor the answer with ${economyRef(q)} — precision vocabulary is the scoring core of Economy answers.`,
      `Mechanism: Trace the transmission explicitly, e.g. policy rate → bank funding cost → lending rates → credit growth → demand → inflation; examiners score the chain, not the label.`,
      `Policy link: Tie ${p} to the governing framework — RBI's inflation-targeting band, the FRBM consolidation path, or the GST Council's cooperative-federalism design — so the answer reads grounded, not theoretical.`,
      `Data check: In ${exam}, one credible figure (Economic Survey, Union Budget, RBI annual report) with source beats three adjectives; bank two or three per topic.`,
      `Prelims trap: Vocabulary flips are the bait — repo vs reverse repo, revenue vs capital expenditure, disinvestment vs strategic sale; Prelims options are engineered on these swaps.`,
      `Mains use: Name the trade-off the question hides — growth vs inflation, equity vs efficiency — and take a reasoned position; naming the tension is the analytical step most answers miss.`,
    ],
    concept:
      "Revise: the monetary-policy operating framework (repo corridor, CPI targeting) and budget terminology (fiscal, revenue and primary deficits) before re-attempting this.",
  };
}

function buildEnvironment(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” blends science with law — get the definition, the governing Act or Convention, and one species-or-site fact exactly right. Environmental answers are definition-sensitive, so precision is the differentiator.`,
    points: [
      `Concept clarity: Define ${p} precisely — which Act, which Schedule, which Convention — because environment questions are won and lost on definitional accuracy.`,
      `Legal and policy frame: Map the governing layer — Environment (Protection) Act 1986, Wildlife (Protection) Act 1972 schedules, Forest (Conservation) Act 1980, or the international layer (UNFCCC → Paris Agreement 2015 → India's net-zero-2070 pledge).`,
      `Facts to bank: One species–status pair (IUCN category), one protected site (Ramsar or tiger reserve) and one figure (forest cover per ISFR) — that trio is the evidentiary spine of the answer.`,
      `Prelims trap: Convention vs protocol vs framework swaps (Kyoto Protocol vs Paris Agreement; CBD vs CITES) are deliberate bait — fix each instrument to its year and purpose.`,
      `Mains angle: Weigh development against conservation explicitly, then resolve with a mitigation-hierarchy or community-participation idea (joint forest management, eco-tourism revenue sharing).`,
      `Current linkage: ${exam} almost always gives this a news hook — reference the latest COP outcome or national mission (green hydrogen, LiFE) with its date.`,
    ],
    concept:
      "Revise: the protected-area ladder (National Park → Wildlife Sanctuary → Biosphere Reserve) and the major environment conventions timeline.",
  };
}

function buildIR(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” is a current-affairs-flavoured IR question — lead with the recent development, state India's core interest, and end with a way forward. IR answers are graded against currency and balance.`,
    points: [
      `Context: Open with what changed recently around ${p} — a summit outcome, a signing, a border development — dated to its year; generic background reads stale.`,
      `Stakes for India: State the core interest in one line — strategic autonomy, connectivity, trade routes or diaspora — and test every fact against that interest.`,
      `Institutional detail: Name the grouping precisely — ${irRef(q)} — because ${exam} Prelims rewards exact rosters, founding years and secretariats.`,
      `Balanced view: Present the partner's perspective too (China's connectivity logic, the US Indo-Pacific math, the neighbourhood's domestic compulsions) — symmetry signals analytical maturity.`,
      `Way forward: End with India-specific steps — multi-alignment, neighbourhood-first delivery, or blue-economy leverage — not with a vague call for cooperation.`,
      `Sources to cite: MEA statements, PIB releases and one think-tank analysis (IDSA/ORF), quoted sparingly and attributed clearly.`,
    ],
    concept:
      "Revise: the membership-and-charter table of India's key groupings (SAARC, BIMSTEC, SCO, Quad, BRICS) plus one recent summit outcome each.",
  };
}

function buildScience(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” demands a mechanism-first explanation — principle, then application, then India's institutional programme — with one dated milestone. Skip the buzzword; show the science underneath it.`,
    points: [
      `Working principle: Explain ${p} in order — physics/chemistry/biology principle → engineering build-out → application — that sequence itself earns marks.`,
      `Applications: Give two civilian uses and one strategic use (health, agriculture, governance, defence) — breadth across sectors signals command.`,
      `India's programme: Attach the institutional anchor — ISRO for space (PSLV/GSLV/LVM3 classes, NavIC constellation), DBT/BIRAC for biotech, the National Quantum Mission (2023), or the India Semiconductor Mission for fabs.`,
      `Prelims trap: In ${exam}, match the right mission to the right agency and year — options routinely swap DBT with DST, or Chandrayaan-3's lander details with Aditya-L1's orbit.`,
      `Mains angle: Close on governance — ethics of gene editing, data protection around AI, dual-use concerns — technology answers earn their final marks when they end in policy.`,
      `Keep it current: One 2023–25 milestone (a launch, an approval, a mission phase) signals a living understanding of the field rather than a memorised paragraph.`,
    ],
    concept:
      "Revise: India's mission agencies and flagship tech missions with launch years (National Quantum Mission 2023, Gaganyaan, NavIC, India Semiconductor Mission).",
  };
}

function buildCSAT(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” is a Paper-II (CSAT) process question — the winning move is a disciplined setup, a standard shortcut, and a strict time budget. CSAT checks process discipline under pressure, not advanced mathematics.`,
    points: [
      `What is tested: Read what is actually asked before computing anything — CSAT options are engineered around the misread (opposite of, cannot be, at least).`,
      `Setup: Write the givens as variables or equations first; for ${p}, most errors come from mis-set-up, not from arithmetic.`,
      `Solve path: ${csatSolvePath(q)}`,
      `Shortcut: Memorise the standard result for this family — percentage–fraction equivalents, the LCM trick for work-rate, net displacement for directions — it converts a two-minute question into thirty seconds.`,
      `Time budget: In ${exam} Paper-II you effectively get about two minutes per question, and it is qualifying (33%), so accuracy per minute is the real metric — flag and move on if setup exceeds ninety seconds.`,
      `Verify: Substitute the answer back into the original condition once; one line of checking catches the classic solved-for-the-wrong-quantity error.`,
    ],
    concept:
      "Revise: the basics family for this question type — percentage–fraction table, rate problems, or Venn logic — then move to timed practice.",
  };
}

function buildCurrent(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  return {
    summary: `“${phrase}” is a current-affairs item — anchor it to the specific development, add the scheme's static skeleton, and close with significance. The news hook earns entry marks; the static linkage earns full marks.`,
    points: [
      `Why in news: Tie the answer to the specific event or announcement behind ${p} — current-affairs marks come from the hook, not from generic background.`,
      `Background: Give the three-line history — launch year, parent ministry, predecessor programme — so the answer reads situated rather than stranded.`,
      `Key facts: For ${exam}, bullet the numbers (outlay, coverage, deadline) and attribute each to PIB, the Economic Survey or the ministry's annual report.`,
      `Significance: One line each on economy, governance and federalism wherever applicable — that is how a news item becomes a Mains answer.`,
      `Prelims trap: Scheme–ministry–year mismatches are the favourite bait; maintain a one-page table of this quarter's launches and approvals.`,
      `Link to static: Close by tying the news to the syllabus concept it tests (fiscal federalism, cooperative federalism, RBI framework) — UPSC blends current and static deliberately.`,
    ],
    concept:
      "Revise: this quarter's scheme-launch table (scheme, ministry, outlay, year) plus the static concept each launch hooks into.",
  };
}

function fallbackDirective(q: string): string {
  if (/\b(discuss|debate)\b/i.test(q)) return "discuss";
  if (/\b(examine|scrutin)\b/i.test(q)) return "examine";
  if (/\b(evaluate|assess|critically)\b/i.test(q)) return "evaluate";
  if (/\b(compare|contrast)\b/i.test(q)) return "compare";
  if (/\b(why|reason|rationale)\b/i.test(q)) return "justify with causes";
  return "explain";
}

function buildFallback(phrase: string, q: string, exam: string): DoubtAnswer {
  const p = lowerFirst(phrase);
  const directive = fallbackDirective(q);
  return {
    summary: `“${phrase}” rewards structure over volume — decode the directive word, layer definition → mechanism → example, and finish with a way forward. That skeleton reads as understanding even when content is thin.`,
    points: [
      `Decode the demand: The verb here asks you to ${directive} — underline it in the question and answer to that verb exactly, as ${exam} markers expect.`,
      `Core explanation: Build three layers for ${p} — a one-line definition, the mechanism behind it, and one example — layering signals understanding better than a memorised paragraph.`,
      `Add authority: One data point, one committee or report name, and one current example per answer is the marking scheme's sweet spot.`,
      `Structure for the examiner: Intro (two lines) → body with sub-headings → conclusion with a way forward; markers skim, so make the skeleton visible.`,
      `Study loop: Convert this doubt into a flashcard question and one Prelims-style statement pair — retrieval practice, not rereading, moves it to long-term memory.`,
      `When stuck in the exam: Write the definition you are sure of and reason outward from it — partial analytical framing scores better than an off-target recall dump.`,
    ],
    concept:
      "Revise: the syllabus heading this question belongs to, and rebuild the answer's skeleton from NCERT-level definitions first.",
  };
}

const BUILDERS: Record<DoubtTopic, (phrase: string, q: string, exam: string) => DoubtAnswer> = {
  polity: buildPolity,
  history: buildHistory,
  geography: buildGeography,
  economy: buildEconomy,
  environment: buildEnvironment,
  ir: buildIR,
  science: buildScience,
  csat: buildCSAT,
  current: buildCurrent,
  fallback: buildFallback,
};

/* --------------------------------- exports -------------------------------- */

/**
 * Answer a doubt deterministically.
 * @param question raw question text from the student
 * @param exam     exam vertical (e.g. "UPSC CSE", "State PCS")
 * @param subject  subject tag chosen by the student
 */
export async function answerDoubt(
  question: string,
  exam: string,
  subject: string
): Promise<DoubtAnswer> {
  const q = (question ?? "").trim();
  const phrase = corePhrase(q);
  const examTag = (exam ?? "").trim() || "UPSC CSE";
  const topic = classifyDoubt(q, subject ?? "");
  return BUILDERS[topic](phrase, q, examTag);
}
