import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────
// PROGRAMS
// ─────────────────────────────────────────────
const programData = [
  {
    name: 'Computer Science',
    faculty: 'Science',
    totalCredits: 120,
    description: 'Study of computation, algorithms, and software systems.',
  },
  {
    name: 'Biology',
    faculty: 'Science',
    totalCredits: 120,
    description: 'Study of living organisms and biological systems.',
  },
  {
    name: 'Business Administration',
    faculty: 'Social Sciences',
    totalCredits: 120,
    description: 'Study of business management, economics, and organisational behaviour.',
  },
]

// ─────────────────────────────────────────────
// DISTRIBUTION COURSES (shared pool)
// Min 4 per category, mix of subject prefixes
// Cross-listed courses stored as ONE record
// ─────────────────────────────────────────────
const distributionCourseData = [
  // Humanities
  {
    code: 'PHIL 1001', name: 'Introduction to Philosophy',
    faculty: 'Humanities', subjectPrefix: 'PHIL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['ethics', 'critical-thinking'],
    description: 'Foundational questions in metaphysics, epistemology, and ethics.',
  },
  {
    code: 'HIST 1001', name: 'World History to 1500',
    faculty: 'Humanities', subjectPrefix: 'HIST',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['writing', 'research'],
    description: 'Survey of world civilisations from antiquity to the late medieval period.',
  },
  {
    code: 'ENGL 1021', name: 'Academic Writing and Rhetoric',
    faculty: 'Humanities', subjectPrefix: 'ENGL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['writing', 'communication'],
    description: 'Develops skills in academic argumentation, research, and writing.',
  },
  {
    code: 'RELI 1001', name: 'Introduction to World Religions',
    faculty: 'Humanities', subjectPrefix: 'RELI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['ethics', 'culture'],
    description: 'Comparative study of major world religions and their traditions.',
  },

  // Arts & Letters
  {
    code: 'MUSI 1001', name: 'Introduction to Music',
    faculty: 'Arts & Letters', subjectPrefix: 'MUSI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['arts', 'culture'],
    description: 'Survey of Western music history and basic music theory.',
  },
  {
    code: 'FINA 1001', name: 'Introduction to Fine Arts',
    faculty: 'Arts & Letters', subjectPrefix: 'FINA',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['arts', 'visual-culture'],
    description: 'Survey of visual art history from ancient to contemporary.',
  },
  {
    code: 'DRAM 1001', name: 'Introduction to Theatre',
    faculty: 'Arts & Letters', subjectPrefix: 'DRAM',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['performance', 'communication'],
    description: 'History and practice of theatrical performance.',
  },
  {
    // Cross-listed: VMCS 1821 / SPAN 1821 — ONE record, student picks which faculty it counts toward
    code: 'VMCS 1821', crossListedCode: 'SPAN 1821',
    name: 'Spanish Language and Visual Culture',
    faculty: 'Arts & Letters', subjectPrefix: 'VMCS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['language', 'visual-culture', 'culture'],
    description: 'Intermediate Spanish through the lens of Latin American visual culture.',
  },

  // Social Sciences
  {
    code: 'ECON 1001', name: 'Introduction to Economics',
    faculty: 'Social Sciences', subjectPrefix: 'ECON',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['economics', 'finance', 'business'],
    description: 'Principles of micro and macroeconomics.',
  },
  {
    code: 'SOCI 1001', name: 'Introduction to Sociology',
    faculty: 'Social Sciences', subjectPrefix: 'SOCI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['society', 'culture', 'research'],
    description: 'Sociological perspectives on society, institutions, and social change.',
  },
  {
    code: 'PSYC 1001', name: 'Introduction to Psychology',
    faculty: 'Social Sciences', subjectPrefix: 'PSYC',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['psychology', 'health-sciences', 'research'],
    description: 'Foundations of human behaviour, cognition, and mental processes.',
  },
  {
    code: 'POLS 1001', name: 'Introduction to Political Science',
    faculty: 'Social Sciences', subjectPrefix: 'POLS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['political-science', 'ethics', 'writing'],
    description: 'Comparative politics, political theory, and international relations.',
  },

  // Science (for non-science programs)
  {
    code: 'PHYS 1001', name: 'Introduction to Physics',
    faculty: 'Science', subjectPrefix: 'PHYS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['physics', 'engineering'],
    description: 'Mechanics, thermodynamics, and waves.',
  },
  {
    code: 'CHEM 1001', name: 'Introduction to Chemistry',
    faculty: 'Science', subjectPrefix: 'CHEM',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['chemistry', 'biology', 'health-sciences'],
    description: 'Atomic structure, bonding, reactions, and stoichiometry.',
  },
  {
    code: 'BIOL 1001', name: 'Introduction to Biology',
    faculty: 'Science', subjectPrefix: 'BIOL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['biology', 'health-sciences', 'research'],
    description: 'Cell biology, genetics, evolution, and ecology.',
  },
  {
    code: 'ENVS 1001', name: 'Introduction to Environmental Science',
    faculty: 'Science', subjectPrefix: 'ENVS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['environment', 'biology', 'research'],
    description: 'Earth systems, ecology, and environmental issues.',
  },
]

// ─────────────────────────────────────────────
// CS COURSES — covers 6 career pathways:
//   1. Machine Learning / AI
//   2. Software Engineering / Fullstack
//   3. Cybersecurity
//   4. Data Science
//   5. Systems / Low-level
//   6. Academic / Research
//
// Interdisciplinary departments represented:
//   MATH, STAT, PHYS, PSYC, ECON, BUSI
//
// prerequisites listed as course CODES —
// resolved to IDs after insert (two-pass)
// ─────────────────────────────────────────────
const csCourseData = [

  // ── YEAR 1 — Foundations ─────────────────────
  // Every pathway starts here. Tags are broad —
  // differentiation happens in Years 2-4.

  {
    code: 'COMP 1711', name: 'Introduction to Programming',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 1, credits: 3, isRequired: true,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'machine-learning', 'data-science', 'cybersecurity', 'systems'],
    description: 'Problem solving and programming using Python. Covers control flow, functions, and basic data structures.',
  },
  {
    code: 'COMP 1721', name: 'Object-Oriented Programming',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 1, credits: 3, isRequired: true,
    prerequisites: ['COMP 1711'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'software-engineering', 'systems'],
    description: 'Object-oriented design, inheritance, polymorphism, and design patterns using Java.',
  },
  {
    // Discrete math — critical for CS theory and security pathways
    code: 'MATH 1311', name: 'Discrete Mathematics',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 1, credits: 3, isRequired: true,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['algorithms', 'research', 'theory', 'cryptography', 'cybersecurity'],
    description: 'Logic, sets, relations, functions, graph theory, combinatorics, and proof techniques.',
  },
  {
    code: 'MATH 1211', name: 'Calculus I',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 1, credits: 3, isRequired: true,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['mathematics', 'machine-learning', 'data-science'],
    description: 'Limits, derivatives, and integrals of single-variable functions.',
  },
  {
    code: 'MATH 1221', name: 'Calculus II',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 1, credits: 3, isRequired: true,
    prerequisites: ['MATH 1211'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['mathematics', 'machine-learning', 'data-science'],
    description: 'Integration techniques, sequences, series, and multivariable introduction.',
  },
  {
    // Physics I — supports systems and engineering-adjacent pathways
    code: 'PHYS 1011', name: 'Physics I: Mechanics and Waves',
    faculty: 'Science', subjectPrefix: 'PHYS',
    year: 1, credits: 3, isRequired: false,
    prerequisites: ['MATH 1211'], corequisites: ['PHYS 1011L'],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['systems', 'engineering', 'hardware'],
    description: 'Classical mechanics, oscillations, waves, and thermodynamics.',
  },
  {
    // Lab co-requisite for PHYS 1011 — demonstrates co-req bundle in the engine
    code: 'PHYS 1011L', name: 'Physics I Laboratory',
    faculty: 'Science', subjectPrefix: 'PHYS',
    year: 1, credits: 1, isRequired: false,
    prerequisites: [], corequisites: ['PHYS 1011'],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['systems', 'engineering', 'hardware'],
    description: 'Experimental work accompanying Physics I.',
  },

  // ── YEAR 2 — Core CS + Pathway Divergence ────
  // Career tags become specific — same core, different weights.

  {
    // Gateway to algorithms, ML, security, and systems
    code: 'COMP 2711', name: 'Data Structures and Algorithms',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721', 'MATH 1311'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['algorithms', 'backend', 'machine-learning', 'data-science', 'cybersecurity', 'systems', 'research'],
    description: 'Arrays, linked lists, trees, graphs, hash tables, sorting, and complexity analysis.',
  },
  {
    // Systems pathway gateway
    code: 'COMP 2721', name: 'Computer Architecture and Organization',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721', 'MATH 1311'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['systems', 'hardware', 'cybersecurity', 'networking'],
    description: 'Processor design, memory hierarchy, assembly language, and instruction set architecture.',
  },
  {
    // Software engineering pathway — team dev, agile, testing
    code: 'COMP 2731', name: 'Software Engineering',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['software-engineering', 'fullstack', 'backend', 'programming'],
    description: 'Software design patterns, testing, version control, agile methodologies, and team development practices.',
  },
  {
    // Fullstack / web pathway gateway
    code: 'COMP 2751', name: 'Web Development',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: false,
    prerequisites: ['COMP 1721'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['frontend', 'fullstack', 'web-development', 'backend'],
    description: 'HTML, CSS, JavaScript, REST APIs, and modern frontend frameworks. Build full-stack web applications.',
  },
  {
    // Networking gateway — required for cybersecurity and systems pathways
    code: 'COMP 2761', name: 'Introduction to Computer Networks',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: false,
    prerequisites: ['COMP 2721'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['networking', 'cybersecurity', 'systems', 'backend'],
    description: 'Network protocols, TCP/IP stack, HTTP, DNS, routing, and socket programming.',
  },
  {
    // ML / Data Science gateway — math-heavy
    code: 'STAT 2111', name: 'Probability and Statistics for Computing',
    faculty: 'Science', subjectPrefix: 'STAT',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['MATH 1221'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_year',
    careerTags: ['statistics', 'machine-learning', 'data-science', 'research'],
    description: 'Probability theory, distributions, hypothesis testing, regression, and statistical computing in Python.',
  },
  {
    // Linear algebra — essential for ML, graphics, and data science
    code: 'MATH 2211', name: 'Linear Algebra',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 2, credits: 3, isRequired: false,
    prerequisites: ['MATH 1221'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['mathematics', 'machine-learning', 'data-science', 'research'],
    description: 'Vectors, matrices, linear transformations, eigenvalues, and applications to computing.',
  },
  {
    // Interdisciplinary: CS + Psychology → HCI, UX, accessibility
    code: 'PSYC 2201', name: 'Cognitive Psychology and Technology',
    faculty: 'Social Sciences', subjectPrefix: 'PSYC',
    year: 2, credits: 3, isRequired: false,
    prerequisites: ['PSYC 1001'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['ux', 'frontend', 'human-computer-interaction', 'research'],
    description: 'Human cognition, perception, memory, and decision-making applied to interface design and technology use.',
  },
  {
    // Interdisciplinary: CS + Economics → fintech, algorithmic trading
    code: 'ECON 2001', name: 'Microeconomics',
    faculty: 'Social Sciences', subjectPrefix: 'ECON',
    year: 2, credits: 3, isRequired: false,
    prerequisites: ['ECON 1001'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['economics', 'finance', 'data-science', 'business'],
    description: 'Consumer behaviour, firm theory, market structures, and welfare economics.',
  },

  // ── YEAR 3 — Specialisation Pathways ─────────
  // Courses cluster tightly around one or two pathways.
  // Career tags are narrow and specific here.

  {
    // Core for ALL pathways — algorithms is universal
    code: 'COMP 3711', name: 'Algorithm Design and Analysis',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: true,
    prerequisites: ['COMP 2711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['algorithms', 'machine-learning', 'backend', 'research', 'cybersecurity', 'systems'],
    description: 'Complexity classes, dynamic programming, greedy algorithms, network flow, and NP-completeness.',
  },
  {
    // Data Science + Fullstack pathway
    code: 'COMP 3721', name: 'Database Systems',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: true,
    prerequisites: ['COMP 2711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['databases', 'backend', 'data-science', 'fullstack'],
    description: 'Relational model, SQL, query optimisation, transactions, indexing, and NoSQL systems.',
  },
  {
    // Systems + OS pathway
    code: 'COMP 3741', name: 'Operating Systems',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2721', 'COMP 2711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['systems', 'backend', 'cybersecurity', 'hardware'],
    description: 'Process scheduling, memory management, file systems, concurrency, and system calls.',
  },
  {
    // ML / AI pathway — primary gateway to Year 4 ML courses
    code: 'COMP 3751', name: 'Artificial Intelligence',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2711', 'STAT 2111'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['artificial-intelligence', 'machine-learning', 'data-science', 'algorithms'],
    description: 'Search, constraint satisfaction, knowledge representation, planning, and machine learning fundamentals.',
  },
  {
    // Cybersecurity pathway — builds on networking
    code: 'COMP 3761', name: 'Computer Security',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2761', 'MATH 1311'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['cybersecurity', 'networking', 'cryptography', 'systems'],
    description: 'Cryptography, authentication, network security, vulnerabilities, penetration testing, and security protocols.',
  },
  {
    // Fullstack + UX pathway — builds on web dev and cognitive psyc
    code: 'COMP 3771', name: 'Human-Computer Interaction',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2751'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['ux', 'frontend', 'human-computer-interaction', 'fullstack'],
    description: 'User research, interface design, prototyping, usability testing, and accessibility.',
  },
  {
    // Research / Theory pathway — highly specialised
    code: 'COMP 3781', name: 'Theory of Computation',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['MATH 1311', 'COMP 2711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['theory', 'research', 'algorithms', 'cryptography'],
    description: 'Automata, formal languages, Turing machines, decidability, and computational complexity.',
  },
  {
    // Every-two-years — no downstream deps so no cascade risk
    code: 'COMP 3731', name: 'Computer Graphics',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2711', 'MATH 2211'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_two_years',
    lastOfferedYear: 2024,
    careerTags: ['visual-culture', 'programming', 'frontend', 'machine-learning'],
    description: 'Rendering pipeline, rasterisation, shading models, ray tracing, and 3D transformations.',
  },
  {
    // ML / Data Science — statistical learning bridges STAT and COMP
    code: 'STAT 3111', name: 'Statistical Learning',
    faculty: 'Science', subjectPrefix: 'STAT',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['STAT 2111', 'MATH 2211'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['statistics', 'machine-learning', 'data-science', 'research'],
    description: 'Regression, classification, regularisation, cross-validation, ensemble methods, and model selection.',
  },
  {
    // Numerical methods — research, simulation, scientific computing
    code: 'MATH 3211', name: 'Numerical Methods',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['MATH 2211', 'COMP 1711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['research', 'mathematics', 'data-science', 'machine-learning', 'systems'],
    description: 'Root finding, interpolation, numerical integration, ODEs, and linear system solvers.',
  },
  {
    // Interdisciplinary: CS + Business → entrepreneurship, startup, product
    code: 'BUSI 2101', name: 'Entrepreneurship and Innovation',
    faculty: 'Social Sciences', subjectPrefix: 'BUSI',
    year: 2, credits: 3, isRequired: false,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['business', 'product-management', 'fullstack', 'software-engineering'],
    description: 'Startup formation, business models, lean methodology, pitching, and technology commercialisation.',
  },

  // ── YEAR 4 — Advanced Specialisation ─────────
  // Highly pathway-specific. Each course belongs
  // firmly to 1-2 pathways. Tags are very narrow.

  {
    // ML pathway — core Year 4 ML course
    code: 'COMP 4711', name: 'Machine Learning',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3711', 'STAT 2111', 'MATH 2211'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['machine-learning', 'data-science', 'artificial-intelligence', 'algorithms'],
    description: 'Supervised and unsupervised learning, SVMs, neural networks, feature engineering, and model evaluation.',
  },
  {
    // Deep Learning — most specific ML course
    code: 'COMP 4741', name: 'Deep Learning',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 4711', 'STAT 3111'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['machine-learning', 'deep-learning', 'artificial-intelligence', 'data-science'],
    description: 'Deep neural networks, CNNs, RNNs, transformers, and large-scale training techniques.',
  },
  {
    // NLP — ML + language processing
    code: 'COMP 4761', name: 'Natural Language Processing',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 4711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['nlp', 'machine-learning', 'artificial-intelligence', 'data-science'],
    description: 'Text classification, sequence modelling, language models, and modern NLP with transformers.',
  },
  {
    // Computer Vision — ML + graphics
    code: 'COMP 4771', name: 'Computer Vision',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 4711', 'MATH 2211'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['computer-vision', 'machine-learning', 'artificial-intelligence'],
    description: 'Image processing, feature detection, object recognition, and deep learning for vision tasks.',
  },
  {
    // Systems pathway — distributed computing
    code: 'COMP 4721', name: 'Distributed Systems',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3741', 'COMP 3711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['backend', 'systems', 'fullstack', 'cloud'],
    description: 'Consensus algorithms, replication, fault tolerance, CAP theorem, and distributed storage.',
  },
  {
    // Cloud — backend / systems + fullstack convergence
    code: 'COMP 4781', name: 'Cloud Computing and DevOps',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 4721'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['cloud', 'backend', 'devops', 'systems', 'fullstack'],
    description: 'Cloud architecture, containerisation, CI/CD pipelines, infrastructure as code, and microservices.',
  },
  {
    // Cybersecurity pathway — advanced security
    code: 'COMP 4751', name: 'Advanced Network Security',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3761'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['cybersecurity', 'networking', 'cryptography', 'systems'],
    description: 'Advanced cryptographic protocols, intrusion detection, malware analysis, and ethical hacking.',
  },
  {
    // Cybersecurity + ML convergence — adversarial ML, anomaly detection
    code: 'COMP 4791', name: 'Security and Privacy in Machine Learning',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3761', 'COMP 4711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_two_years',
    lastOfferedYear: 2025,
    careerTags: ['cybersecurity', 'machine-learning', 'research', 'artificial-intelligence'],
    description: 'Adversarial attacks, differential privacy, federated learning, and secure model deployment.',
  },
  {
    // Research pathway — advanced algorithms
    code: 'COMP 4761R', name: 'Advanced Algorithms and Complexity',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3711', 'COMP 3781'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['algorithms', 'theory', 'research', 'cryptography'],
    description: 'Approximation algorithms, randomised algorithms, parameterised complexity, and open problems.',
  },
  {
    // Applied Data Analysis — bridges STAT and real-world data science
    code: 'STAT 4111', name: 'Applied Data Analysis',
    faculty: 'Science', subjectPrefix: 'STAT',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['STAT 3111'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['data-science', 'statistics', 'machine-learning', 'research'],
    description: 'High-dimensional data, survival analysis, time series, Bayesian methods, and case studies.',
  },
  {
    // Required for all CS students — integrative capstone
    code: 'COMP 4731', name: 'Capstone Project',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 6, isRequired: true,
    prerequisites: ['COMP 3711', 'COMP 2731'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'machine-learning', 'software-engineering'],
    description: 'Year-long software development or research project with an industry or academic partner.',
  },
]

// ─────────────────────────────────────────────
// CAREER PATHWAY REFERENCE
// Used in the AI layer and demo narrative.
// Maps career goal keywords → pathway tags.
// ─────────────────────────────────────────────
//
//  Machine Learning Engineer:
//    STAT 2111 → MATH 2211 → COMP 3751 → COMP 4711 → COMP 4741 / COMP 4761 / COMP 4771
//
//  Software Engineer / Fullstack Developer:
//    COMP 2731 → COMP 2751 → COMP 3771 → COMP 4721 → COMP 4781
//
//  Cybersecurity Analyst:
//    MATH 1311 → COMP 2761 → COMP 3761 → COMP 4751 → COMP 4791 (if offered)
//
//  Data Scientist:
//    STAT 2111 → MATH 2211 → COMP 3721 → STAT 3111 → COMP 4711 → STAT 4111
//
//  Systems / Backend Engineer:
//    COMP 2721 → COMP 3741 → COMP 4721 → COMP 4781
//
//  Research / Academia:
//    MATH 1311 → COMP 3781 → MATH 3211 → COMP 4761R → COMP 4791
//
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// HELPER — generate standard sections for a course
// Each course gets one section per time slot (5 MWF + 5 TTh = 10 sections).
// This guarantees the CSP solver can always find a conflict-free
// schedule regardless of which courses end up required together.
// Labs: W afternoon, 5 seats (waitlist demo)
// ─────────────────────────────────────────────
const MWF_SLOTS = [
  { code: '001', start: '08:30', end: '09:20', room: 'Dunn 101' },
  { code: '002', start: '09:30', end: '10:20', room: 'Dunn 102' },
  { code: '003', start: '10:30', end: '11:20', room: 'Dunn 201' },
  { code: '004', start: '11:30', end: '12:20', room: 'Dunn 202' },
  { code: '005', start: '13:00', end: '13:50', room: 'Dunn 301' },
]

const TTH_SLOTS = [
  { code: '006', start: '08:30', end: '09:45', room: 'Dunn 103' },
  { code: '007', start: '10:00', end: '11:15', room: 'Dunn 203' },
  { code: '008', start: '11:30', end: '12:45', room: 'Dunn 204' },
  { code: '009', start: '13:00', end: '14:15', room: 'Dunn 206' },
  { code: '010', start: '14:30', end: '15:45', room: 'Dunn 302' },
]

function makeSections(courseId: string, semester: string, hasLab = false) {
  const sections = [
    ...MWF_SLOTS.map(slot => ({
      courseId, sectionCode: slot.code, type: 'lecture', semester,
      days: ['Mon', 'Wed', 'Fri'], startTime: slot.start, endTime: slot.end,
      instructor: 'TBA', room: slot.room,
      totalSeats: 30, enrolledCount: 0, waitlistCount: 0,
    })),
    ...TTH_SLOTS.map(slot => ({
      courseId, sectionCode: slot.code, type: 'lecture', semester,
      days: ['Tue', 'Thu'], startTime: slot.start, endTime: slot.end,
      instructor: 'TBA', room: slot.room,
      totalSeats: 30, enrolledCount: 0, waitlistCount: 0,
    })),
  ]

  if (hasLab) {
    sections.push({
      courseId, sectionCode: 'LAB01', type: 'lab', semester,
      days: ['Wed'], startTime: '14:30', endTime: '16:20',
      instructor: 'TBA', room: 'Dunn 010',
      totalSeats: 5,   // intentionally small — demos waitlist behaviour
      enrolledCount: 0, waitlistCount: 0,
    })
  }

  return sections
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('Seeding database...')

  // ── 1. Programs ──────────────────────────────
  console.log('  → Programs')
  const programIdMap: Record<string, string> = {}

  for (const p of programData) {
    const program = await prisma.program.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    })
    programIdMap[p.name] = program.id
  }

  const csId = programIdMap['Computer Science']

  // ── 2. Distribution courses ───────────────────
  // Linked to CS as placeholder — they are shared but Prisma requires a programId
  console.log('  → Distribution courses')
  const courseIdMap: Record<string, string> = {}

  for (const c of distributionCourseData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { ...c, programId: csId, prerequisites: [], corequisites: [] },
      create: { ...c, programId: csId, prerequisites: [], corequisites: [] },
    })
    courseIdMap[c.code] = course.id
    // cross-listed code maps to the same record
    if ('crossListedCode' in c && c.crossListedCode) {
      courseIdMap[c.crossListedCode] = course.id
    }
  }

  // ── 3. CS courses (prerequisites empty for now) ──
  console.log('  → CS courses')
  for (const c of csCourseData) {
    const { prerequisites, corequisites, ...rest } = c
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { ...rest, programId: csId, prerequisites: [], corequisites: [] },
      create: { ...rest, programId: csId, prerequisites: [], corequisites: [] },
    })
    courseIdMap[c.code] = course.id
  }

  // ── 4. Resolve prerequisites + corequisites (code → id) then update ──
  // Two-pass: courses are all inserted before we resolve cross-references
  console.log('  → Resolving prerequisites and corequisites')
  for (const c of csCourseData) {
    const hasPrereqs  = c.prerequisites.length > 0
    const hasCoreqs   = c.corequisites.length > 0
    if (!hasPrereqs && !hasCoreqs) continue

    const prereqIds = c.prerequisites.map((code: string) => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Prerequisite not found in map: "${code}"`)
      return id
    })
    const coreqIds = c.corequisites.map((code: string) => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Corequisite not found in map: "${code}"`)
      return id
    })

    await prisma.course.update({
      where: { code: c.code },
      data: { prerequisites: prereqIds, corequisites: coreqIds },
    })
  }

  // ── 5. Sections ───────────────────────────────
  console.log('  → Sections')
  const SEED_YEAR  = new Date().getFullYear()
  const FALL_SEM   = `Fall ${SEED_YEAR}`
  const WINTER_SEM = `Winter ${SEED_YEAR + 1}`
  const SEMESTER   = FALL_SEM
  const addMonths  = (n: number) => new Date(Date.now() + n * 30 * 24 * 60 * 60 * 1000)

  // Courses that have labs — co-req bundle demo
  const coursesWithLabs = new Set(['COMP 1711', 'COMP 2711', 'STAT 2111', 'PHYS 1011'])

  // Reset demo student accounts so they start fresh on next login.
  // Order: enrollments → draftPlans → students (foreign-key safe).
  const DEMO_EMAILS = [
    'alex.johnson@mta.ca',
    'test1@mta.ca',
    'miketa@mta.ca',
    'josh@mta.ca',
    'test3@mta.ca',
  ]
  await prisma.enrollment.deleteMany({ where: { student: { email: { in: DEMO_EMAILS } } } })
  await prisma.draftPlan.deleteMany({ where: { student: { email: { in: DEMO_EMAILS } } } })
  await prisma.student.deleteMany({ where: { email: { in: DEMO_EMAILS } } })

  // Wipe all section data and rebuild from scratch on every seed run.
  // This removes stale rows from prior iterations (wrong year, wrong semester filter).
  // Any remaining enrollments (non-demo users) reference sections — delete them first.
  await prisma.enrollment.deleteMany({})
  await prisma.section.deleteMany({})

  const allCourses = await prisma.course.findMany({
    select: { id: true, code: true, semestersOffered: true }
  })

  // Fall pass — only courses offered in Fall
  for (const course of allCourses) {
    if (!course.semestersOffered.includes('Fall')) continue
    const hasLab = coursesWithLabs.has(course.code)
    for (const s of makeSections(course.id, SEMESTER, hasLab)) {
      await prisma.section.upsert({
        where: {
          courseId_sectionCode_semester: {
            courseId: s.courseId,
            sectionCode: s.sectionCode,
            semester: s.semester,
          },
        },
        update: s,
        create: s,
      })
    }
  }

  // Winter pass — only courses offered in Winter
  for (const course of allCourses) {
    if (!course.semestersOffered.includes('Winter')) continue
    const hasLab = coursesWithLabs.has(course.code)
    for (const s of makeSections(course.id, WINTER_SEM, hasLab)) {
      await prisma.section.upsert({
        where: {
          courseId_sectionCode_semester: {
            courseId: s.courseId,
            sectionCode: s.sectionCode,
            semester: s.semester,
          },
        },
        update: s,
        create: s,
      })
    }
  }

  // ── 6. Registration windows ───────────────────
  console.log('  → Registration windows')
  await prisma.registrationWindow.deleteMany({
    where: { semester: { notIn: [FALL_SEM, WINTER_SEM] } }
  })
  await prisma.registrationWindow.upsert({
    where: { semester: FALL_SEM },
    update: { status: 'open', opensAt: new Date(), closesAt: addMonths(3) },
    create: { semester: FALL_SEM, status: 'open', opensAt: new Date(), closesAt: addMonths(3) },
  })
  await prisma.registrationWindow.upsert({
    where: { semester: WINTER_SEM },
    update: { status: 'locked', opensAt: addMonths(6), closesAt: addMonths(7) },
    create: {
      semester: WINTER_SEM, status: 'locked',
      opensAt: addMonths(6), closesAt: addMonths(7)
    },
  })

  console.log('Done. Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
