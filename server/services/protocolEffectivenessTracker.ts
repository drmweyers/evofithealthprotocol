/**
 * Protocol Effectiveness Tracking Service
 * 
 * Tracks and analyzes protocol effectiveness through client progress correlation,
 * generates insights, and provides optimization recommendations.
 */

import { db } from '../db';
import { 
  protocolEffectiveness,
  protocolAnalytics,
  protocolAssignments,
  trainerHealthProtocols,
  progressMeasurements,
  customerGoals,
  type ProtocolEffectiveness as ProtocolEffectivenessType,
  type ProtocolAnalytics as ProtocolAnalyticsType,
  type InsertProtocolEffectiveness,
  type InsertProtocolAnalytics
} from '@shared/schema';
import { eq, and, desc, sql, avg, count, gte, lte } from 'drizzle-orm';

export interface EffectivenessMetrics {
  protocolId: string;
  protocolName: string;
  totalAssignments: number;
  completedAssignments: number;
  averageEffectiveness: number; // 0-100%
  averageCompletionRate: number; // 0-100%
  averageClientSatisfaction: number; // 1-5
  recommendationRate: number; // 0-100%
  
  // Demographic insights
  mostEffectiveAgeRange: { min: number; max: number; effectiveness: number } | null;
  commonSuccessFactors: string[];
  commonChallenges: string[];
  
  // Progress tracking
  averageWeightLoss?: number; // kg
  averageEnergyImprovement?: number; // 1-10 scale
  averageHealthMarkerImprovement?: number; // percentage
  
  // Time-based insights
  optimalDuration: number; // days
  dropoffWeek: number | null; // week when most people drop off
  
  lastUpdated: Date;
}

export interface ClientProgressUpdate {
  assignmentId: string;
  week: number;
  date: string;
  metrics: {
    weight?: number;
    energy?: number; // 1-10 scale
    adherence?: number; // 0-100%
    symptoms?: string[];
    improvements?: string[];
    challenges?: string[];
  };
  notes?: string;
}

export interface ProtocolOptimizationSuggestions {
  protocolId: string;
  protocolName: string;
  currentEffectiveness: number;
  suggestedImprovements: Array<{
    area: string;
    current: any;
    suggested: any;
    rationale: string;
    expectedImpact: 'low' | 'medium' | 'high';
    confidence: number; // 0-100%
  }>;
  dataQuality: {
    completeness: number; // 0-100%
    sampleSize: number;
    recency: number; // days since last data
  };
}

/**
 * Initialize effectiveness tracking for a new protocol assignment
 */
export async function initializeEffectivenessTracking(
  protocolId: string,
  assignmentId: string,
  customerId: string,
  baselineMetrics?: any
): Promise<ProtocolEffectivenessType> {
  try {
    const [tracking] = await db
      .insert(protocolEffectiveness)
      .values({
        protocolId,
        assignmentId,
        customerId,
        baselineMetrics: baselineMetrics || {},
        startDate: new Date(),
      })
      .returning();
    
    return tracking;
  } catch (error) {
    console.error('Error initializing effectiveness tracking:', error);
    throw new Error('Failed to initialize effectiveness tracking');
  }
}

/**
 * Record weekly progress for a protocol assignment
 */
export async function recordWeeklyProgress(
  update: ClientProgressUpdate
): Promise<ProtocolEffectivenessType> {
  try {
    // Get current tracking record
    const [tracking] = await db
      .select()
      .from(protocolEffectiveness)
      .where(eq(protocolEffectiveness.assignmentId, update.assignmentId))
      .limit(1);
    
    if (!tracking) {
      throw new Error('Effectiveness tracking not found for assignment');
    }
    
    // Update weekly progress
    const currentProgress = tracking.weeklyProgress || [];
    
    // Remove existing entry for this week if it exists
    const filteredProgress = currentProgress.filter((p: any) => p.week !== update.week);
    
    // Add new progress entry
    const newProgress = [
      ...filteredProgress,
      {
        week: update.week,
        date: update.date,
        metrics: update.metrics,
        notes: update.notes || '',
        adherence: update.metrics.adherence || 0
      }
    ].sort((a, b) => a.week - b.week);
    
    // Calculate current effectiveness based on progress
    const effectiveness = calculateCurrentEffectiveness(newProgress, tracking.baselineMetrics);
    
    const [updatedTracking] = await db
      .update(protocolEffectiveness)
      .set({
        weeklyProgress: newProgress,
        overallEffectiveness: effectiveness,
        updatedAt: new Date()
      })
      .where(eq(protocolEffectiveness.assignmentId, update.assignmentId))
      .returning();
    
    return updatedTracking;
  } catch (error) {
    console.error('Error recording weekly progress:', error);
    throw new Error('Failed to record weekly progress');
  }
}

/**
 * Complete protocol effectiveness tracking
 */
export async function completeEffectivenessTracking(
  assignmentId: string,
  finalMetrics: any,
  clientSatisfaction: number,
  wouldRecommend: boolean,
  goalsAchieved: number,
  totalGoals: number
): Promise<ProtocolEffectivenessType> {
  try {
    const [tracking] = await db
      .select()
      .from(protocolEffectiveness)
      .where(eq(protocolEffectiveness.assignmentId, assignmentId))
      .limit(1);
    
    if (!tracking) {
      throw new Error('Effectiveness tracking not found');
    }
    
    // Calculate final effectiveness
    const weeklyProgress = tracking.weeklyProgress || [];
    const finalEffectiveness = calculateFinalEffectiveness(
      weeklyProgress,
      tracking.baselineMetrics,
      finalMetrics,
      clientSatisfaction,
      goalsAchieved,
      totalGoals
    );
    
    const completionRate = (goalsAchieved / Math.max(totalGoals, 1)) * 100;
    
    // Analyze success factors and challenges
    const analysis = analyzeProtocolOutcome(weeklyProgress, finalMetrics, clientSatisfaction);
    
    const [completedTracking] = await db
      .update(protocolEffectiveness)
      .set({
        finalMetrics,
        overallEffectiveness: finalEffectiveness,
        clientSatisfaction,
        wouldRecommend,
        goalsAchieved,
        totalGoals,
        completionRate,
        successFactors: analysis.successFactors,
        challenges: analysis.challenges,
        endDate: new Date(),
        isCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(protocolEffectiveness.assignmentId, assignmentId))
      .returning();
    
    // Update protocol analytics
    await updateProtocolAnalytics(tracking.protocolId);
    
    return completedTracking;
  } catch (error) {
    console.error('Error completing effectiveness tracking:', error);
    throw new Error('Failed to complete effectiveness tracking');
  }
}

/**
 * Get effectiveness metrics for a specific protocol
 */
export async function getProtocolEffectivenessMetrics(
  protocolId: string
): Promise<EffectivenessMetrics> {
  try {
    // Get protocol details
    const [protocol] = await db
      .select()
      .from(trainerHealthProtocols)
      .where(eq(trainerHealthProtocols.id, protocolId))
      .limit(1);
    
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Get analytics
    const [analytics] = await db
      .select()
      .from(protocolAnalytics)
      .where(eq(protocolAnalytics.protocolId, protocolId))
      .limit(1);
    
    // Get completed effectiveness records
    const completedRecords = await db
      .select()
      .from(protocolEffectiveness)
      .where(
        and(
          eq(protocolEffectiveness.protocolId, protocolId),
          eq(protocolEffectiveness.isCompleted, true)
        )
      );
    
    // Calculate metrics
    const totalAssignments = analytics?.totalAssignments || 0;
    const completedAssignments = analytics?.completedAssignments || 0;
    const averageEffectiveness = analytics?.averageEffectiveness ? Number(analytics.averageEffectiveness) : 0;
    const averageCompletionRate = analytics?.averageCompletionRate ? Number(analytics.averageCompletionRate) : 0;
    const averageSatisfaction = analytics?.averageSatisfaction ? Number(analytics.averageSatisfaction) : 0;
    const recommendationRate = analytics?.recommendationRate ? Number(analytics.recommendationRate) : 0;
    
    // Analyze demographic effectiveness (simplified)
    const mostEffectiveAgeRange = await analyzeMostEffectiveAgeRange(protocolId);
    
    // Get optimization insights
    const optimizationInsights = await getOptimizationInsights(protocolId);
    
    return {
      protocolId,
      protocolName: protocol.name,
      totalAssignments,
      completedAssignments,
      averageEffectiveness,
      averageCompletionRate,
      averageClientSatisfaction: averageSatisfaction,
      recommendationRate,
      mostEffectiveAgeRange,
      commonSuccessFactors: analytics?.commonSuccessFactors || [],
      commonChallenges: analytics?.commonChallenges || [],
      optimalDuration: protocol.duration,
      dropoffWeek: await findDropoffWeek(protocolId),
      lastUpdated: analytics?.lastCalculated || new Date()
    };
  } catch (error) {
    console.error('Error getting protocol effectiveness metrics:', error);
    throw new Error('Failed to get protocol effectiveness metrics');
  }
}

/**
 * Generate optimization suggestions for a protocol
 */
export async function getProtocolOptimizationSuggestions(
  protocolId: string
): Promise<ProtocolOptimizationSuggestions> {
  try {
    const metrics = await getProtocolEffectivenessMetrics(protocolId);
    const [protocol] = await db
      .select()
      .from(trainerHealthProtocols)
      .where(eq(trainerHealthProtocols.id, protocolId))
      .limit(1);
    
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    const suggestions: any[] = [];
    
    // Analyze completion rates
    if (metrics.averageCompletionRate < 70) {
      suggestions.push({
        area: 'Duration',
        current: protocol.duration,
        suggested: Math.max(14, Math.floor(protocol.duration * 0.7)),
        rationale: 'Low completion rate suggests protocol may be too long',
        expectedImpact: 'high' as const,
        confidence: 85
      });
    }
    
    // Analyze effectiveness
    if (metrics.averageEffectiveness < 60) {
      suggestions.push({
        area: 'Intensity',
        current: protocol.intensity,
        suggested: protocol.intensity === 'intensive' ? 'moderate' : 'gentle',
        rationale: 'Low effectiveness may indicate intensity is too high for target audience',
        expectedImpact: 'medium' as const,
        confidence: 70
      });
    }
    
    // Analyze satisfaction
    if (metrics.averageClientSatisfaction < 3.5) {
      suggestions.push({
        area: 'User Experience',
        current: 'Current approach',
        suggested: 'Add more flexibility and personalization options',
        rationale: 'Low satisfaction scores suggest need for better user experience',
        expectedImpact: 'high' as const,
        confidence: 80
      });
    }
    
    // Analyze common challenges
    if (metrics.commonChallenges.includes('meal prep difficulty')) {
      suggestions.push({
        area: 'Meal Planning',
        current: 'Complex meal plans',
        suggested: 'Simplified, batch-prep friendly meals',
        rationale: 'Common challenge indicates meal preparation complexity',
        expectedImpact: 'medium' as const,
        confidence: 75
      });
    }
    
    const dataQuality = {
      completeness: Math.min(100, (metrics.completedAssignments / Math.max(metrics.totalAssignments, 1)) * 100),
      sampleSize: metrics.completedAssignments,
      recency: Math.floor((Date.now() - metrics.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    };
    
    return {
      protocolId,
      protocolName: metrics.protocolName,
      currentEffectiveness: metrics.averageEffectiveness,
      suggestedImprovements: suggestions,
      dataQuality
    };
  } catch (error) {
    console.error('Error getting optimization suggestions:', error);
    throw new Error('Failed to get optimization suggestions');
  }
}

/**
 * Update protocol analytics (run periodically or after completions)
 */
async function updateProtocolAnalytics(protocolId: string): Promise<void> {
  try {
    // Get all completed effectiveness records
    const completedRecords = await db
      .select()
      .from(protocolEffectiveness)
      .where(
        and(
          eq(protocolEffectiveness.protocolId, protocolId),
          eq(protocolEffectiveness.isCompleted, true)
        )
      );
    
    // Get assignment counts
    const assignmentCounts = await db
      .select({
        total: count(),
        completed: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
        active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`
      })
      .from(protocolAssignments)
      .where(eq(protocolAssignments.protocolId, protocolId));
    
    const counts = assignmentCounts[0] || { total: 0, completed: 0, active: 0 };
    
    if (completedRecords.length === 0) {
      return; // No completed records to analyze
    }
    
    // Calculate averages
    const avgEffectiveness = completedRecords.reduce((sum, r) => 
      sum + (Number(r.overallEffectiveness) || 0), 0) / completedRecords.length;
    
    const avgSatisfaction = completedRecords
      .filter(r => r.clientSatisfaction)
      .reduce((sum, r) => sum + (r.clientSatisfaction || 0), 0) / 
      completedRecords.filter(r => r.clientSatisfaction).length || 0;
    
    const avgCompletionRate = completedRecords.reduce((sum, r) => 
      sum + (Number(r.completionRate) || 0), 0) / completedRecords.length;
    
    const recommendationRate = (completedRecords.filter(r => r.wouldRecommend).length / 
      completedRecords.length) * 100;
    
    // Extract common success factors and challenges
    const allSuccessFactors = completedRecords.flatMap(r => r.successFactors || []);
    const allChallenges = completedRecords.flatMap(r => r.challenges || []);
    
    const commonSuccessFactors = getTopFactors(allSuccessFactors, 5);
    const commonChallenges = getTopFactors(allChallenges, 5);
    
    // Upsert analytics record
    await db
      .insert(protocolAnalytics)
      .values({
        protocolId,
        totalAssignments: counts.total,
        activeAssignments: counts.active,
        completedAssignments: counts.completed,
        averageEffectiveness: avgEffectiveness,
        averageSatisfaction: avgSatisfaction,
        averageCompletionRate: avgCompletionRate,
        recommendationRate,
        commonSuccessFactors,
        commonChallenges,
        dataPoints: completedRecords.length,
        lastCalculated: new Date()
      })
      .onConflictDoUpdate({
        target: protocolAnalytics.protocolId,
        set: {
          totalAssignments: counts.total,
          activeAssignments: counts.active,
          completedAssignments: counts.completed,
          averageEffectiveness: avgEffectiveness,
          averageSatisfaction: avgSatisfaction,
          averageCompletionRate: avgCompletionRate,
          recommendationRate,
          commonSuccessFactors,
          commonChallenges,
          dataPoints: completedRecords.length,
          lastCalculated: new Date()
        }
      });
    
  } catch (error) {
    console.error('Error updating protocol analytics:', error);
    // Don't throw here to avoid disrupting completion flow
  }
}

/**
 * Calculate current effectiveness based on progress
 */
function calculateCurrentEffectiveness(weeklyProgress: any[], baselineMetrics: any): number {
  if (weeklyProgress.length === 0) return 0;
  
  const latestWeek = weeklyProgress[weeklyProgress.length - 1];
  let effectiveness = 0;
  
  // Base effectiveness on adherence
  effectiveness += (latestWeek.adherence || 0) * 0.4;
  
  // Factor in energy improvements
  if (latestWeek.metrics.energy && baselineMetrics.energy) {
    const energyImprovement = ((latestWeek.metrics.energy - baselineMetrics.energy) / 10) * 100;
    effectiveness += Math.max(0, energyImprovement) * 0.3;
  }
  
  // Factor in positive improvements vs challenges
  const improvements = latestWeek.metrics.improvements?.length || 0;
  const challenges = latestWeek.metrics.challenges?.length || 0;
  const improvementScore = Math.max(0, (improvements - challenges) * 10);
  effectiveness += Math.min(improvementScore, 30) * 0.3;
  
  return Math.min(100, Math.max(0, effectiveness));
}

/**
 * Calculate final effectiveness
 */
function calculateFinalEffectiveness(
  weeklyProgress: any[],
  baselineMetrics: any,
  finalMetrics: any,
  clientSatisfaction: number,
  goalsAchieved: number,
  totalGoals: number
): number {
  let effectiveness = 0;
  
  // Goal achievement (40% weight)
  const goalAchievementRate = (goalsAchieved / Math.max(totalGoals, 1)) * 100;
  effectiveness += goalAchievementRate * 0.4;
  
  // Client satisfaction (30% weight)
  effectiveness += ((clientSatisfaction - 1) / 4) * 100 * 0.3;
  
  // Progress consistency (20% weight)
  const avgAdherence = weeklyProgress.reduce((sum, week) => sum + (week.adherence || 0), 0) / 
    Math.max(weeklyProgress.length, 1);
  effectiveness += avgAdherence * 0.2;
  
  // Objective improvements (10% weight)
  const objectiveScore = calculateObjectiveImprovements(baselineMetrics, finalMetrics);
  effectiveness += objectiveScore * 0.1;
  
  return Math.min(100, Math.max(0, effectiveness));
}

/**
 * Calculate objective improvements from metrics
 */
function calculateObjectiveImprovements(baseline: any, final: any): number {
  let score = 0;
  let metrics = 0;
  
  // Weight loss improvement
  if (baseline.weight && final.weight) {
    const weightLoss = baseline.weight - final.weight;
    if (weightLoss > 0) {
      score += Math.min(100, (weightLoss / baseline.weight) * 1000); // Max 10% weight loss = 100 points
      metrics++;
    }
  }
  
  // Energy improvement
  if (baseline.energy && final.energy) {
    const energyGain = final.energy - baseline.energy;
    if (energyGain > 0) {
      score += (energyGain / 10) * 100; // Max improvement from 0 to 10 = 100 points
      metrics++;
    }
  }
  
  return metrics > 0 ? score / metrics : 50; // Default neutral score
}

/**
 * Analyze protocol outcome for insights
 */
function analyzeProtocolOutcome(
  weeklyProgress: any[],
  finalMetrics: any,
  clientSatisfaction: number
): {
  successFactors: string[];
  challenges: string[];
} {
  const successFactors: string[] = [];
  const challenges: string[] = [];
  
  // Analyze adherence patterns
  const avgAdherence = weeklyProgress.reduce((sum, week) => sum + (week.adherence || 0), 0) / 
    Math.max(weeklyProgress.length, 1);
  
  if (avgAdherence > 80) {
    successFactors.push('High protocol adherence');
  } else if (avgAdherence < 50) {
    challenges.push('Low protocol adherence');
  }
  
  // Analyze satisfaction
  if (clientSatisfaction >= 4) {
    successFactors.push('High client satisfaction');
  } else if (clientSatisfaction <= 2) {
    challenges.push('Low client satisfaction');
  }
  
  // Analyze common patterns from weekly notes
  const allImprovements = weeklyProgress.flatMap(week => week.metrics.improvements || []);
  const allChallenges = weeklyProgress.flatMap(week => week.metrics.challenges || []);
  
  if (allImprovements.length > allChallenges.length) {
    successFactors.push('More improvements than challenges reported');
  }
  
  return { successFactors, challenges };
}

/**
 * Helper functions
 */
function getTopFactors(factors: string[], limit: number): string[] {
  const counts = factors.reduce((acc, factor) => {
    acc[factor] = (acc[factor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([factor]) => factor);
}

async function analyzeMostEffectiveAgeRange(protocolId: string): Promise<{ min: number; max: number; effectiveness: number } | null> {
  // Simplified implementation - would need more complex demographic analysis
  return null;
}

async function findDropoffWeek(protocolId: string): Promise<number | null> {
  // Analyze weekly progress to find common dropout points
  return null;
}

async function getOptimizationInsights(protocolId: string): Promise<any> {
  // Additional insights for optimization
  return {};
}