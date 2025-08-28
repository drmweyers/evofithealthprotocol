/**
 * Protocol Version Manager Service
 * 
 * Manages version control for health protocols with changelog tracking,
 * rollback capabilities, and comparison features.
 */

import { db } from '../db';
import { 
  protocolVersions,
  trainerHealthProtocols,
  type ProtocolVersion,
  type InsertProtocolVersion,
  type TrainerHealthProtocol
} from '@shared/schema';
import { eq, and, desc, sql, asc } from 'drizzle-orm';

export interface CreateVersionRequest {
  protocolId: string;
  versionName?: string;
  changelog: string;
  config: any;
  createdBy: string;
}

export interface VersionComparison {
  protocolId: string;
  protocolName: string;
  oldVersion: {
    id: string;
    number: string;
    name?: string;
    config: any;
    createdAt: Date;
  };
  newVersion: {
    id: string;
    number: string;
    name?: string;
    config: any;
    createdAt: Date;
  };
  changes: {
    added: Array<{ path: string; value: any; description: string }>;
    modified: Array<{ path: string; oldValue: any; newValue: any; description: string }>;
    removed: Array<{ path: string; value: any; description: string }>;
  };
  impactAssessment: {
    severity: 'low' | 'medium' | 'high';
    affectedAreas: string[];
    recommendations: string[];
  };
}

export interface VersionHistory {
  protocolId: string;
  protocolName: string;
  versions: Array<{
    id: string;
    versionNumber: string;
    versionName?: string;
    changelog: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    configSummary: {
      duration: number;
      intensity: string;
      type: string;
      keyFeatures: string[];
    };
  }>;
  totalVersions: number;
  activeVersion: string;
}

/**
 * Create a new version of a protocol
 */
export async function createProtocolVersion(
  request: CreateVersionRequest
): Promise<ProtocolVersion> {
  try {
    // Get current protocol details
    const [protocol] = await db
      .select()
      .from(trainerHealthProtocols)
      .where(eq(trainerHealthProtocols.id, request.protocolId))
      .limit(1);
    
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Get the latest version number
    const latestVersion = await getLatestVersionNumber(request.protocolId);
    const newVersionNumber = generateNextVersionNumber(latestVersion);
    
    // Deactivate current active version
    await db
      .update(protocolVersions)
      .set({ isActive: false })
      .where(
        and(
          eq(protocolVersions.protocolId, request.protocolId),
          eq(protocolVersions.isActive, true)
        )
      );
    
    // Create new version
    const [newVersion] = await db
      .insert(protocolVersions)
      .values({
        protocolId: request.protocolId,
        versionNumber: newVersionNumber,
        versionName: request.versionName,
        changelog: request.changelog,
        config: request.config,
        isActive: true,
        createdBy: request.createdBy,
      })
      .returning();
    
    // Update the main protocol with the new config
    await db
      .update(trainerHealthProtocols)
      .set({ 
        config: request.config,
        updatedAt: new Date()
      })
      .where(eq(trainerHealthProtocols.id, request.protocolId));
    
    return newVersion;
  } catch (error) {
    console.error('Error creating protocol version:', error);
    throw new Error('Failed to create protocol version');
  }
}

/**
 * Get version history for a protocol
 */
export async function getProtocolVersionHistory(protocolId: string): Promise<VersionHistory> {
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
    
    // Get all versions
    const versions = await db
      .select()
      .from(protocolVersions)
      .where(eq(protocolVersions.protocolId, protocolId))
      .orderBy(desc(protocolVersions.createdAt));
    
    const activeVersion = versions.find(v => v.isActive);
    
    const formattedVersions = versions.map(version => ({
      id: version.id,
      versionNumber: version.versionNumber,
      versionName: version.versionName || undefined,
      changelog: version.changelog,
      isActive: version.isActive || false,
      createdBy: version.createdBy,
      createdAt: version.createdAt || new Date(),
      configSummary: extractConfigSummary(version.config)
    }));
    
    return {
      protocolId,
      protocolName: protocol.name,
      versions: formattedVersions,
      totalVersions: versions.length,
      activeVersion: activeVersion?.versionNumber || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching protocol version history:', error);
    throw new Error('Failed to fetch protocol version history');
  }
}

/**
 * Compare two versions of a protocol
 */
export async function compareProtocolVersions(
  protocolId: string,
  oldVersionId: string,
  newVersionId: string
): Promise<VersionComparison> {
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
    
    // Get both versions
    const versions = await db
      .select()
      .from(protocolVersions)
      .where(
        and(
          eq(protocolVersions.protocolId, protocolId),
          sql`${protocolVersions.id} IN (${oldVersionId}, ${newVersionId})`
        )
      );
    
    if (versions.length !== 2) {
      throw new Error('One or both versions not found');
    }
    
    const oldVersion = versions.find(v => v.id === oldVersionId);
    const newVersion = versions.find(v => v.id === newVersionId);
    
    if (!oldVersion || !newVersion) {
      throw new Error('Invalid version IDs');
    }
    
    // Perform deep comparison
    const changes = compareConfigurations(oldVersion.config, newVersion.config);
    const impactAssessment = assessChangeImpact(changes);
    
    return {
      protocolId,
      protocolName: protocol.name,
      oldVersion: {
        id: oldVersion.id,
        number: oldVersion.versionNumber,
        name: oldVersion.versionName || undefined,
        config: oldVersion.config,
        createdAt: oldVersion.createdAt || new Date()
      },
      newVersion: {
        id: newVersion.id,
        number: newVersion.versionNumber,
        name: newVersion.versionName || undefined,
        config: newVersion.config,
        createdAt: newVersion.createdAt || new Date()
      },
      changes,
      impactAssessment
    };
  } catch (error) {
    console.error('Error comparing protocol versions:', error);
    throw new Error('Failed to compare protocol versions');
  }
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(
  protocolId: string,
  targetVersionId: string,
  rollbackReason: string,
  userId: string
): Promise<ProtocolVersion> {
  try {
    // Get the target version
    const [targetVersion] = await db
      .select()
      .from(protocolVersions)
      .where(
        and(
          eq(protocolVersions.id, targetVersionId),
          eq(protocolVersions.protocolId, protocolId)
        )
      )
      .limit(1);
    
    if (!targetVersion) {
      throw new Error('Target version not found');
    }
    
    // Create a new version based on the target version
    const rollbackChangelog = `ROLLBACK: ${rollbackReason}\n\nRolling back to version ${targetVersion.versionNumber}${targetVersion.versionName ? ` (${targetVersion.versionName})` : ''}\n\nOriginal changelog from ${targetVersion.versionNumber}:\n${targetVersion.changelog}`;
    
    const rollbackVersion = await createProtocolVersion({
      protocolId,
      versionName: `Rollback to ${targetVersion.versionNumber}`,
      changelog: rollbackChangelog,
      config: targetVersion.config,
      createdBy: userId
    });
    
    return rollbackVersion;
  } catch (error) {
    console.error('Error rolling back protocol version:', error);
    throw new Error('Failed to rollback protocol version');
  }
}

/**
 * Get a specific version of a protocol
 */
export async function getProtocolVersion(
  protocolId: string,
  versionId: string
): Promise<ProtocolVersion | null> {
  try {
    const [version] = await db
      .select()
      .from(protocolVersions)
      .where(
        and(
          eq(protocolVersions.id, versionId),
          eq(protocolVersions.protocolId, protocolId)
        )
      )
      .limit(1);
    
    return version || null;
  } catch (error) {
    console.error('Error fetching protocol version:', error);
    throw new Error('Failed to fetch protocol version');
  }
}

/**
 * Get the active version of a protocol
 */
export async function getActiveProtocolVersion(protocolId: string): Promise<ProtocolVersion | null> {
  try {
    const [activeVersion] = await db
      .select()
      .from(protocolVersions)
      .where(
        and(
          eq(protocolVersions.protocolId, protocolId),
          eq(protocolVersions.isActive, true)
        )
      )
      .limit(1);
    
    return activeVersion || null;
  } catch (error) {
    console.error('Error fetching active protocol version:', error);
    return null;
  }
}

/**
 * Archive old versions (keep last 10 versions active)
 */
export async function archiveOldVersions(protocolId: string): Promise<number> {
  try {
    // Get all versions ordered by creation date (newest first)
    const versions = await db
      .select({ id: protocolVersions.id })
      .from(protocolVersions)
      .where(eq(protocolVersions.protocolId, protocolId))
      .orderBy(desc(protocolVersions.createdAt));
    
    // Keep the 10 most recent versions, archive the rest
    if (versions.length > 10) {
      const versionsToArchive = versions.slice(10);
      const idsToArchive = versionsToArchive.map(v => v.id);
      
      await db
        .update(protocolVersions)
        .set({ isActive: false })
        .where(
          and(
            eq(protocolVersions.protocolId, protocolId),
            sql`${protocolVersions.id} = ANY(${idsToArchive})`
          )
        );
      
      return versionsToArchive.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Error archiving old versions:', error);
    throw new Error('Failed to archive old versions');
  }
}

/**
 * Helper function to get the latest version number
 */
async function getLatestVersionNumber(protocolId: string): Promise<string | null> {
  const [latestVersion] = await db
    .select({ versionNumber: protocolVersions.versionNumber })
    .from(protocolVersions)
    .where(eq(protocolVersions.protocolId, protocolId))
    .orderBy(desc(protocolVersions.createdAt))
    .limit(1);
  
  return latestVersion?.versionNumber || null;
}

/**
 * Generate the next version number
 */
function generateNextVersionNumber(currentVersion: string | null): string {
  if (!currentVersion) {
    return '1.0';
  }
  
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0] || '1');
  const minor = parseInt(parts[1] || '0');
  
  // Increment minor version
  return `${major}.${minor + 1}`;
}

/**
 * Extract configuration summary for display
 */
function extractConfigSummary(config: any): {
  duration: number;
  intensity: string;
  type: string;
  keyFeatures: string[];
} {
  const keyFeatures: string[] = [];
  
  // Extract key features based on config structure
  if (config.meals?.length) {
    keyFeatures.push(`${config.meals.length} meals planned`);
  }
  
  if (config.fastingProtocol) {
    keyFeatures.push(`Fasting: ${config.fastingProtocol}`);
  }
  
  if (config.supplements?.length) {
    keyFeatures.push(`${config.supplements.length} supplements`);
  }
  
  if (config.selectedAilments?.length) {
    keyFeatures.push(`Targets: ${config.selectedAilments.join(', ')}`);
  }
  
  if (config.primaryGoals?.length) {
    keyFeatures.push(`Goals: ${config.primaryGoals.join(', ')}`);
  }
  
  return {
    duration: config.duration || 30,
    intensity: config.intensity || 'moderate',
    type: config.type || 'general',
    keyFeatures
  };
}

/**
 * Compare two configuration objects and identify changes
 */
function compareConfigurations(oldConfig: any, newConfig: any): {
  added: Array<{ path: string; value: any; description: string }>;
  modified: Array<{ path: string; oldValue: any; newValue: any; description: string }>;
  removed: Array<{ path: string; value: any; description: string }>;
} {
  const added: any[] = [];
  const modified: any[] = [];
  const removed: any[] = [];
  
  // Simple comparison for major fields
  const fieldsToCompare = [
    'duration', 'intensity', 'type', 'fastingProtocol', 'calorieTarget',
    'selectedAilments', 'primaryGoals', 'culturalPreferences'
  ];
  
  for (const field of fieldsToCompare) {
    const oldValue = oldConfig[field];
    const newValue = newConfig[field];
    
    if (oldValue === undefined && newValue !== undefined) {
      added.push({
        path: field,
        value: newValue,
        description: `Added ${field}: ${formatValue(newValue)}`
      });
    } else if (oldValue !== undefined && newValue === undefined) {
      removed.push({
        path: field,
        value: oldValue,
        description: `Removed ${field}: ${formatValue(oldValue)}`
      });
    } else if (oldValue !== newValue && oldValue !== undefined && newValue !== undefined) {
      modified.push({
        path: field,
        oldValue,
        newValue,
        description: `Changed ${field} from ${formatValue(oldValue)} to ${formatValue(newValue)}`
      });
    }
  }
  
  return { added, modified, removed };
}

/**
 * Assess the impact of configuration changes
 */
function assessChangeImpact(changes: {
  added: any[];
  modified: any[];
  removed: any[];
}): {
  severity: 'low' | 'medium' | 'high';
  affectedAreas: string[];
  recommendations: string[];
} {
  let severity: 'low' | 'medium' | 'high' = 'low';
  const affectedAreas: string[] = [];
  const recommendations: string[] = [];
  
  // High impact changes
  const highImpactFields = ['duration', 'intensity', 'type', 'selectedAilments'];
  const mediumImpactFields = ['fastingProtocol', 'calorieTarget', 'primaryGoals'];
  
  const allChanges = [...changes.added, ...changes.modified, ...changes.removed];
  
  for (const change of allChanges) {
    if (highImpactFields.includes(change.path)) {
      severity = 'high';
      affectedAreas.push(change.path);
      recommendations.push(`Review ${change.path} changes with clients`);
    } else if (mediumImpactFields.includes(change.path)) {
      if (severity !== 'high') severity = 'medium';
      affectedAreas.push(change.path);
      recommendations.push(`Monitor client response to ${change.path} changes`);
    }
  }
  
  if (severity === 'high') {
    recommendations.push('Consider notifying all assigned clients of major changes');
    recommendations.push('Update safety validations for affected protocols');
  }
  
  if (severity === 'medium') {
    recommendations.push('Document changes in client communication');
  }
  
  return {
    severity,
    affectedAreas: [...new Set(affectedAreas)], // Remove duplicates
    recommendations
  };
}

/**
 * Format values for display
 */
function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'empty array';
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}