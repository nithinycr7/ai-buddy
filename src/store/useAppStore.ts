// src/store/useAppStore.ts
import { create } from "zustand";

/* =========================
   Types
   ========================= */
import { persist } from "zustand/middleware";

export type ClassItem = {
  id: string;
  dateISO: string;
  icon: string;
  title: string;
  topic: string;
  summary: string;
  progress: number;
};

export type Exam = {
  id: string;
  subject: string;
  topic: string;
  dateISO: string;
};

export type TranscriptTurn = {
  id: string;
  role: "child" | "coach";
  text: string;
  ts: number;
  nudge?: string;
};

export type HobbyPlanDay = {
  day: number;
  title: string;
  tasks: string[];
  unlocked: boolean;
  done: boolean;
};

export type Grievance = {
  id: string;
  createdAt: number;
  text: string;
  notifyTeacherId: string;
  notifyParentId: string;
  status: "open" | "acknowledged" | "resolved";
};

export type Assignment = {
  id: string;
  dateISO: string;
  title: string;
  subject: string;
  type: "mcq" | "quiz";
  numQuestions: number;
  completed: boolean;
};

export type State = {
  // Existing slices used by Home.tsx (kept here so Home keeps working)
  aiTip: string;
  upcomingExams: Exam[];
  getClassesFor: (dateISO: string) => ClassItem[];

  // New: Personality Development
  communication: {
    transcripts: TranscriptTurn[];
    addTurn: (t: Omit<TranscriptTurn, "id" | "ts">) => void;
    addCoachNudge: (text: string) => void;
    reset: () => void;
  };

  hobby: {
    selected: string | null;
    plans: Record<string, HobbyPlanDay[]>;
    select: (name: string) => void;
    markDone: (hobby: string, day: number) => void;
  };

  grievances: {
    all: Grievance[];
    submit: (text: string) => void;
  };

  // New: Assignments
  getAssignmentsFor: (dateISO: string) => Assignment[];
  toggleAssignment: (id: string, completed: boolean) => void;

  // Mock data (classes + assignments)
  _classes: ClassItem[];
  _assignments: Assignment[];
};

const todayISO = new Date().toISOString().slice(0, 10);
const plus = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export type ClassCard = {
  id: string;
  icon: string;
  title: string;
  topic: string;
  progress: number;
  summary: string;
};

export type SubjectKey = "Biology" | "Math" | "Physics" | "Chemistry";

export type StudentBadge = "Math Whiz" | "Science Explorer" | "History Buff" | "Language Lover";

export type UserProfile = {
  name: string;
  avatarUrl?: string;
  section: string;
  className: string; // e.g., "10"
  schoolLogoUrl?: string;
  badges?: StudentBadge[];
};

export type LeaderboardEntry = { name: string; score: number };

export interface TimetableEntry {
  id: string; // `${dateISO}-${period}`
  period: number; // 1..N
  subject: SubjectKey | string;
  className: string; // e.g., "8"
  section: string; // e.g., "A"
  lessonPlan?: {
    topic: string;
  };
}

export interface TeachingNotes {
  tips: string[];
  examples: string[];
  coreConcepts: string[];
}

/* =========================
   Store shape
   ========================= */

export type AppState = {
  // ----- User (used by Header, etc.)
  user: UserProfile;
  state: State;

  // ----- Student area
  classes: ClassCard[];
  leaderboard: LeaderboardEntry[];
  whatsNext: string[];
  aiTip: string;
  quiz: { index: number; total: number; correct: number };
  upcomingExams: Exam[];

  // schedule: ISO date -> array of class IDs
  schedule: Record<string, string[]>;
  getClassesFor: (dateISO: string) => ClassCard[];

  // ----- Teacher meta
  subjects: SubjectKey[];
  classesList: string[]; // avoid name clash with `classes` above
  sections: string[];

  // curriculum
  _topicsBySubjectMap: Record<SubjectKey, string[]>;
  topicsBySubject: (subject: string) => string[];

  // timetable indexed by date ISO (YYYY-MM-DD)
  timetable: Record<string, TimetableEntry[]>;
  getTimetableForDate: (dateISO: string) => TimetableEntry[];

  // notes
  _notes: Record<SubjectKey, Record<string, TeachingNotes>>;
  getTeachingNotes: (subject: string, topic: string) => TeachingNotes | null;

  // write
  upsertLessonPlan: (args: {
    dateISO: string;
    periodId: string;
    subject: string;
    className: string;
    section: string;
    topic: string;
  }) => void;

  // engagement
  getEngagement: ({
    dateISO,
    className,
    section,
  }: {
    dateISO: string;
    className?: string;
    section?: string;
  }) => { rollNo: number; progress: number; name: string }[];

  // New: Personality Development
  communication: {
    transcripts: TranscriptTurn[];
    addTurn: (t: Omit<TranscriptTurn, "id" | "ts">) => void;
    addCoachNudge: (text: string) => void;
    reset: () => void;
  };

  hobby: {
    selected: string | null;
    plans: Record<string, HobbyPlanDay[]>;
    select: (name: string) => void;
    markDone: (hobby: string, day: number) => void;
  };

  grievances: {
    all: Grievance[];
    submit: (text: string) => void;
  };

  // New: Assignments
  getAssignmentsFor: (dateISO: string) => Assignment[];
  toggleAssignment: (id: string, completed: boolean) => void;

  // Mock data (classes + assignments)
  _classes: ClassItem[];
  _assignments: Assignment[];
};
/* =========================
   Helpers (deterministic)
   ========================= */

function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], idx: number) {
  return arr[((idx % arr.length) + arr.length) % arr.length];
}

function buildDefaultTimetableForDate(
  dateISO: string,
  subjects: SubjectKey[],
  classesList: string[],
  sections: string[],
  periods = 6
): TimetableEntry[] {
  const base = hashStr(dateISO);
  const rows: TimetableEntry[] = [];
  for (let p = 1; p <= periods; p++) {
    rows.push({
      id: `${dateISO}-${p}`,
      period: p,
      subject: pick(subjects, base + p) as SubjectKey,
      className: pick(classesList, base + p * 3),
      section: pick(sections, base + p * 5),
    });
  }
  return rows;
}

function deterministicEngagement(dateISO: string, className?: string, section?: string) {
  const key = `${dateISO}|${className ?? "ALL"}|${section ?? "ALL"}`;
  const base = hashStr(key);
  const N = 18;
  const vals: number[] = [];
  for (let i = 0; i < N; i++) {
    const v = ((base ^ (i * 1103515245)) >>> 0) % 100;
    vals.push(Math.max(5, Math.min(95, v)));
  }
  return vals;
}

/* =========================
   Static curriculum & notes
   ========================= */

const TOPICS: Record<SubjectKey, string[]> = {
  Biology: ["Photosynthesis", "Respiration", "Cells & Tissues", "Human Digestive System"],
  Math: ["Quadratic Equations", "Linear Equations", "Parabolas", "Polynomials"],
  Physics: ["Kinematics", "Newton’s Laws", "Work & Energy", "Waves"],
  Chemistry: ["Acids & Bases", "Periodic Table", "Chemical Bonding", "Reactions"],
};

const NOTES: Record<SubjectKey, Record<string, TeachingNotes>> = {
  Biology: {
    Photosynthesis: {
      tips: [
        "Show a leaf cross-section and highlight stomata.",
        "Contrast plants kept in light vs dark to build intuition.",
      ],
      examples: ["Chlorophyll as “solar panels”", "CO₂ intake through stomata"],
      coreConcepts: [
        "Photosynthesis converts light energy into chemical energy stored in glucose, sustaining most life on Earth.",
        "It occurs primarily in chloroplasts within mesophyll cells; chlorophyll pigments capture light efficiently.",
        "Two stages exist: light-dependent reactions (thylakoid membranes) and light-independent reactions (Calvin cycle, stroma).",
        "Photolysis of water in the light reactions releases electrons, protons, and oxygen gas as a byproduct.",
        "Electron transport chains create a proton gradient across the thylakoid membrane, driving ATP synthesis via ATP synthase.",
        "NADP⁺ is reduced to NADPH, carrying high-energy electrons to the Calvin cycle for carbon fixation.",
        "The Calvin cycle uses ATP and NADPH to fix CO₂ into 3‑carbon intermediates (G3P), ultimately forming glucose.",
        "RuBisCO catalyzes the first step of CO₂ fixation but can also bind O₂, causing photorespiration and efficiency loss.",
        "Chlorophyll absorbs blue and red light strongly; green light is reflected, giving leaves their typical color.",
        "Accessory pigments (carotenoids, xanthophylls) broaden the absorption spectrum and protect from photo-oxidative damage.",
        "Environmental factors (light intensity, CO₂ concentration, temperature) limit photosynthetic rate with characteristic curves.",
        "C3 plants are most common but suffer more from photorespiration under hot, dry conditions.",
        "C4 plants spatially separate initial CO₂ fixation to minimize photorespiration, increasing efficiency in high light/heat.",
        "CAM plants temporally separate CO₂ uptake (night) from Calvin cycle (day) to conserve water in arid environments.",
        "Stomata regulate gas exchange and transpiration; opening is controlled by guard cells responding to light and water status.",
        "The overall balanced equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂ summarizes mass and energy flow.",
        "Mineral nutrition (e.g., magnesium for chlorophyll) and water availability critically affect photosynthetic capacity.",
        "Artificial photosynthesis research aims to mimic natural systems for sustainable fuel production and CO₂ reduction.",
      ],
    },
    Respiration: {
      tips: [
        "Measure resting vs after-jog breathing rate.",
        "Compare aerobic and anaerobic in a quick table.",
      ],
      examples: ["Bread fermentation (yeast)", "Sprinting vs jogging"],
      coreConcepts: [
        "Cellular respiration extracts energy from organic molecules to synthesize ATP, the universal energy currency.",
        "Aerobic respiration requires oxygen and yields high ATP via oxidative phosphorylation; anaerobic yields less ATP.",
        "Glycolysis occurs in the cytosol, breaking glucose into two pyruvate molecules, producing a net gain of 2 ATP and 2 NADH.",
        "Pyruvate is converted to acetyl‑CoA in mitochondria, linking glycolysis to the citric acid (Krebs) cycle.",
        "The Krebs cycle oxidizes acetyl‑CoA to CO₂ while generating NADH and FADH₂ electron carriers.",
        "The electron transport chain in the inner mitochondrial membrane creates a proton motive force.",
        "ATP synthase uses the proton gradient to phosphorylate ADP to ATP (chemiosmosis).",
        "Oxygen acts as the terminal electron acceptor, forming water; without O₂, the chain halts.",
        "Fermentation pathways (lactic acid in muscles, ethanol in yeast) regenerate NAD⁺ to sustain glycolysis anaerobically.",
        "Aerobic respiration yields ~30–32 ATP per glucose; anaerobic yields ~2 ATP per glucose.",
        "Metabolic flexibility allows cells to oxidize fats (β‑oxidation) and proteins when glucose is scarce.",
        "Respiratory quotient (RQ) reflects substrate usage: ~1 for carbohydrates, ~0.7 for fats.",
        "Mitochondrial structure (cristae) maximizes surface area for ETC and ATP synthesis.",
        "Tight regulation via allosteric enzymes (e.g., PFK in glycolysis) matches ATP supply with cellular demand.",
        "Reactive oxygen species can be generated in the ETC; antioxidants and enzymes mitigate oxidative stress.",
        "Exercise intensity shifts metabolism from aerobic dominance to anaerobic contribution at higher workloads.",
        "Interplay with photosynthesis closes the global carbon and oxygen cycles across ecosystems.",
      ],
    },
    "Cells & Tissues": {
      tips: ["Onion peel slide photos help.", "Use blocks metaphor: cells → tissues → organs."],
      examples: ["Muscle vs nerve tissue", "Plant vs animal cell"],
      coreConcepts: [
        "Cell theory states all organisms are composed of cells, the basic unit of life, arising from pre‑existing cells.",
        "Prokaryotic cells lack membrane‑bound organelles; eukaryotic cells possess complex internal compartmentalization.",
        "Plasma membranes exhibit a fluid mosaic of lipids and proteins regulating selective transport and signaling.",
        "Organelles specialize functions: nucleus (genetic control), mitochondria (ATP), ER (synthesis), Golgi (processing).",
        "Cytoskeleton (microtubules, microfilaments, intermediate filaments) provides structure, transport, and motility.",
        "Cell junctions (tight, adherens, desmosomes, gap) coordinate adhesion and communication in tissues.",
        "Stem cells maintain tissue homeostasis via controlled proliferation and differentiation pathways.",
        "Epithelial tissue covers surfaces and lines cavities; classified by cell shape and layers.",
        "Connective tissue supports and binds; includes bone, cartilage, adipose, and blood with diverse ECM compositions.",
        "Muscle tissue (skeletal, cardiac, smooth) converts chemical energy to mechanical force via actin–myosin interactions.",
        "Nervous tissue comprises neurons and glia; specialized for rapid signaling and integration.",
        "Plant tissues include meristems (growth), dermal, vascular (xylem, phloem), and ground tissues.",
        "Cell walls in plants provide rigidity; plasmodesmata enable intercellular communication.",
        "Cell division (mitosis) ensures growth and repair; meiosis produces haploid gametes for sexual reproduction.",
        "Apoptosis sculpts tissues during development and eliminates damaged cells to maintain organismal health.",
        "Extracellular matrix composition and mechanical cues influence cell fate and tissue organization.",
        "Histology techniques (staining, microscopy) reveal structure–function relationships at the tissue level.",
      ],
    },
    "Human Digestive System": {
      tips: ["Trace the “food journey” on a diagram.", "Point out enzymes at each stage."],
      examples: ["Amylase in saliva", "Pepsin in stomach"],
      coreConcepts: [
        "Digestion mechanically and chemically breaks down food into absorbable molecules (monosaccharides, amino acids, lipids).",
        "Ingestion and mastication in the mouth increase surface area; saliva provides amylase and lubricates bolus formation.",
        "Swallowing transfers bolus via the pharynx and esophagus to the stomach through coordinated peristalsis.",
        "The stomach secretes HCl and pepsinogen; acidic environment activates pepsin for protein digestion and kills pathogens.",
        "Mucus and tight junctions protect gastric epithelium from autodigestion and acid damage.",
        "Chyme enters the duodenum where bile (emulsifies fats) and pancreatic enzymes (amylases, proteases, lipases) act.",
        "The small intestine (duodenum, jejunum, ileum) is the primary site for digestion and nutrient absorption.",
        "Villi and microvilli massively increase surface area; enterocytes use transporters for selective absorption.",
        "Carbohydrates are broken to monosaccharides; proteins to amino acids/peptides; lipids to fatty acids/monoglycerides.",
        "Chylomicrons transport absorbed lipids via lymphatics before entering systemic circulation.",
        "Gut motility is regulated by the enteric nervous system and hormones (gastrin, secretin, CCK).",
        "The large intestine absorbs water and electrolytes; gut microbiota ferment fibers and synthesize some vitamins.",
        "Liver processes absorbed nutrients, detoxifies metabolites, and produces bile; gallbladder stores and concentrates bile.",
        "Pancreas provides crucial digestive enzymes and bicarbonate to neutralize gastric acid in the duodenum.",
        "Digestive efficiency depends on enzyme activity, mucosal integrity, transit time, and microbiome balance.",
        "Malabsorption disorders and enzyme deficiencies can impair nutrient status and energy balance.",
      ],
    },
  },

  Math: {
    "Quadratic Equations": {
      tips: [
        "Relate solutions to the graph touching/cutting x-axis.",
        "Use completing the square visually.",
      ],
      examples: ["x² − 5x + 6 = 0 → (x−2)(x−3)=0", "Open up vs down (sign of a)"],
      coreConcepts: [
        "A quadratic equation has the form ax² + bx + c = 0 with a ≠ 0; its graph is a parabola.",
        "Roots (solutions) are x‑values where the graph intersects the x‑axis; multiplicity affects tangency.",
        "The quadratic formula x = [−b ± √(b² − 4ac)] / (2a) derives from completing the square.",
        "The discriminant Δ = b² − 4ac classifies roots: positive (two real), zero (one repeated), negative (complex).",
        "Completing the square rewrites ax² + bx + c into a(x + p)² + q, revealing vertex form and transformations.",
        "Factoring solves quadratics when it splits into linear factors; not all quadratics factor over the integers.",
        "Vertex coordinates are (−b / 2a, f(−b / 2a)); the axis of symmetry is x = −b / 2a.",
        "Coefficient a controls opening direction and width; b shifts the vertex horizontally; c is the y‑intercept.",
        "Sum and product of roots: r₁ + r₂ = −b/a, r₁·r₂ = c/a (Vieta’s formulas).",
        "Quadratics model diverse phenomena: projectile motion, area optimization, and revenue/profit curves.",
        "Graph transformations include vertical stretch/compression, reflection, and horizontal/vertical shifts.",
        "Completing the square aids integration and circle/ellipse derivations in analytic geometry.",
        "Complex roots occur in conjugate pairs; the graph does not cross the x‑axis when Δ < 0.",
        "Inequalities with quadratics use sign charts or graph reasoning to find solution intervals.",
        "Parameter sensitivity (changing a, b, c) shifts root positions and vertex; useful for modeling robustness.",
        "Quadratic sequences and recurrence relations link algebra to discrete mathematics contexts.",
      ],
    },
    "Linear Equations": {
      tips: ["Derive slope from two points.", "Predict y for given x (intuition)."],
      examples: ["y = 2x + 3", "x + y = 7"],
      coreConcepts: [
        "A linear equation in two variables represents a straight line: ax + by = c or slope‑intercept y = mx + c.",
        "Slope m measures rate of change: rise over run; positive slopes increase left to right, negative decrease.",
        "The intercept c is the y‑value when x = 0; x‑intercept occurs when y = 0.",
        "Point‑slope form y − y₁ = m(x − x₁) defines a line through a known point with slope m.",
        "Parallel lines share equal slopes; perpendicular lines have slopes whose product is −1.",
        "Systems of linear equations can be solved by substitution, elimination, or matrix methods.",
        "Determinants and rank provide criteria for unique, infinite, or no solutions in linear systems.",
        "Slope represents real‑world rates: speed, cost per unit, or marginal change in economics.",
        "Linear models approximate local behavior of nonlinear functions (first‑order Taylor approximation).",
        "Least squares fits a line to data by minimizing squared residuals (linear regression).",
        "Constraints modeled by linear inequalities define half‑planes; intersections form feasible regions.",
        "Piecewise linear models combine segments to approximate complex relationships while remaining interpretable.",
        "Transformations of coordinates (translation, scaling, rotation) alter line equations predictably.",
        "Vector form r = r₀ + tv represents lines in parametric form in higher dimensions.",
        "Understanding intercepts and slope enables quick sketching and sanity checks of algebraic results.",
      ],
    },
    Parabolas: {
      tips: ["Mark vertex & axis of symmetry.", "Connect to trajectories/fountains."],
      examples: ["y = (x−1)² + 4", "y = −2x²"],
      coreConcepts: [
        "A parabola is the locus of points equidistant from a focus and a directrix, yielding a characteristic U‑shape.",
        "Standard forms include y = ax² + bx + c and vertex form y = a(x − h)² + k with vertex (h, k).",
        "The parameter a controls the opening direction and width; larger |a| narrows the parabola.",
        "Axis of symmetry passes through the vertex; for y = ax² + bx + c, it is x = −b / (2a).",
        "Focus and directrix provide geometric definitions; reflective property explains satellite dish design.",
        "Completing the square converts general form to vertex form, simplifying graphing and analysis.",
        "Parabolic trajectories model projectile motion (neglecting air resistance) with constant acceleration.",
        "Affine transformations map parabolas to parabolas; symmetry aids reasoning about extrema.",
        "Real roots correspond to x‑axis intersections; complex roots indicate the graph stays above/below the axis.",
        "Optimization via vertex identifies maximum/minimum values useful for engineering and economics.",
        "Quadratic Bezier curves use parabolic segments in computer graphics and font rendering.",
        "Conic classification relates parabolas to ellipses and hyperbolas via eccentricity e = 1.",
        "Derivative of a quadratic is linear; the slope changes uniformly along the parabola.",
        "Applications span optics (headlight reflectors), antennas, and architectural arches.",
      ],
    },
    Polynomials: {
      tips: ["Warm up: degree & leading term.", "Show synthetic division."],
      examples: ["x³ − 2x + 1", "(x−1) as a factor?"],
      coreConcepts: [
        "A polynomial is a finite sum of terms aₖxᵏ with non‑negative integer exponents; degree is the highest power with nonzero coefficient.",
        "The leading coefficient influences end behavior; sign determines eventual direction of the graph.",
        "The Fundamental Theorem of Algebra guarantees exactly n complex roots (counting multiplicity) for degree n.",
        "Zeros correspond to x‑intercepts when they are real; multiplicity affects how the graph crosses or touches the axis.",
        "Factor and remainder theorems connect roots to factors and enable efficient evaluation/synthetic division.",
        "Long division and synthetic division simplify rational expressions and reveal oblique or horizontal asymptotes.",
        "Intermediate Value Theorem helps locate real roots by sign changes over intervals.",
        "Polynomial inequalities can be solved by analyzing sign charts across critical points.",
        "Derivative tests locate local maxima/minima and inflection points, shaping graph sketches.",
        "Orthogonal polynomials (Legendre, Chebyshev) arise in approximation and numerical analysis.",
        "Polynomial interpolation (Lagrange, Newton) constructs functions passing through given data points.",
        "Runge’s phenomenon warns against high‑degree interpolation over wide intervals; splines mitigate it.",
        "Factorization over ℝ vs ℂ differs; irreducible quadratics over ℝ correspond to complex conjugate roots.",
        "Stability in control theory often reduces to locating polynomial roots relative to the imaginary axis.",
      ],
    },
  },

  Physics: {
    Kinematics: {
      tips: ["Clarify distance vs displacement.", "Sketch simple v–t and s–t graphs."],
      examples: ["Car accelerating from rest", "Ball thrown upward"],
      coreConcepts: [
        "Kinematics describes motion without invoking forces, using displacement, velocity, and acceleration.",
        "Displacement is a vector from initials to final position; distance is the scalar path length traveled.",
      ],
    },
  },
  Chemistry: {
    "Acids & Bases": {
      tips: [
        "Use pH scale to explain strength.",
        "Relate to everyday examples (vinegar, baking soda).",
      ],
      examples: ["HCl in stomach", "NaOH in drain cleaner"],
      coreConcepts: [
        "Acids donate protons (H⁺) in aqueous solutions; bases accept protons or produce OH⁻.",
        "pH scale quantifies acidity/basicity: pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic.",
        "Strong acids/bases dissociate completely; weak acids/bases partially dissociate.",
        "The Bronsted–Lowry definition focuses on proton transfer, while the Lewis definition emphasizes electron pairs.",
        "Neutralization reactions produce water and a salt from acid–base reactions.",
        "Titration quantitatively determines concentration by neutralizing a known volume of acid/base with a standard solution.",
        "Indicators change color at specific pH ranges, signaling endpoint in titrations.",
        "Buffer solutions resist pH changes by neutralizing added acids/bases, crucial for biological systems.",
        "Acid–base reactions are exothermic; enthalpy changes can be measured calorimetrically.",
        "pKa values indicate acid strength; lower pKa means stronger acid (higher dissociation).",
        "The autoionization of water establishes Kw = [H⁺][OH⁻] = 1 × 10⁻¹⁴ at 25°C.",
        "Acids and bases play key roles in biological processes (digestion, respiration) and industrial applications.",
      ],
    },
    "Periodic Table": {
      tips: ["Use trends to predict properties.", "Relate groups to reactivity."],
      examples: ["Noble gases are inert", "Halogens are reactive"],
      coreConcepts: [
        "The periodic table organizes elements by increasing atomic number, revealing periodic trends in properties.",
        "Groups (columns) share similar chemical properties due to valence electron configurations.",
        "Periods (rows) show trends in atomic radius, ionization energy, and electronegativity across the table.",
        "Atomic radius decreases across a period (increased nuclear charge) and increases down a group (added electron shells).",
        "Ionization energy is the energy required to remove an electron; it generally increases across a period and decreases down a group.",
        "Electronegativity measures an atom’s ability to attract electrons in a bond; it increases across a period and decreases down a group.",
        "Metals are typically found on the left side, nonmetals on the right, with metalloids along the zigzag line.",
        "Transition metals exhibit variable oxidation states and form colored compounds due to d‑electron transitions.",
        "Lanthanides and actinides are f‑block elements with unique properties due to f‑electron filling.",
        "Periodic trends arise from electron configurations and effective nuclear charge interactions.",
        "The octet rule explains chemical bonding behavior, with atoms seeking stable electron configurations (8 valence electrons).",
        "Periodic law states that properties of elements recur periodically when arranged by atomic number.",
        "Understanding periodic trends aids in predicting reactivity, compound formation, and physical properties.",
        "The periodic table’s structure reflects quantum mechanical principles governing electron arrangements.",
      ],
    },
  },
};

/* =========================
   Store
   ========================= */

export const useAppStore = create<AppState>((set, get) => ({
  // ----- User
  user: {
    name: "Aarav Mehta",
    avatarUrl: "",
    section: "B",
    className: "10",
    schoolLogoUrl: "/images/school_image.jpg", // <-- update this line // Put your logo file in your project's public/assets or public/images folder
    badges: ["Math Whiz", "Science Explorer", "History Buff", "Language Lover"],
  },

  // ----- Required for AppState compatibility
  state: {
    aiTip: "",
    upcomingExams: [],
    getClassesFor: () => [],
    communication: {
      transcripts: [],
      addTurn: () => {},
      addCoachNudge: () => {},
      reset: () => {},
    },
    hobby: {
      selected: null,
      plans: {},
      select: () => {},
      markDone: () => {},
    },
    grievances: {
      all: [],
      submit: () => {},
    },
    getAssignmentsFor: () => [],
    toggleAssignment: () => {},
    _classes: [],
    _assignments: [],
  },
  _classes: [],

  // ----- Student
  classes: [
    // Biology topics
    {
      id: "bio-photosynthesis",
      icon: "🌱",
      title: "Biology",
      topic: "Photosynthesis",
      progress: 0.65,
      summary: "How leaves turn light into chemical energy (glucose).",
    },
    {
      id: "bio-respiration",
      icon: "🔥",
      title: "Biology",
      topic: "Respiration",
      progress: 0.4,
      summary: "Cellular respiration: glycolysis, Krebs cycle and oxidative phosphorylation.",
    },
    {
      id: "bio-cells",
      icon: "🧫",
      title: "Biology",
      topic: "Cells & Tissues",
      progress: 0.55,
      summary: "Structure & function of cells, types of tissues and basic histology.",
    },
    {
      id: "bio-digestive",
      icon: "🍽️",
      title: "Biology",
      topic: "Human Digestive System",
      progress: 0.2,
      summary: "Organs, enzymes and the journey of food through the digestive tract.",
    },

    // Math topics
    {
      id: "math-quadratics",
      icon: "➗",
      title: "Math",
      topic: "Quadratic Equations",
      progress: 0.35,
      summary: "Solving ax²+bx+c=0, graphing parabolas and using the quadratic formula.",
    },
    {
      id: "math-linear",
      icon: "📈",
      title: "Math",
      topic: "Linear Equations",
      progress: 0.6,
      summary: "Slope, intercepts and solving systems of linear equations.",
    },
    {
      id: "math-parabolas",
      icon: "🔺",
      title: "Math",
      topic: "Parabolas",
      progress: 0.25,
      summary: "Vertex form, axis of symmetry and transformations of parabolas.",
    },
    {
      id: "math-polynomials",
      icon: "🧮",
      title: "Math",
      topic: "Polynomials",
      progress: 0.5,
      summary: "Degree, factoring, roots and basic polynomial operations.",
    },

    // Physics topics
    {
      id: "phy-kinematics",
      icon: "🧲",
      title: "Physics",
      topic: "Kinematics",
      progress: 0.52,
      summary: "Displacement, velocity, acceleration and motion graphs.",
    },
    {
      id: "phy-newton",
      icon: "🧠",
      title: "Physics",
      topic: "Newton’s Laws",
      progress: 0.45,
      summary: "Laws of motion, forces, friction and free-body diagrams.",
    },
    {
      id: "phy-energy",
      icon: "⚡",
      title: "Physics",
      topic: "Work & Energy",
      progress: 0.3,
      summary: "Work, kinetic & potential energy, conservation and power.",
    },
    {
      id: "phy-waves",
      icon: "🌊",
      title: "Physics",
      topic: "Waves",
      progress: 0.2,
      summary: "Wave properties: amplitude, wavelength, frequency and simple wave equations.",
    },

    // A History sample (keep existing-like entry)
    {
      id: "his-ancient",
      icon: "📜",
      title: "History",
      topic: "Ancient Civilizations",
      progress: 0.8,
      summary: "Egypt, Indus Valley, and Mesopotamia foundations.",
    },
  ],
  leaderboard: [
    { name: "Aarav", score: 92 },
    { name: "Diya", score: 89 },
    { name: "Vivaan", score: 86 },
  ],
  whatsNext: ["Finish Biology notes", "Take Math Quiz 1.2", "Review History summary"],
  aiTip:
    "For Tomorrow:\n a) Bring 2 examples of everyday parabolas 📐\n b) Practice 5 math problems on quadratics",
  quiz: { index: 1, total: 8, correct: 2 },
  upcomingExams: [
    {
      id: "ex-bio-01",
      subject: "Biology",
      topic: "Photosynthesis & Respiration",
      dateISO: "2025-08-20",
    },
    { id: "ex-math-02", subject: "Math", topic: "Quadratic Equations", dateISO: "2025-08-22" },
    { id: "ex-his-03", subject: "History", topic: "Ancient Civilizations", dateISO: "2025-08-25" },
  ],

  // schedule (ISO → class IDs)
  schedule: {
    [new Date().toISOString().slice(0, 10)]: ["Biology", "Math", "Physics"],
    [new Date(Date.now() - 86400000).toISOString().slice(0, 10)]: ["History", "Biology"],
    "2025-08-01": ["Maths", "History"],
  },

  getClassesFor: (dateISO: string) => {
    const { classes, schedule } = get();
    const titles = schedule[dateISO] ?? [];
    if (titles.length === 0) return [];
    const byTitle: Record<string, ClassCard> = Object.fromEntries(classes.map(c => [c.title, c]));
    return titles.map(id => byTitle[id]).filter(Boolean);
  },

  // ----- Teacher meta
  subjects: ["Biology", "Math", "Physics", "Chemistry"],
  classesList: ["6", "7"],
  sections: ["A", "B", "C"],

  _topicsBySubjectMap: TOPICS,
  topicsBySubject: (subject: string) => {
    const map = get()._topicsBySubjectMap;
    return (map as any)[subject] ?? [];
  },

  // Timetable (lazy-built per date)
  timetable: {},

  getTimetableForDate: (dateISO: string) => {
    const s = get();
    if (!s.timetable[dateISO]) {
      const built = buildDefaultTimetableForDate(dateISO, s.subjects, s.classesList, s.sections);
      set(prev => ({ timetable: { ...prev.timetable, [dateISO]: built } }));
      return built;
    }
    return s.timetable[dateISO];
  },

  // Notes
  _notes: NOTES,
  getTeachingNotes: (subject: string, topic: string) => {
    const notes = get()._notes as any;
    const subj = notes?.[subject];
    if (!subj) return null;
    return subj[topic] ?? null;
  },

  // Upsert lesson plan onto a timetable entry (for a date)
  upsertLessonPlan: ({ dateISO, periodId, subject, className, section, topic }) => {
    const s = get();
    const rows = s.timetable[dateISO] || s.getTimetableForDate(dateISO);
    const idx = rows.findIndex(r => r.id === periodId);
    const updated: TimetableEntry =
      idx >= 0
        ? { ...rows[idx], subject, className, section, lessonPlan: { topic } }
        : {
            id: periodId,
            period: Number(periodId.split("-").pop() || 1),
            subject,
            className,
            section,
            lessonPlan: { topic },
          };

    const next = [...rows];
    if (idx >= 0) next[idx] = updated;
    else next.push(updated);

    set(prev => ({ timetable: { ...prev.timetable, [dateISO]: next } }));
  },
  // engagement
  getEngagement: ({
    dateISO,
    className,
    section,
  }: {
    dateISO: string;
    className?: string;
    section?: string;
  }) => {
    const key = `${dateISO}|${className ?? "ALL"}|${section ?? "ALL"}`;
    const base = hashStr(key);
    const students: { rollNo: number; progress: number; name: string }[] = [];
    for (let roll = 1; roll <= 30; roll++) {
      const v = ((base ^ (roll * 1103515245)) >>> 0) % 100;
      students.push({
        rollNo: roll,
        progress: Math.max(5, Math.min(95, v)),
        name: `Student ${roll}`,
      });
    }
    return students;
  },

  // ------- Personality: Communication -------
  communication: {
    transcripts: [],
    addTurn: t =>
      set(s => ({
        communication: {
          ...s.communication,
          transcripts: [...s.communication.transcripts, { id: makeId(), ts: Date.now(), ...t }],
        },
      })),
    addCoachNudge: (text: string) =>
      set(s => ({
        communication: {
          ...s.communication,
          transcripts: [
            ...s.communication.transcripts,
            {
              id: makeId(),
              ts: Date.now(),
              role: "coach",
              text,
              nudge: "Try to add reasons (“because…”) and one follow-up question.",
            },
          ],
        },
      })),
    reset: () =>
      set(s => ({
        communication: { ...s.communication, transcripts: [] },
      })),
  },

  // ------- Personality: Hobby -------
  hobby: {
    selected: null,
    plans: {
      Painting: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        title: `Painting Day ${i + 1}`,
        tasks:
          i === 0
            ? ["Gather supplies", "Primary color mixing"]
            : ["Practice 20 mins", "Reflect 2 lines"],
        unlocked: i === 0,
        done: false,
      })),
      Guitar: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        title: `Guitar Day ${i + 1}`,
        tasks:
          i === 0
            ? ["Tune strings", "Learn 2 basic chords"]
            : ["Strum pattern 5 mins", "Chord switch practice"],
        unlocked: i === 0,
        done: false,
      })),
    },
    select: (name: string) => set(s => ({ hobby: { ...s.hobby, selected: name } })),
    markDone: (hobby: string, day: number) =>
      set(s => {
        const copy = s.hobby.plans[hobby]?.map(d => ({ ...d }));
        if (!copy) return s;
        const idx = copy.findIndex(d => d.day === day);
        if (idx === -1) return s;
        copy[idx].done = true;
        if (idx + 1 < copy.length) copy[idx + 1].unlocked = true;
        return { hobby: { ...s.hobby, plans: { ...s.hobby.plans, [hobby]: copy } } };
      }),
  },

  // ------- Personality: Grievance -------
  grievances: {
    all: [],
    submit: (text: string) =>
      set(s => ({
        grievances: {
          ...s.grievances,
          all: [
            ...s.grievances.all,
            {
              id: makeId(),
              createdAt: Date.now(),
              text,
              notifyTeacherId: "teacher-1",
              notifyParentId: "parent-1",
              status: "open",
            },
          ],
        },
      })),
  },

  // ------- Assignments -------
  _assignments: [
    {
      id: "a1",
      dateISO: todayISO,
      title: "Fractions – MCQ Set 1",
      subject: "Math",
      type: "mcq",
      numQuestions: 10,
      completed: false,
    },
    {
      id: "a2",
      dateISO: todayISO,
      title: "Leaf Parts – Quiz",
      subject: "Science",
      type: "quiz",
      numQuestions: 8,
      completed: false,
    },
    {
      id: "a3",
      dateISO: todayISO,
      title: "Indus Valley – MCQ",
      subject: "History",
      type: "mcq",
      numQuestions: 12,
      completed: true,
    },
  ],
  getAssignmentsFor: (dateISO: string) => get()._assignments.filter(a => a.dateISO === dateISO),
  toggleAssignment: (id: string, completed: boolean) =>
    set(s => ({
      _assignments: s._assignments.map(a => (a.id === id ? { ...a, completed } : a)),
    })),
}));
// function todayISO(arg0: number): string {
//   throw new Error('Function not implemented.')
// }

// Simple unique ID generator for store items
function makeId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
