import { ClassifiedTask, OwnershipDistribution } from '@/types';

/**
 * Calculate ownership distribution metrics from classified tasks
 * @param classifiedTasks - Array of tasks with ownership classifications
 * @returns Ownership distribution percentages
 */
export function calculateOwnershipDistribution(
  classifiedTasks: ClassifiedTask[]
): OwnershipDistribution {
  if (classifiedTasks.length === 0) {
    return {
      aiOwnedPercent: 0,
      humanSupervisesPercent: 0,
      humanOwnedPercent: 0,
    };
  }

  const totalTasks = classifiedTasks.length;

  // Count tasks by ownership type
  const aiOwnedCount = classifiedTasks.filter(
    (task) => task.ownership === 'AI_OWNED'
  ).length;

  const humanSupervisesCount = classifiedTasks.filter(
    (task) => task.ownership === 'HUMAN_SUPERVISES_AI'
  ).length;

  const humanOwnedCount = classifiedTasks.filter(
    (task) => task.ownership === 'HUMAN_OWNED'
  ).length;

  // Calculate percentages
  return {
    aiOwnedPercent: (aiOwnedCount / totalTasks) * 100,
    humanSupervisesPercent: (humanSupervisesCount / totalTasks) * 100,
    humanOwnedPercent: (humanOwnedCount / totalTasks) * 100,
  };
}
