import {
  CourseSchema,
  TrainingProgrammeSchema,
  type Course,
  type CourseSource,
  type TrainingProgramme,
} from "@/schemas";
import { COMPETENCY_BY_KEY } from "./competencies";
import { daysFromNow, hash, intBetween, roundTo, rng, validated } from "./seed";

/**
 * Catalogue fixtures spanning iGOT Karmayogi, NSSTA TPAC and internal content.
 * Titles and providers mirror the kind of content the real repository carries.
 */

type Seed = {
  title: string;
  summary: string;
  provider: string;
  source: CourseSource;
  level: Course["level"];
  minutes: number;
  competencies: Array<[string, number]>;
  outcomes: string[];
  prerequisites?: string[];
};

const SEEDS: Seed[] = [
  { title: "Foundations of Survey Sampling", summary: "Probability sampling designs used across Indian official surveys, from SRS to multi-stage stratified designs.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 360, competencies: [["sampling_methods", 2], ["survey_design", 2]], outcomes: ["Explain the sampling designs used in NSS rounds", "Compute inclusion probabilities and design weights", "Identify when a design is unsuitable for an estimate"] },
  { title: "Advanced Sampling and Variance Estimation", summary: "Complex survey estimation, replication methods and design effects for large-scale household surveys.", provider: "Indian Statistical Institute", source: "igot", level: "advanced", minutes: 720, competencies: [["sampling_methods", 4], ["data_quality", 3]], outcomes: ["Apply jackknife and bootstrap variance estimation", "Interpret design effects for policy reporting"], prerequisites: ["Foundations of Survey Sampling"] },
  { title: "Questionnaire Design for Household Surveys", summary: "Designing instruments that reduce measurement error and respondent burden in field conditions.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 480, competencies: [["survey_design", 3], ["data_quality", 2], ["communication", 2]], outcomes: ["Draft and pilot a survey module", "Diagnose common question-wording failures"] },
  { title: "National Accounts Statistics: SNA 2008 in Practice", summary: "GDP compilation, supply-use tables and the Indian implementation of SNA 2008.", provider: "NSSTA", source: "nssta_tpac", level: "advanced", minutes: 900, competencies: [["national_accounts", 4], ["industrial_statistics", 3]], outcomes: ["Trace a sector's contribution through the supply-use framework", "Apply deflation techniques to constant-price estimates"] },
  { title: "Consumer Price Index: Construction and Quality", summary: "Index number theory, price collection, item substitution and quality adjustment for CPI.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 420, competencies: [["price_statistics", 3], ["data_quality", 2]], outcomes: ["Construct a Laspeyres index from collected prices", "Handle item substitution without breaking the series"] },
  { title: "Labour Force Statistics and PLFS Concepts", summary: "ICLS standards, activity status classification and PLFS estimation procedures.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 480, competencies: [["labour_statistics", 3], ["survey_design", 2]], outcomes: ["Classify activity status per ICLS-19", "Interpret PLFS unemployment estimates correctly"] },
  { title: "Agricultural Statistics and Crop Estimation", summary: "Crop cutting experiments, area enumeration and the improved crop estimation methodology.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 400, competencies: [["agricultural_statistics", 3], ["sampling_methods", 2]], outcomes: ["Plan crop cutting experiments", "Assess yield estimate reliability"] },
  { title: "Annual Survey of Industries: Concepts and Compilation", summary: "ASI frame, NIC classification and industrial production index compilation.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 480, competencies: [["industrial_statistics", 3], ["metadata_standards", 2]], outcomes: ["Apply NIC codes consistently", "Compile IIP from source returns"] },
  { title: "SDG Indicators and the National Indicator Framework", summary: "Measuring, disaggregating and reporting SDG indicators from Indian data sources.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 360, competencies: [["sdg_indicators", 3], ["metadata_standards", 2], ["data_quality", 2]], outcomes: ["Map a national indicator to its global counterpart", "Produce disaggregated SDG estimates"] },
  { title: "Metadata Standards: SDMX and DDI for Official Statistics", summary: "Documenting and exchanging statistical data with international metadata standards.", provider: "iGOT Karmayogi", source: "igot", level: "advanced", minutes: 420, competencies: [["metadata_standards", 4], ["apis_integration", 2], ["open_data", 2]], outcomes: ["Publish a dataset with SDMX-conformant metadata"] },
  { title: "Data Quality Assurance Frameworks (NQAF)", summary: "Quality dimensions, editing and imputation, error profiling and quality declarations.", provider: "NSSTA", source: "nssta_tpac", level: "advanced", minutes: 600, competencies: [["data_quality", 4], ["metadata_standards", 3], ["ethics", 3]], outcomes: ["Build a quality declaration for a statistical product", "Design an editing and imputation strategy"] },
  { title: "Time Series Analysis and Seasonal Adjustment", summary: "Trend estimation, X-13ARIMA-SEATS and short-term forecasting for official series.", provider: "Indian Statistical Institute", source: "igot", level: "advanced", minutes: 540, competencies: [["time_series", 4], ["r_lang", 3]], outcomes: ["Seasonally adjust a monthly official series", "Validate a forecast against revisions"] },

  { title: "Python for Official Statistics", summary: "pandas, reproducible pipelines and survey data processing in Python.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 600, competencies: [["python", 2], ["data_quality", 2]], outcomes: ["Load, clean and tabulate survey microdata", "Write a reproducible processing script"] },
  { title: "Intermediate Python: Automating Statistical Workflows", summary: "Modular code, testing, scheduling and packaging analysis pipelines.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 720, competencies: [["python", 3], ["apis_integration", 2]], outcomes: ["Refactor a notebook into a tested pipeline", "Schedule a recurring statistical job"], prerequisites: ["Python for Official Statistics"] },
  { title: "R and the survey Package for Complex Designs", summary: "Design-based estimation in R for stratified, clustered and weighted samples.", provider: "Indian Statistical Institute", source: "igot", level: "intermediate", minutes: 540, competencies: [["r_lang", 3], ["sampling_methods", 3]], outcomes: ["Declare a complex survey design in R", "Produce design-correct standard errors"] },
  { title: "SQL for Data Analysts in Government", summary: "Querying, joins, window functions and performance for large administrative datasets.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 420, competencies: [["sql", 2]], outcomes: ["Write multi-table joins and aggregations", "Read a query plan and fix an obvious bottleneck"] },
  { title: "Advanced SQL and Data Modelling", summary: "Normalisation, indexing strategy and analytical query patterns.", provider: "iGOT Karmayogi", source: "igot", level: "advanced", minutes: 480, competencies: [["sql", 4], ["big_data", 2]], outcomes: ["Model a statistical warehouse schema"], prerequisites: ["SQL for Data Analysts in Government"] },
  { title: "Stata for Survey Data Analysis", summary: "svyset, weighted estimation and reproducible do-files.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 360, competencies: [["stata", 3], ["sampling_methods", 2]], outcomes: ["Run design-correct estimation in Stata"] },
  { title: "SPSS Essentials for Statistical Officers", summary: "Tabulation, hypothesis testing and output management in SPSS.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 300, competencies: [["spss", 2]], outcomes: ["Produce standard tabulations and tests"] },
  { title: "SAS Programming for Large Data Processing", summary: "DATA step, PROC SQL and batch processing for large statistical datasets.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 480, competencies: [["sas", 3]], outcomes: ["Process a multi-million-row dataset in batch"] },
  { title: "GIS and Spatial Analysis with QGIS", summary: "Geo-referencing frames, spatial joins and thematic mapping for statistical products.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 540, competencies: [["gis", 3], ["data_visualization", 2]], outcomes: ["Map an indicator at district level", "Geo-reference a survey frame"] },
  { title: "Data Visualization and Statistical Storytelling", summary: "Chart selection, accessible graphics and dashboards for policy audiences.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 360, competencies: [["data_visualization", 3], ["communication", 3]], outcomes: ["Choose the right chart for a claim", "Build an accessible dashboard"] },
  { title: "Machine Learning Foundations for Statisticians", summary: "Supervised and unsupervised learning, evaluation and where ML does and does not belong in official statistics.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 720, competencies: [["ai_ml", 3], ["python", 3], ["ethics", 2]], outcomes: ["Train and honestly evaluate a classifier", "Explain why a model is unsuitable for an official estimate"], prerequisites: ["Python for Official Statistics"] },
  { title: "Applied AI for Public Policy", summary: "LLMs, NLP and responsible AI adoption in government workflows.", provider: "iGOT Karmayogi", source: "igot", level: "advanced", minutes: 600, competencies: [["ai_ml", 4], ["ethics", 3], ["data_privacy", 3]], outcomes: ["Assess an AI use case for suitability and risk"] },
  { title: "Cloud Computing Fundamentals for Government", summary: "Compute, storage, containers and cost control on empanelled cloud.", provider: "NIC", source: "igot", level: "beginner", minutes: 420, competencies: [["cloud_computing", 2], ["government_cloud", 2]], outcomes: ["Deploy a small workload to government cloud"] },
  { title: "Building and Consuming Government APIs", summary: "REST design, authentication and secure data exchange between government systems.", provider: "NIC", source: "igot", level: "intermediate", minutes: 420, competencies: [["apis_integration", 3], ["cybersecurity", 2]], outcomes: ["Design and document a REST API", "Consume an authenticated government API safely"] },
  { title: "Open Data Publishing and OGD Platform", summary: "Licensing, machine-readable formats and publishing to data.gov.in.", provider: "iGOT Karmayogi", source: "igot", level: "beginner", minutes: 240, competencies: [["open_data", 3], ["metadata_standards", 2]], outcomes: ["Publish a compliant open dataset"] },
  { title: "Big Data Analytics for Statistical Systems", summary: "Distributed processing and alternative data sources for official statistics.", provider: "Indian Statistical Institute", source: "igot", level: "advanced", minutes: 660, competencies: [["big_data", 4], ["cloud_computing", 3], ["python", 3]], outcomes: ["Process a dataset too large for a single machine"] },

  { title: "Cybersecurity Awareness for Government Officials", summary: "Threats, phishing, secure handling of microdata and incident reporting.", provider: "NIC", source: "igot", level: "beginner", minutes: 180, competencies: [["cybersecurity", 2]], outcomes: ["Recognise and report a security incident"] },
  { title: "Data Privacy and the DPDP Act for Statisticians", summary: "Statistical confidentiality, disclosure control and DPDP obligations.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 300, competencies: [["data_privacy", 3], ["ethics", 3]], outcomes: ["Apply statistical disclosure control to a release", "Identify DPDP obligations for a dataset"] },
  { title: "Digital Signatures and e-Authentication", summary: "DSC, eSign and PKI for authenticated official records.", provider: "NIC", source: "igot", level: "beginner", minutes: 150, competencies: [["digital_signatures", 2]], outcomes: ["Sign and verify an official document digitally"] },
  { title: "Government Cloud (MeghRaj) and Compliance", summary: "Empanelment, data residency and compliance for government workloads.", provider: "NIC", source: "igot", level: "intermediate", minutes: 300, competencies: [["government_cloud", 3], ["cybersecurity", 2]], outcomes: ["Assess a workload against residency requirements"] },
  { title: "Digital Public Infrastructure and India Stack", summary: "Registries, consent frameworks and interoperability across government systems.", provider: "iGOT Karmayogi", source: "igot", level: "intermediate", minutes: 360, competencies: [["dpi", 3], ["apis_integration", 2]], outcomes: ["Explain consent-based data flows in India Stack"] },

  { title: "Leadership in Public Service", summary: "Leading teams, developing subordinates and setting direction in government.", provider: "LBSNAA", source: "igot", level: "intermediate", minutes: 480, competencies: [["leadership", 3], ["change_management", 2]], outcomes: ["Run an effective team review", "Plan a capability-building intervention"] },
  { title: "Communicating Statistics to Policy Makers", summary: "Turning statistical findings into briefs decision makers can act on.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 300, competencies: [["communication", 4], ["data_visualization", 3]], outcomes: ["Write a one-page policy brief from a dataset"] },
  { title: "Project Management for Survey Operations", summary: "Planning survey rounds, field logistics, risk and timeline management.", provider: "NSSTA", source: "nssta_tpac", level: "intermediate", minutes: 420, competencies: [["project_management", 3], ["decision_making", 2]], outcomes: ["Build a survey round plan with a risk register"] },
  { title: "Ethics and the Fundamental Principles of Official Statistics", summary: "Professional independence, impartiality and the UN Fundamental Principles.", provider: "NSSTA", source: "nssta_tpac", level: "beginner", minutes: 180, competencies: [["ethics", 3]], outcomes: ["Apply the Fundamental Principles to a real dilemma"] },
  { title: "Evidence-Based Decision Making", summary: "Reasoning under uncertainty and communicating confidence honestly.", provider: "LBSNAA", source: "igot", level: "intermediate", minutes: 300, competencies: [["decision_making", 3], ["communication", 2]], outcomes: ["Structure a decision under uncertainty"] },
  { title: "Change Management for Digital Adoption", summary: "Driving technology adoption in government offices without losing the field.", provider: "LBSNAA", source: "igot", level: "advanced", minutes: 360, competencies: [["change_management", 4], ["leadership", 3]], outcomes: ["Plan a rollout that field staff will actually adopt"] },
];

const moduleTitles = (title: string) => [
  `Introduction and context: ${title}`,
  "Core concepts and definitions",
  "Applied walkthrough with Indian data",
  "Hands-on exercise",
  "Common pitfalls and quality checks",
  "Knowledge check",
];

export const COURSES: Course[] = SEEDS.map((seed, i) => {
  const id = `course_${String(i + 1).padStart(3, "0")}`;
  const r = rng(hash(id));
  const moduleCount = intBetween(4, 6, r());
  const per = Math.round(seed.minutes / moduleCount);

  return validated(
    CourseSchema,
    {
      id,
      externalId: seed.source === "igot" ? `do_${hash(id) % 100000000}` : null,
      source: seed.source,
      title: seed.title,
      summary: seed.summary,
      description: `${seed.summary} This programme is aligned to the Competency Framework for Official Statistics (v2026.1) and contributes directly to the competencies listed below. It combines concept sessions with applied exercises on Indian statistical data, and closes with an assessment that updates your competency profile.`,
      provider: seed.provider,
      thumbnailUrl: null,
      durationMinutes: seed.minutes,
      level: seed.level,
      languages: r() > 0.45 ? ["en", "hi"] : ["en"],
      competencies: seed.competencies.map(([key, targetLevel]) => {
        const comp = COMPETENCY_BY_KEY[key];
        return {
          competencyKey: key,
          competencyName: comp?.name ?? key,
          domain: comp?.domain ?? "technical",
          targetLevel,
        };
      }),
      learningOutcomes: seed.outcomes,
      prerequisites: seed.prerequisites ?? [],
      modules: moduleTitles(seed.title)
        .slice(0, moduleCount)
        .map((title, order) => ({
          id: `${id}_m${order + 1}`,
          title,
          contentType:
            order === moduleCount - 1 ? "quiz" : order === 3 ? "lab" : order % 2 === 0 ? "video" : "document",
          durationMinutes: per,
          order,
        })),
      rating: roundTo(3.6 + r() * 1.3, 1),
      ratingCount: intBetween(40, 2400, r()),
      enrolledCount: intBetween(200, 18000, r()),
      externalUrl: seed.source === "igot" ? "https://igotkarmayogi.gov.in/" : null,
      updatedAt: daysFromNow(-intBetween(5, 300, r())),
    },
    `Course(${id})`,
  );
});

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));

/** Courses that advance a competency, best (lowest level jump) first. */
export const coursesForCompetency = (competencyKey: string): Course[] =>
  COURSES.filter((c) => c.competencies.some((x) => x.competencyKey === competencyKey)).sort(
    (a, b) =>
      (a.competencies.find((x) => x.competencyKey === competencyKey)?.targetLevel ?? 5) -
      (b.competencies.find((x) => x.competencyKey === competencyKey)?.targetLevel ?? 5),
  );

export const courseIdsForCompetency = (competencyKey: string): string[] =>
  coursesForCompetency(competencyKey).map((c) => c.id);

// --- NSSTA TPAC programmes ---------------------------------------------------

type ProgSeed = {
  code: string;
  title: string;
  description: string;
  mode: TrainingProgramme["mode"];
  venue: string | null;
  startsInDays: number;
  days: number;
  capacity: number;
  filled: number;
  eligibility: string;
  competencies: Array<[string, number]>;
};

const PROG_SEEDS: ProgSeed[] = [
  { code: "TPAC/2026/NA-07", title: "National Accounts Statistics — Advanced Compilation", description: "Two-week residential programme on SNA 2008 implementation, supply-use tables and constant-price estimation, recommended by TPAC for officers handling national accounts.", mode: "classroom", venue: "NSSTA, Greater Noida", startsInDays: 34, days: 12, capacity: 40, filled: 27, eligibility: "Deputy Director and above, or SSO with 5+ years in national accounts", competencies: [["national_accounts", 4], ["time_series", 3], ["industrial_statistics", 3]] },
  { code: "TPAC/2026/DS-12", title: "Data Science for Official Statistics", description: "Blended programme covering Python, machine learning and responsible AI adoption for statistical production.", mode: "blended", venue: "NSSTA, Greater Noida + online", startsInDays: 21, days: 15, capacity: 60, filled: 58, eligibility: "All statistical cadre officers with working knowledge of Python or R", competencies: [["python", 3], ["ai_ml", 3], ["big_data", 3], ["data_visualization", 3]] },
  { code: "TPAC/2026/QA-03", title: "Data Quality Assurance and NQAF Implementation", description: "Quality dimensions, editing and imputation strategy, and preparing quality declarations for statistical products.", mode: "online", venue: null, startsInDays: 9, days: 5, capacity: 120, filled: 71, eligibility: "Officers involved in survey processing or data validation", competencies: [["data_quality", 4], ["metadata_standards", 3]] },
  { code: "TPAC/2026/GIS-05", title: "Geospatial Analysis for Statistical Applications", description: "Hands-on QGIS programme covering frame geo-referencing, spatial joins and district-level thematic mapping.", mode: "classroom", venue: "Regional Office Chennai", startsInDays: 47, days: 6, capacity: 30, filled: 12, eligibility: "JSO and above, field or mapping responsibilities", competencies: [["gis", 3], ["data_visualization", 3]] },
  { code: "TPAC/2026/CY-02", title: "Cybersecurity and Data Privacy for Statistical Systems", description: "Secure microdata handling, statistical disclosure control and DPDP Act obligations.", mode: "online", venue: null, startsInDays: 15, days: 4, capacity: 200, filled: 143, eligibility: "All officers handling unit-level data", competencies: [["cybersecurity", 3], ["data_privacy", 4], ["ethics", 3]] },
  { code: "TPAC/2026/LD-09", title: "Leadership and Change Management for Senior Officers", description: "Leading digital transformation in statistical offices, with a focus on field-level adoption.", mode: "classroom", venue: "LBSNAA, Mussoorie", startsInDays: 62, days: 8, capacity: 25, filled: 25, eligibility: "Director and above", competencies: [["leadership", 4], ["change_management", 4], ["decision_making", 4]] },
  { code: "TPAC/2026/SU-11", title: "Survey Design and Questionnaire Development", description: "Designing instruments and sampling plans for state-level surveys.", mode: "blended", venue: "DES Maharashtra, Mumbai + online", startsInDays: -12, days: 10, capacity: 45, filled: 45, eligibility: "State DES officers with survey responsibilities", competencies: [["survey_design", 3], ["sampling_methods", 3]] },
];

export const PROGRAMMES: TrainingProgramme[] = PROG_SEEDS.map((seed, i) => {
  const status: TrainingProgramme["status"] =
    seed.startsInDays < -seed.days ? "completed"
      : seed.startsInDays < 0 ? "running"
      : seed.filled >= seed.capacity ? "closed"
      : seed.startsInDays <= 30 ? "open"
      : "upcoming";

  return validated(
    TrainingProgrammeSchema,
    {
      id: `prog_${String(i + 1).padStart(3, "0")}`,
      code: seed.code,
      title: seed.title,
      description: seed.description,
      organisedBy: "National Statistical Systems Training Academy (NSSTA)",
      mode: seed.mode,
      venue: seed.venue,
      startsAt: daysFromNow(seed.startsInDays),
      endsAt: daysFromNow(seed.startsInDays + seed.days),
      capacity: seed.capacity,
      seatsFilled: seed.filled,
      eligibility: seed.eligibility,
      competencies: seed.competencies.map(([key, targetLevel]) => {
        const comp = COMPETENCY_BY_KEY[key];
        return {
          competencyKey: key,
          competencyName: comp?.name ?? key,
          domain: comp?.domain ?? "technical",
          targetLevel,
        };
      }),
      nominationDeadline: daysFromNow(seed.startsInDays - 7),
      status,
    },
    `TrainingProgramme(${seed.code})`,
  );
});

export const PROGRAMME_BY_ID: Record<string, TrainingProgramme> = Object.fromEntries(
  PROGRAMMES.map((p) => [p.id, p]),
);
