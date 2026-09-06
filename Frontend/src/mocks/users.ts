import {
  OfficialProfileSchema,
  UserSchema,
  type OfficialProfile,
  type User,
} from "@/schemas";
import { daysFromNow, hash, intBetween, pick, rng, validated } from "./seed";

/**
 * Demo accounts — one per role, so the whole app can be walked through end to end.
 * The Clerk user id is the join key; replace these ids with real Clerk ids when
 * the demo accounts are created.
 */

export const DEMO_USER_IDS = {
  employee: "user_demo_employee_priya",
  administrator: "user_demo_admin_rao",
  engineer: "user_demo_engineer_aditi",
} as const;

export const USERS: User[] = [
  validated(UserSchema, {
    id: DEMO_USER_IDS.employee,
    email: "priya.sharma@mospi.gov.in",
    fullName: "Priya Sharma",
    avatarUrl: null,
    role: "employee",
    department: "MoSPI — National Statistical Office",
    designation: "Junior Statistical Officer",
    preferredLanguage: "en",
    isProfileComplete: true,
    createdAt: daysFromNow(-420),
  }, "User(employee)"),
  validated(UserSchema, {
    id: DEMO_USER_IDS.administrator,
    email: "s.rao@nssta.gov.in",
    fullName: "Suresh Rao",
    avatarUrl: null,
    role: "administrator",
    department: "NSSTA — Capacity Building Division",
    designation: "Deputy Director (Training)",
    preferredLanguage: "en",
    isProfileComplete: true,
    createdAt: daysFromNow(-980),
  }, "User(administrator)"),
  validated(UserSchema, {
    id: DEMO_USER_IDS.engineer,
    email: "aditi.menon@mospi.gov.in",
    fullName: "Aditi Menon",
    avatarUrl: null,
    role: "engineer",
    department: "MoSPI — Data Informatics & Innovation Division",
    designation: "Platform Engineer",
    preferredLanguage: "en",
    isProfileComplete: true,
    createdAt: daysFromNow(-300),
  }, "User(engineer)"),
];

export const USER_BY_ID: Record<string, User> = Object.fromEntries(USERS.map((u) => [u.id, u]));

export const PROFILES: Record<string, OfficialProfile> = {
  [DEMO_USER_IDS.employee]: validated(OfficialProfileSchema, {
    userId: DEMO_USER_IDS.employee,
    employeeCode: "NSO/FOD/2019/4471",
    cadre: "Subordinate Statistical Service (SSS)",
    department: "MoSPI — National Statistical Office",
    office: "Field Operations Division, Regional Office Nagpur",
    designation: "Junior Statistical Officer",
    roleKey: "jso_field_survey",
    currentAssignment: "PLFS 2026 field supervision and data validation, Vidarbha region",
    yearsOfExperience: 6,
    dateOfJoining: daysFromNow(-2190),
    qualifications: [
      { degree: "M.Sc. Statistics", institution: "Savitribai Phule Pune University", yearOfCompletion: 2018, specialization: "Sampling Theory" },
      { degree: "B.Sc. Mathematics", institution: "RTM Nagpur University", yearOfCompletion: 2016, specialization: null },
    ],
    priorTrainings: [
      { id: "pt_1", title: "Foundation Course on Official Statistics", provider: "NSSTA", completedAt: daysFromNow(-1850), durationHours: 120, competencyKeys: ["survey_design", "sampling_methods", "ethics"] },
      { id: "pt_2", title: "PLFS Field Procedures and Quality Control", provider: "NSSTA", completedAt: daysFromNow(-620), durationHours: 40, competencyKeys: ["labour_statistics", "data_quality"] },
      { id: "pt_3", title: "Introduction to Data Analysis with Excel", provider: "iGOT Karmayogi", completedAt: daysFromNow(-240), durationHours: 12, competencyKeys: ["data_visualization"] },
    ],
    updatedAt: daysFromNow(-14),
  }, "OfficialProfile(employee)"),

  [DEMO_USER_IDS.administrator]: validated(OfficialProfileSchema, {
    userId: DEMO_USER_IDS.administrator,
    employeeCode: "NSSTA/CBD/2011/0182",
    cadre: "Indian Statistical Service (ISS)",
    department: "NSSTA — Capacity Building Division",
    office: "National Statistical Systems Training Academy, Greater Noida",
    designation: "Deputy Director (Training)",
    roleKey: "director_capacity_building",
    currentAssignment: "TPAC secretariat — annual training calendar and nominations",
    yearsOfExperience: 15,
    dateOfJoining: daysFromNow(-5480),
    qualifications: [
      { degree: "M.Stat.", institution: "Indian Statistical Institute, Kolkata", yearOfCompletion: 2009, specialization: "Applied Statistics" },
    ],
    priorTrainings: [
      { id: "pt_4", title: "Advanced Leadership Development Programme", provider: "LBSNAA", completedAt: daysFromNow(-900), durationHours: 80, competencyKeys: ["leadership", "change_management"] },
      { id: "pt_5", title: "Results Framework and Training Evaluation", provider: "NSSTA", completedAt: daysFromNow(-400), durationHours: 32, competencyKeys: ["project_management", "decision_making"] },
    ],
    updatedAt: daysFromNow(-30),
  }, "OfficialProfile(administrator)"),

  [DEMO_USER_IDS.engineer]: validated(OfficialProfileSchema, {
    userId: DEMO_USER_IDS.engineer,
    employeeCode: "MoSPI/DIID/2023/0091",
    cadre: null,
    department: "MoSPI — Data Informatics & Innovation Division",
    office: "Sardar Patel Bhawan, New Delhi",
    designation: "Platform Engineer",
    roleKey: "platform_engineer",
    currentAssignment: "iGOT integration and statistical data platform engineering",
    yearsOfExperience: 8,
    dateOfJoining: daysFromNow(-820),
    qualifications: [
      { degree: "B.Tech. Computer Science", institution: "NIT Calicut", yearOfCompletion: 2017, specialization: null },
    ],
    priorTrainings: [
      { id: "pt_6", title: "Secure Coding for Government Applications", provider: "NIC", completedAt: daysFromNow(-180), durationHours: 24, competencyKeys: ["cybersecurity", "data_privacy"] },
    ],
    updatedAt: daysFromNow(-7),
  }, "OfficialProfile(engineer)"),
};

/** Resolve the literal "me" that every /:userId route accepts. */
export const resolveUserId = (userId: string, currentUserId: string): string =>
  userId === "me" ? currentUserId : userId;

// --- Synthetic workforce, for the administrator views ------------------------

const FIRST = ["Anil", "Meera", "Rohit", "Kavita", "Sanjay", "Deepa", "Arjun", "Nisha", "Vikram", "Sunita", "Rajesh", "Fatima", "Ganesh", "Lakshmi", "Imran", "Pooja", "Tarun", "Rekha", "Manoj", "Shreya"] as const;
const LAST = ["Kumar", "Patil", "Iyer", "Banerjee", "Reddy", "Joshi", "Nair", "Singh", "Das", "Verma", "Chauhan", "Pillai", "Ghosh", "Mishra", "Rathore"] as const;

export const DEPARTMENTS = [
  "MoSPI — National Statistical Office",
  "MoSPI — Data Informatics & Innovation Division",
  "NSSTA — Capacity Building Division",
  "DES — Government of Maharashtra",
  "DES — Government of Tamil Nadu",
  "DES — Government of Assam",
] as const;

export const DESIGNATIONS = [
  { title: "Junior Statistical Officer", roleKey: "jso_field_survey" },
  { title: "Senior Statistical Officer", roleKey: "sso_data_processing" },
  { title: "Deputy Director", roleKey: "dd_national_accounts" },
  { title: "Data Analyst", roleKey: "analyst_data_science" },
  { title: "Director", roleKey: "director_capacity_building" },
] as const;

const OFFICES = ["Regional Office Nagpur", "Regional Office Chennai", "Regional Office Guwahati", "Sardar Patel Bhawan, New Delhi", "NSSTA, Greater Noida", "Sub-Regional Office Pune"] as const;

export type SyntheticOfficial = {
  userId: string;
  fullName: string;
  designation: string;
  roleKey: string;
  department: string;
  office: string;
};

/** 240 deterministic officials. Same list on the server and the client. */
export const WORKFORCE: SyntheticOfficial[] = Array.from({ length: 240 }, (_, i) => {
  const r = rng(hash(`official-${i}`));
  const first = pick(FIRST, r());
  const last = pick(LAST, r());
  const designation = pick(DESIGNATIONS, r());
  return {
    userId: `user_wf_${String(i).padStart(3, "0")}`,
    fullName: `${first} ${last}`,
    designation: designation.title,
    roleKey: designation.roleKey,
    department: pick(DEPARTMENTS, r()),
    office: pick(OFFICES, r()),
  };
});

/** Include the demo employee so admin drill-down lands on a rich profile. */
export const ALL_OFFICIALS: SyntheticOfficial[] = [
  {
    userId: DEMO_USER_IDS.employee,
    fullName: "Priya Sharma",
    designation: "Junior Statistical Officer",
    roleKey: "jso_field_survey",
    department: "MoSPI — National Statistical Office",
    office: "Field Operations Division, Regional Office Nagpur",
  },
  ...WORKFORCE,
];

export const officialById = (userId: string): SyntheticOfficial | undefined =>
  ALL_OFFICIALS.find((o) => o.userId === userId);

export const yearsOfExperienceFor = (userId: string): number =>
  intBetween(1, 28, rng(hash(`exp-${userId}`))());
