import { db } from '../storage/db';
import { TopicMetadata, KnowledgeNode, ProgressState, Flashcard, Achievement } from '../types';

/**
 * DALOS Learning Intelligence Engine & Progress Management Services
 * Operates offline-first on IndexedDB tables
 */
export class LearningEngine {
  
  /**
   * Validates if a user is eligible to study a topic based on prerequisites
   */
  static async isTopicUnlocked(topicId: string): Promise<boolean> {
    const topic = await db.topics.get(topicId);
    if (!topic) return false;
    if (topic.prerequisites.length === 0) return true;

    for (const prereqId of topic.prerequisites) {
      const kgNode = await db.knowledgeGraph.get(prereqId);
      // Prerequisite is considered met if mastery is >= 70%
      if (!kgNode || kgNode.mastery < 70) {
        return false;
      }
    }
    return true;
  }

  /**
   * Recalculates topic mastery based on quiz scores, hints used, and speed
   */
  static calculateMasteryDelta(params: {
    correctCount: number;
    totalCount: number;
    hintCount: number;
    timeSpentSeconds: number;
    targetMinutes: number;
  }): number {
    const baseScore = (params.correctCount / params.totalCount) * 100;
    // Deduct 2.5% per hint used, up to max 15% deduction
    const hintPenalty = Math.min(params.hintCount * 2.5, 15);
    // Speed factor: if they finished faster than target, reward up to 5% bonus. If slower, no penalty.
    const actualMinutes = params.timeSpentSeconds / 60;
    const speedBonus = actualMinutes < params.targetMinutes ? Math.min(((params.targetMinutes - actualMinutes) / params.targetMinutes) * 5, 5) : 0;
    
    const calculated = baseScore - hintPenalty + speedBonus;
    return Math.max(0, Math.min(100, Math.round(calculated)));
  }

  /**
   * Updates a knowledge node state in database and triggers mastery changes
   */
  static async recordPracticeSession(params: {
    topicId: string;
    scorePercent: number; // 0 to 100
    hintsUsed: number;
    isChallenge: boolean;
    secondsTaken: number;
  }) {
    const node = await db.knowledgeGraph.get(params.topicId);
    const topic = await db.topics.get(params.topicId);
    if (!node || !topic) return;

    // Update mastery: blend previous mastery with new score (70/30 weight)
    const newMastery = Math.round(
      node.mastery === 0 
        ? params.scorePercent 
        : (node.mastery * 0.6) + (params.scorePercent * 0.4)
    );

    // Speed calculation
    const expectedSeconds = topic.estimatedMinutes * 60;
    const speedRatio = params.secondsTaken / expectedSeconds;
    const currentSpeedScore = Math.max(1, Math.min(100, Math.round(100 - (speedRatio * 30))));

    // Decay rate updates: practiced recently means reset decay to 0
    node.mastery = Math.min(100, Math.max(0, newMastery));
    node.confidence = Math.min(5, Math.max(1, Math.ceil(node.mastery / 20)));
    node.memoryDecay = 0.0; // Reset decay upon active practice
    node.hintUsageCount += params.hintsUsed;
    if (params.scorePercent < 60) {
      node.errorFrequency += 1;
    }
    node.speedScore = Math.round((node.speedScore + currentSpeedScore) / 2);
    node.lastPracticedAt = new Date().toISOString();
    
    // Schedule next review based on SM-2 mastery logic
    const daysToNextReview = Math.max(1, Math.ceil(node.confidence * 2));
    node.nextReviewAt = new Date(Date.now() + daysToNextReview * 86400000).toISOString();

    await db.knowledgeGraph.put(node);

    // Allocate XP
    const xpGained = params.isChallenge ? 150 : 80;
    await this.addXP(xpGained);
  }

  /**
   * Sequences curriculum dynamically. Resolves next lesson recommendations based on prerequisites, 
   * decay levels, and weak topics.
   */
  static async getNextRecommendations(): Promise<Array<{ topic: TopicMetadata; reason: string }>> {
    const allTopics = await db.topics.toArray();
    const allKgNodes = await db.knowledgeGraph.toArray();
    
    const kgMap = new Map<string, KnowledgeNode>();
    for (const node of allKgNodes) {
      kgMap.set(node.topicId, node);
    }

    const recommendations: Array<{ topic: TopicMetadata; reason: string }> = [];

    // 1. Identify active high-decay nodes (requires urgent review)
    for (const node of allKgNodes) {
      if (node.mastery > 30 && node.memoryDecay > 0.6) {
        const topic = allTopics.find(t => t.id === node.topicId);
        if (topic) {
          recommendations.push({ 
            topic, 
            reason: `Memory retention decayed to ${Math.round((1 - node.memoryDecay) * 100)}%. Requires review.` 
          });
        }
      }
    }

    // 2. Weak topics (mastery between 1% and 60% with high errors)
    for (const node of allKgNodes) {
      if (node.mastery > 0 && node.mastery < 60) {
        const topic = allTopics.find(t => t.id === node.topicId);
        if (topic) {
          recommendations.push({
            topic,
            reason: `Current mastery is low (${node.mastery}%). Practice to reinforce understanding.`
          });
        }
      }
    }

    // 3. Find next fresh topics whose prerequisites are fully met
    for (const topic of allTopics) {
      const kg = kgMap.get(topic.id);
      const isCompleted = kg && kg.mastery >= 75;
      if (!isCompleted) {
        // Check if unlocked
        let prereqsMet = true;
        for (const prereqId of topic.prerequisites) {
          const prereqKg = kgMap.get(prereqId);
          if (!prereqKg || prereqKg.mastery < 70) {
            prereqsMet = false;
            break;
          }
        }

        if (prereqsMet && (!kg || kg.mastery === 0)) {
          recommendations.push({
            topic,
            reason: `Ready to start! Prerequisites satisfied.`
          });
        }
      }
    }

    // Sort: Review & weak items first, then newer tasks
    return recommendations.slice(0, 3);
  }

  /**
   * Adds XP to user state, manages level calculation and achievements triggers
   */
  static async addXP(amount: number): Promise<{ previousLevel: number; currentLevel: number; xpGained: number }> {
    const progressRecord = await db.progress.get('current');
    if (!progressRecord) {
      return { previousLevel: 1, currentLevel: 1, xpGained: 0 };
    }

    const prevXP = progressRecord.xp;
    const prevLevel = progressRecord.level;
    const newXP = prevXP + amount;
    
    // Level formula: level = Math.floor(Math.sqrt(newXP / 150)) + 1
    const newLevel = Math.floor(Math.sqrt(newXP / 150)) + 1;
    const isLevelUp = newLevel > prevLevel;

    // Record heatmap activity
    const today = new Date().toISOString().split('T')[0];
    const currentDayXp = progressRecord.heatmap[today] || 0;
    progressRecord.heatmap[today] = currentDayXp + amount;

    progressRecord.xp = newXP;
    progressRecord.level = newLevel;

    // Track achievement stats
    await this.incrementAchievementProgress(progressRecord);

    await db.progress.put(progressRecord);
    return { previousLevel: prevLevel, currentLevel: newLevel, xpGained: amount };
  }

  /**
   * Tracks and updates user streak based on consecutive days of active engagement
   */
  static async checkAndMaintainStreak(): Promise<number> {
    const progressRecord = await db.progress.get('current');
    if (!progressRecord) return 1;

    const todayStr = new Date().toISOString().split('T')[0];
    if (progressRecord.lastActiveDate === todayStr) {
      return progressRecord.dailyStreak;
    }

    if (!progressRecord.lastActiveDate) {
      progressRecord.dailyStreak = 1;
      progressRecord.lastActiveDate = todayStr;
      await db.progress.put(progressRecord);
      return 1;
    }

    // Calculate gap in days
    const lastActive = new Date(progressRecord.lastActiveDate);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      progressRecord.dailyStreak += 1;
    } else if (diffDays > 1) {
      progressRecord.dailyStreak = 1; // broken streak
    }

    progressRecord.lastActiveDate = todayStr;
    await db.progress.put(progressRecord);
    return progressRecord.dailyStreak;
  }

  /**
   * Increments achievement checklist thresholds
   */
  private static async incrementAchievementProgress(progress: ProgressState & { id: string }) {
    let changed = false;
    const todayStr = new Date().toISOString().split('T')[0];

    for (const ach of progress.achievements) {
      if (ach.unlockedAt) continue;

      if (ach.id === 'ach_welcome') {
        ach.currentValue = 1;
        ach.unlockedAt = new Date().toISOString();
        progress.xp += ach.xpReward;
        changed = true;
      } else if (ach.id === 'ach_streak_3') {
        ach.currentValue = progress.dailyStreak;
        if (ach.currentValue >= ach.threshold) {
          ach.unlockedAt = new Date().toISOString();
          progress.xp += ach.xpReward;
          changed = true;
        }
      } else if (ach.id === 'ach_ide_runs') {
        // Values updated externally when notebooks/scripts execute
      }
    }
  }

  /**
   * Registers a code execution instance to progress achievements
   */
  static async recordCodeRun() {
    const progress = await db.progress.get('current');
    if (!progress) return;

    let changed = false;
    for (const ach of progress.achievements) {
      if (ach.id === 'ach_ide_runs' && !ach.unlockedAt) {
        ach.currentValue += 1;
        if (ach.currentValue >= ach.threshold) {
          ach.unlockedAt = new Date().toISOString();
          progress.xp += ach.xpReward;
        }
        changed = true;
      }
    }

    if (changed) {
      const newLevel = Math.floor(Math.sqrt(progress.xp / 150)) + 1;
      progress.level = newLevel;
      await db.progress.put(progress);
    }
  }

  /**
   * SuperMemo-2 Spaced Repetition engine algorithm for flashcards
   */
  static async scoreFlashcard(cardId: string, rating: 1 | 2 | 3 | 4 | 5) {
    const card = await db.flashcards.get(cardId);
    if (!card) return;

    // SuperMemo-2 calculations
    let repetitions = card.repetitions;
    let easeFactor = card.easeFactor;
    let intervalDays = card.intervalDays;
    let box = card.box;

    if (rating >= 3) { // Correct answer
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.ceil(intervalDays * easeFactor);
      }
      repetitions += 1;
      box = Math.min(5, box + 1);
    } else { // Incorrect answer
      repetitions = 0;
      intervalDays = 1;
      box = Math.max(1, box - 1);
    }

    // Ease Factor calculation adjustments based on rating quality
    easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    card.repetitions = repetitions;
    card.easeFactor = easeFactor;
    card.intervalDays = intervalDays;
    card.box = box;
    card.lastReviewedAt = new Date().toISOString();
    card.nextReviewAt = new Date(Date.now() + intervalDays * 86400000).toISOString();

    await db.flashcards.put(card);

    // Track achievement for reviewing flashcards
    const progress = await db.progress.get('current');
    if (progress) {
      let changed = false;
      for (const ach of progress.achievements) {
        if (ach.id === 'ach_flashcard_master' && !ach.unlockedAt) {
          ach.currentValue += 1;
          if (ach.currentValue >= ach.threshold) {
            ach.unlockedAt = new Date().toISOString();
            progress.xp += ach.xpReward;
          }
          changed = true;
        }
      }
      if (changed) {
        progress.level = Math.floor(Math.sqrt(progress.xp / 150)) + 1;
        await db.progress.put(progress);
      }
    }

    // Reward XP on positive reviews
    if (rating >= 3) {
      await this.addXP(25);
    }
  }

  /**
   * Predicts learning statistics: Knowledge coverage %, Average mastery, Job readiness estimate
   */
  static async computeAnalytics(): Promise<{
    coveragePercent: number;
    averageMastery: number;
    jobReadinessScore: number;
    weakTopics: string[];
    strongTopics: string[];
  }> {
    const allKg = await db.knowledgeGraph.toArray();
    const allTopics = await db.topics.toArray();
    
    if (allKg.length === 0) {
      return { coveragePercent: 0, averageMastery: 0, jobReadinessScore: 0, weakTopics: [], strongTopics: [] };
    }

    const completedCount = allKg.filter(n => n.mastery >= 75).length;
    const coveragePercent = Math.round((completedCount / allTopics.length) * 100);

    const activeNodes = allKg.filter(n => n.mastery > 0);
    const averageMastery = activeNodes.length > 0 
      ? Math.round(activeNodes.reduce((acc, curr) => acc + curr.mastery, 0) / activeNodes.length)
      : 0;

    // Estimate Job Readiness Score (0 - 100%)
    // Heavy factors: Portfolio Topics (30%), Pandas & SQL mastery (40%), General curriculum progress (30%)
    let portfolioCompletion = 0;
    let coreSkillsScore = 0; // SQL + Pandas average
    let overallSyllabusCoverage = completedCount / allTopics.length;

    const portfolioNodes = allKg.filter(n => n.topicId === 'portfolio_projects');
    if (portfolioNodes.length > 0) {
      portfolioCompletion = portfolioNodes[0].mastery / 100;
    }

    const coreNodes = allKg.filter(n => n.topicId === 'pandas_wrangling' || n.topicId === 'sql_queries' || n.topicId === 'sql_advanced');
    if (coreNodes.length > 0) {
      coreSkillsScore = coreNodes.reduce((acc, curr) => acc + curr.mastery, 0) / (coreNodes.length * 100);
    }

    const rawReadiness = (portfolioCompletion * 0.35) + (coreSkillsScore * 0.40) + (overallSyllabusCoverage * 0.25);
    const jobReadinessScore = Math.max(0, Math.min(100, Math.round(rawReadiness * 100)));

    // Weak & strong topics classification
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const node of allKg) {
      const topic = allTopics.find(t => t.id === node.topicId);
      if (topic) {
        if (node.mastery > 0 && node.mastery < 60) {
          weakTopics.push(topic.title);
        } else if (node.mastery >= 80) {
          strongTopics.push(topic.title);
        }
      }
    }

    return {
      coveragePercent,
      averageMastery,
      jobReadinessScore,
      weakTopics,
      strongTopics
    };
  }
}
