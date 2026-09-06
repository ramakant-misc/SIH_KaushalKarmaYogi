import {
  CompetencyProfileSchema,
  SkillGapSchema,
  type CompetencyAssessmentRecord,
  type CompetencyDomain,
  type CompetencyProfile,
  type Evidence,
  type GapSeverity,
  type SkillGap,
} from "@/schemas";
import { COMPETENCIES, requiredLevelFor } from "./competencies";
import { daysFromNow, hash, intBetween, roundTo, rng, validated } from "./seed";
import { officialById } from "./users";

/**
 * Generates a competency profile for any user id, deterministically.
 *
 * The real engine derives current levels from assessments, completed courses,
 * prior trainings and experience. This fixture reproduces the same SHAPE — most
 * importantly the evidence trail and confidence, because the UI's job is to
 * explain *why* someone is at a level, not just assert it.
 */

const DOMAINS: CompetencyDomain[] = ["statistical", "technical", "digital_governance", "behavioural"];

const evidenceFor = (
  competencyKey: string,
  level: number,
  r: () => number,
): Evidence[] => {
  const out: Evidence[] = [];
  out.push({
    source: "self_assessment",
    label: `Self-declared as ${["None", "Awareness", "Working", "Practitioner", "Advanced", "Expert"][level]} during onboarding`,
    contributedAt: daysFromNow(-intBetween(200, 400, r())),
    weight: 0.25,
  });
  if (level >= 2) {
    out.push({
      source: "experience",
      label: `${intBetween(2, 9, r())} years of field/desk work touching this competency`,
      contributedAt: daysFromNow(-intBetween(30, 200, r())),
      weight: 0.35,
    });
  }
  if (level >= 3) {
    out.push({
      source: "assessment_score",
      label: `Scored ${intBetween(62, 94, r())}% on the ${competencyKey.replace(/_/g, " ")} assessment`,
      contributedAt: daysFromNow(-intBetween(10, 120, r())),
      weight: 0.75,
    });
  }
  if (level >= 4) {
    out.push({
      source: "course_completion",
      label: "Completed an advanced iGOT course in this area",
      contributedAt: daysFromNow(-intBetween(20, 150, r())),
      weight: 0.6,
    });
  }
  return out;
};

const historyFor = (level: number, r: () => number) => {
  const points = 4;
  return Array.from({ length: points }, (_, i) => {
    const stepsBack = points - 1 - i;
    const past = Math.max(0, level - (stepsBack > 0 && r() > 0.45 ? 1 : 0) - (stepsBack > 1 ? 1 : 0));
    return { at: daysFromNow(-(stepsBack + 1) * 90), level: Math.min(level, past) };
  });
};

export function buildCompetencyProfile(userId: string): CompetencyProfile {
  const roleKey = officialById(userId)?.roleKey ?? "jso_field_survey";
  const seed = hash(`profile-${userId}`);

  const records: CompetencyAssessmentRecord[] = COMPETENCIES.map((comp, index) => {
    const r = rng(seed + index * 7919);
    const required = requiredLevelFor(roleKey, comp.key);

    // Most officials sit a little below requirement, with genuine spread.
    const roll = r();
    const offset = roll < 0.18 ? 1 : roll < 0.42 ? 0 : roll < 0.72 ? -1 : roll < 0.92 ? -2 : -3;
    const current = Math.max(0, Math.min(5, required + offset));

    // Confidence is low when the only evidence is self-declared.
    const hasAssessment = current >= 3;
    const confidence = roundTo(hasAssessment ? 0.6 + r() * 0.35 : 0.2 + r() * 0.35, 2);

    return {
      competencyKey: comp.key,
      competencyName: comp.name,
      domain: comp.domain,
      currentLevel: current,
      requiredLevel: required,
      confidence,
      evidence: evidenceFor(comp.key, current, r),
      lastAssessedAt: hasAssessment ? daysFromNow(-intBetween(10, 150, r())) : null,
      history: historyFor(current, r),
    };
  });

  const domainScores = DOMAINS.map((domain) => {
    const inDomain = records.filter((x) => x.domain === domain);
    const avgCurrent = inDomain.reduce((s, x) => s + x.currentLevel, 0) / inDomain.length;
    const avgRequired = inDomain.reduce((s, x) => s + x.requiredLevel, 0) / inDomain.length;
    return {
      domain,
      score: roundTo(Math.min(100, (avgCurrent / Math.max(avgRequired, 1)) * 100), 1),
      averageCurrentLevel: roundTo(avgCurrent, 2),
      averageRequiredLevel: roundTo(avgRequired, 2),
    };
  });

  const overallScore = roundTo(
    domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length,
    1,
  );

  return validated(
    CompetencyProfileSchema,
    {
      userId,
      frameworkVersion: "2026.1",
      overallScore,
      domainScores,
      records,
      computedAt: daysFromNow(-1),
    },
    `CompetencyProfile(${userId})`,
  );
}

const severityFor = (gap: number, criticality: number): GapSeverity => {
  const weighted = gap * (0.6 + criticality * 0.4);
  if (weighted >= 2.6) return "critical";
  if (weighted >= 1.8) return "high";
  if (weighted >= 1) return "moderate";
  return "low";
};

/**
 * Ranked gaps. Ordering is computed here, exactly once, so the dashboard, the
 * gap page and admin reports all agree — the real backend must do the same.
 */
export function buildSkillGaps(userId: string, courseIdsFor: (key: string) => string[]): SkillGap[] {
  const profile = buildCompetencyProfile(userId);

  return profile.records
    .filter((rec) => rec.requiredLevel > rec.currentLevel)
    .map((rec, index) => {
      const comp = COMPETENCIES.find((c) => c.key === rec.competencyKey);
      const weight = comp?.weight ?? 0.5;
      const criticality = 0.5 + (hash(`crit-${rec.competencyKey}`) % 50) / 100;
      const gap = rec.requiredLevel - rec.currentLevel;
      const r = rng(hash(`gap-${userId}-${index}`));

      return validated(
        SkillGapSchema,
        {
          competencyKey: rec.competencyKey,
          competencyName: rec.competencyName,
          domain: rec.domain,
          currentLevel: rec.currentLevel,
          requiredLevel: rec.requiredLevel,
          gap,
          severity: severityFor(gap, criticality),
          priorityScore: roundTo(Math.min(100, (gap / 5) * weight * criticality * 100 * 2.2), 1),
          estimatedHoursToClose: gap * intBetween(6, 14, r()),
          recommendedCourseIds: courseIdsFor(rec.competencyKey).slice(0, 3),
        },
        `SkillGap(${rec.competencyKey})`,
      );
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
