import {
  CertificateSchema,
  EnrollmentSchema,
  LearningPathSchema,
  LearningStatsSchema,
  RecommendationSchema,
  type Certificate,
  type Enrollment,
  type LearningPath,
  type LearningStats,
  type Recommendation,
} from "@/schemas";
import { COURSE_BY_ID, COURSES, coursesForCompetency } from "./courses";
import { buildSkillGaps } from "./profiles";
import { courseIdsForCompetency } from "./courses";
import { daysFromNow, hash, intBetween, roundTo, rng, validated } from "./seed";

const gapsFor = (userId: string) => buildSkillGaps(userId, courseIdsForCompetency);

/** Deterministic enrolments for a user, spread across statuses. */
export function buildEnrollments(userId: string): Enrollment[] {
  const gaps = gapsFor(userId);
  const targeted = gaps.slice(0, 8).flatMap((g) => g.recommendedCourseIds.slice(0, 1));
  const ids = [...new Set(targeted)].slice(0, 7);

  return ids.map((courseId, i) => {
    const course = COURSE_BY_ID[courseId];
    const r = rng(hash(`enrol-${userId}-${courseId}`));
    const status: Enrollment["status"] = i < 2 ? "completed" : i < 5 ? "in_progress" : "not_started";
    const progress = status === "completed" ? 100 : status === "in_progress" ? intBetween(15, 85, r()) : 0;
    const moduleCount = course?.modules.length ?? 5;
    const nextIndex = Math.min(moduleCount - 1, Math.floor((progress / 100) * moduleCount));

    return validated(
      EnrollmentSchema,
      {
        id: `enrol_${hash(`${userId}-${courseId}`) % 1000000}`,
        userId,
        kind: "course",
        refId: courseId,
        title: course?.title ?? "Course",
        thumbnailUrl: null,
        status,
        progressPercent: progress,
        resumeModuleId: status === "in_progress" ? (course?.modules[nextIndex]?.id ?? null) : null,
        minutesSpent: Math.round(((course?.durationMinutes ?? 300) * progress) / 100),
        isBookmarked: r() > 0.7,
        enrolledAt: daysFromNow(-intBetween(20, 180, r())),
        completedAt: status === "completed" ? daysFromNow(-intBetween(5, 60, r())) : null,
        dueAt: status === "in_progress" && r() > 0.5 ? daysFromNow(intBetween(5, 45, r())) : null,
      },
      `Enrollment(${courseId})`,
    );
  });
}

export function buildLearningStats(userId: string): LearningStats {
  const enrolments = buildEnrollments(userId);
  const r = rng(hash(`stats-${userId}`));
  const totalMinutes = enrolments.reduce((s, e) => s + e.minutesSpent, 0);

  return validated(
    LearningStatsSchema,
    {
      userId,
      hoursThisWeek: roundTo(intBetween(0, 7, r()) + r(), 1),
      hoursThisMonth: roundTo(intBetween(6, 26, r()) + r(), 1),
      hoursTotal: roundTo(totalMinutes / 60, 1),
      streakDays: intBetween(0, 21, r()),
      coursesCompleted: enrolments.filter((e) => e.status === "completed").length,
      coursesInProgress: enrolments.filter((e) => e.status === "in_progress").length,
      certificatesEarned: enrolments.filter((e) => e.status === "completed").length,
      competencyPointsGained: roundTo(1 + r() * 4, 1),
    },
    `LearningStats(${userId})`,
  );
}

export function buildCertificates(userId: string): Certificate[] {
  return buildEnrollments(userId)
    .filter((e) => e.status === "completed")
    .map((e) => {
      const course = COURSE_BY_ID[e.refId];
      return validated(
        CertificateSchema,
        {
          id: `cert_${hash(`${userId}-${e.refId}`) % 1000000}`,
          userId,
          title: e.title,
          issuedBy: course?.provider ?? "iGOT Karmayogi",
          issuedAt: e.completedAt ?? daysFromNow(-30),
          verificationCode: `KKY-${(hash(`${userId}-${e.refId}`) % 900000 + 100000).toString()}`,
          competencyKeys: course?.competencies.map((c) => c.competencyKey) ?? [],
          downloadUrl: null,
        },
        `Certificate(${e.refId})`,
      );
    });
}

/** Ranked next-best-actions, derived from the same gap ordering the gap page uses. */
export function buildRecommendations(userId: string): Recommendation[] {
  const gaps = gapsFor(userId);
  const enrolled = new Set(buildEnrollments(userId).map((e) => e.refId));

  const out: Recommendation[] = [];
  for (const gap of gaps) {
    const candidates = coursesForCompetency(gap.competencyKey).filter((c) => !enrolled.has(c.id));
    const course = candidates.find((c) => c.competencies.some((x) => x.competencyKey === gap.competencyKey && x.targetLevel > gap.currentLevel));
    if (!course) continue;

    const r = rng(hash(`rec-${userId}-${course.id}`));
    const reasonCodes: Recommendation["reasonCodes"] = ["closes_critical_gap", "role_requirement"];
    if (gap.domain === "technical") reasonCodes.push("emerging_technology");
    if (r() > 0.6) reasonCodes.push("peers_completed");

    out.push(
      validated(
        RecommendationSchema,
        {
          id: `rec_${hash(`${userId}-${course.id}`) % 1000000}`,
          kind: "course",
          refId: course.id,
          title: course.title,
          summary: course.summary,
          matchScore: roundTo(Math.min(99, 55 + gap.priorityScore * 0.42 + r() * 6), 0),
          reasonCodes,
          reasons: [
            `Closes your ${gap.severity} gap in ${gap.competencyName} (level ${gap.currentLevel} → ${gap.requiredLevel})`,
            `Required at level ${gap.requiredLevel} for your role`,
            ...(gap.domain === "technical" ? ["Emerging technology priority for the statistical system"] : []),
            ...(reasonCodes.includes("peers_completed") ? [`Completed by ${intBetween(12, 140, r())} officers in similar roles`] : []),
          ],
          competencyKeys: [gap.competencyKey],
          severity: gap.severity,
        },
        `Recommendation(${course.id})`,
      ),
    );
    if (out.length >= 8) break;
  }
  return out.sort((a, b) => b.matchScore - a.matchScore);
}

/** A sequenced pathway built from the user's top gaps. */
export function buildLearningPaths(userId: string): LearningPath[] {
  const gaps = gapsFor(userId).slice(0, 5);
  const enrolments = buildEnrollments(userId);
  const progressById = new Map(enrolments.map((e) => [e.refId, e]));

  const milestones: LearningPath["milestones"] = [];
  let order = 0;
  for (const gap of gaps) {
    const course = coursesForCompetency(gap.competencyKey)[0];
    if (!course) continue;
    const enrolment = progressById.get(course.id);
    const status: LearningPath["milestones"][number]["status"] =
      enrolment?.status === "completed" ? "completed"
        : enrolment?.status === "in_progress" ? "in_progress"
        : order === 0 || milestones.some((m) => m.status === "completed") ? "available"
        : "locked";

    milestones.push({
      id: `ms_${hash(`${userId}-${course.id}`) % 1000000}`,
      order: order++,
      kind: "course",
      refId: course.id,
      title: course.title,
      estimatedMinutes: course.durationMinutes,
      status,
      competencyKeys: [gap.competencyKey],
    });

    milestones.push({
      id: `ms_${hash(`${userId}-${course.id}-a`) % 1000000}`,
      order: order++,
      kind: "assessment",
      refId: `assess_${gap.competencyKey}`,
      title: `${gap.competencyName} — competency assessment`,
      estimatedMinutes: 30,
      status: status === "completed" ? "available" : "locked",
      competencyKeys: [gap.competencyKey],
    });
  }

  const completed = milestones.filter((m) => m.status === "completed").length;
  const totalMinutes = milestones.reduce((s, m) => s + m.estimatedMinutes, 0);

  return [
    validated(
      LearningPathSchema,
      {
        id: `path_${hash(userId) % 1000000}`,
        userId,
        title: "Close your priority competency gaps",
        rationale:
          "Built from your five highest-priority gaps, sequenced so each course is followed by an assessment that confirms the new level and updates your competency profile.",
        targetCompetencyKeys: gaps.map((g) => g.competencyKey),
        milestones,
        progressPercent: milestones.length ? roundTo((completed / milestones.length) * 100, 1) : 0,
        totalEstimatedMinutes: totalMinutes,
        estimatedCompletionAt: daysFromNow(Math.round(totalMinutes / 60 / 4) * 7),
        createdAt: daysFromNow(-45),
        updatedAt: daysFromNow(-2),
      },
      `LearningPath(${userId})`,
    ),
  ];
}

export const ALL_COURSE_IDS = COURSES.map((c) => c.id);
