import { CompetencyFrameworkSchema, type Competency, type CompetencyFramework } from "@/schemas";
import type { CompetencyDomain } from "@/schemas";
import { validated } from "./seed";

/**
 * The Official Statistics competency framework.
 * Competency keys are stable — everything in the platform joins on them.
 */

const descriptors = (name: string): string[] => [
  `No exposure to ${name}.`,
  `Aware of ${name} concepts and terminology.`,
  `Applies ${name} on routine tasks with guidance.`,
  `Works independently on ${name} in standard situations.`,
  `Designs ${name} solutions and reviews the work of others.`,
  `Sets institutional standards for ${name} and trains others.`,
];

const c = (
  key: string,
  name: string,
  domain: CompetencyDomain,
  description: string,
  weight: number,
): Competency => ({ key, name, domain, description, weight, levelDescriptors: descriptors(name) });

export const COMPETENCIES: Competency[] = [
  // --- Statistical ---------------------------------------------------------
  c("survey_design", "Survey Design", "statistical", "Designing household and establishment surveys: questionnaire design, frames, non-response strategy.", 1.0),
  c("sampling_methods", "Sampling", "statistical", "Probability sampling design, estimation, weighting and variance estimation.", 1.0),
  c("national_accounts", "National Accounts", "statistical", "GDP compilation, SNA 2008 concepts, supply-use tables and deflators.", 0.9),
  c("price_statistics", "Price Statistics", "statistical", "CPI and WPI construction, index number theory, price collection quality.", 0.85),
  c("labour_statistics", "Labour Statistics", "statistical", "PLFS concepts, employment-unemployment measurement, ICLS standards.", 0.8),
  c("agricultural_statistics", "Agricultural Statistics", "statistical", "Crop area and yield estimation, crop cutting experiments, agricultural census.", 0.75),
  c("industrial_statistics", "Industrial Statistics", "statistical", "ASI, IIP compilation, NIC classification and industrial frames.", 0.75),
  c("sdg_indicators", "SDG Indicators", "statistical", "National Indicator Framework, SDG reporting, disaggregation requirements.", 0.8),
  c("metadata_standards", "Metadata Standards", "statistical", "SDMX, DDI, data documentation and dissemination standards.", 0.7),
  c("data_quality", "Data Quality Frameworks", "statistical", "NQAF, editing and imputation, quality declarations and error profiling.", 0.95),
  c("time_series", "Time Series & Forecasting", "statistical", "Seasonal adjustment, trend estimation and short-term forecasting.", 0.7),

  // --- Technical -----------------------------------------------------------
  c("python", "Python", "technical", "Python for data processing, pandas, reproducible analysis pipelines.", 1.0),
  c("r_lang", "R", "technical", "R for statistical computing, survey package, tidyverse workflows.", 0.85),
  c("sql", "SQL", "technical", "Relational querying, joins, window functions and query performance.", 0.9),
  c("stata", "Stata", "technical", "Stata for survey estimation and microdata analysis.", 0.6),
  c("spss", "SPSS", "technical", "SPSS for tabulation and statistical testing.", 0.5),
  c("sas", "SAS", "technical", "SAS for large-scale data processing and reporting.", 0.5),
  c("gis", "GIS", "technical", "Spatial data handling, QGIS, geo-referencing survey frames and thematic mapping.", 0.8),
  c("data_visualization", "Data Visualization", "technical", "Chart selection, dashboard design and accessible statistical graphics.", 0.85),
  c("ai_ml", "AI / Machine Learning", "technical", "Supervised and unsupervised learning, model evaluation, responsible AI use in statistics.", 0.95),
  c("cloud_computing", "Cloud Computing", "technical", "Cloud storage and compute, containers, cost and scalability basics.", 0.85),
  c("apis_integration", "APIs & Integration", "technical", "REST APIs, authentication, data exchange between government systems.", 0.75),
  c("open_data", "Open Data", "technical", "Open data publishing, licensing, machine-readable formats and OGD platform.", 0.7),
  c("big_data", "Big Data Analytics", "technical", "Distributed processing, alternative data sources and scalable pipelines.", 0.8),

  // --- Digital governance --------------------------------------------------
  c("cybersecurity", "Cybersecurity", "digital_governance", "Threat awareness, secure handling of microdata, incident response basics.", 0.95),
  c("data_privacy", "Data Privacy", "digital_governance", "DPDP Act, statistical confidentiality, disclosure control and anonymisation.", 1.0),
  c("digital_signatures", "Digital Signatures", "digital_governance", "DSC/eSign usage, PKI concepts and authenticated official records.", 0.6),
  c("government_cloud", "Government Cloud", "digital_governance", "MeghRaj, empanelled cloud usage, data residency and compliance.", 0.7),
  c("dpi", "Digital Public Infrastructure", "digital_governance", "India Stack, interoperability, consent frameworks and registries.", 0.75),

  // --- Behavioural & managerial --------------------------------------------
  c("leadership", "Leadership", "behavioural", "Leading teams, setting direction and developing subordinates.", 0.8),
  c("communication", "Communication", "behavioural", "Communicating statistical findings to non-technical and policy audiences.", 0.9),
  c("project_management", "Project Management", "behavioural", "Planning survey rounds, managing timelines, risk and field logistics.", 0.85),
  c("ethics", "Ethics", "behavioural", "Professional ethics, statistical independence and the UN Fundamental Principles.", 0.9),
  c("decision_making", "Decision Making", "behavioural", "Evidence-based decisions under uncertainty and time pressure.", 0.8),
  c("change_management", "Change Management", "behavioural", "Driving technology adoption and process change in government offices.", 0.75),
];

export const COMPETENCY_BY_KEY: Record<string, Competency> = Object.fromEntries(
  COMPETENCIES.map((x) => [x.key, x]),
);

export const FRAMEWORK: CompetencyFramework = validated(
  CompetencyFrameworkSchema,
  {
    id: "fw_official_statistics_2026_1",
    version: "2026.1",
    name: "Competency Framework for Official Statistics",
    owner: "National Statistical Systems Training Academy (NSSTA)",
    isActive: true,
    competencies: COMPETENCIES,
    publishedAt: "2026-04-01T00:00:00.000Z",
  },
  "CompetencyFramework",
);

/**
 * FRAC role targets. Each role key maps to the required level per competency.
 * Anything not listed for a role defaults to REQUIRED_DEFAULT.
 */
export const REQUIRED_DEFAULT = 2;

export const ROLE_REQUIREMENTS: Record<string, { name: string; levels: Record<string, number> }> = {
  jso_field_survey: {
    name: "Junior Statistical Officer — Field Survey",
    levels: {
      survey_design: 3, sampling_methods: 3, data_quality: 3, labour_statistics: 3,
      python: 3, sql: 3, gis: 2, data_visualization: 3, ai_ml: 2, cloud_computing: 2,
      data_privacy: 3, cybersecurity: 2, communication: 3, project_management: 2, ethics: 3,
    },
  },
  sso_data_processing: {
    name: "Senior Statistical Officer — Data Processing",
    levels: {
      sampling_methods: 4, data_quality: 4, metadata_standards: 3, time_series: 3,
      python: 4, sql: 4, r_lang: 3, big_data: 3, ai_ml: 3, cloud_computing: 3, apis_integration: 3,
      data_privacy: 4, cybersecurity: 3, communication: 3, project_management: 3, ethics: 4,
    },
  },
  dd_national_accounts: {
    name: "Deputy Director — National Accounts",
    levels: {
      national_accounts: 5, price_statistics: 4, industrial_statistics: 4, data_quality: 4,
      time_series: 4, sdg_indicators: 3, metadata_standards: 3,
      python: 3, sql: 3, data_visualization: 4, ai_ml: 2,
      data_privacy: 3, dpi: 3, leadership: 4, communication: 4, decision_making: 4, ethics: 4,
      project_management: 4, change_management: 3,
    },
  },
  analyst_data_science: {
    name: "Data Analyst — Statistical Data Science",
    levels: {
      sampling_methods: 3, data_quality: 3, sdg_indicators: 3, time_series: 3,
      python: 4, r_lang: 4, sql: 4, ai_ml: 4, big_data: 4, cloud_computing: 3,
      data_visualization: 4, apis_integration: 3, open_data: 3, gis: 3,
      cybersecurity: 3, data_privacy: 4, communication: 3, ethics: 3,
    },
  },
  director_capacity_building: {
    name: "Director — Capacity Building",
    levels: {
      survey_design: 4, data_quality: 4, sdg_indicators: 4, metadata_standards: 3,
      ai_ml: 3, cloud_computing: 3, data_visualization: 3, open_data: 3,
      data_privacy: 4, cybersecurity: 3, government_cloud: 3, dpi: 3,
      leadership: 5, communication: 5, project_management: 4, decision_making: 5,
      ethics: 5, change_management: 4,
    },
  },
  platform_engineer: {
    name: "Platform Engineer — Statistical Systems",
    levels: {
      data_quality: 3, metadata_standards: 3,
      python: 4, sql: 4, apis_integration: 4, cloud_computing: 4, big_data: 4, ai_ml: 3,
      open_data: 3, data_visualization: 3,
      cybersecurity: 4, data_privacy: 4, government_cloud: 4, dpi: 3, digital_signatures: 3,
      project_management: 3, communication: 3, ethics: 3,
    },
  },
};

export const requiredLevelFor = (roleKey: string, competencyKey: string): number =>
  ROLE_REQUIREMENTS[roleKey]?.levels[competencyKey] ?? REQUIRED_DEFAULT;
