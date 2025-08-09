import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - for authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  password: text('password').notNull(),
  role: text('role').notNull(), // 'admin', 'trainer', 'customer'
  firstName: text('firstName'),
  lastName: text('lastName'),
  businessName: text('businessName'),
  phoneNumber: text('phoneNumber'),
  profileImageUrl: text('profileImageUrl'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  trainerId: uuid('trainerId').references(() => users.id),
  resetToken: text('resetToken'),
  resetTokenExpiry: timestamp('resetTokenExpiry'),
  lastLogin: timestamp('lastLogin'),
  isActive: boolean('isActive').default(true)
});

// Health Protocols table
export const trainerHealthProtocols = pgTable('trainerHealthProtocols', {
  id: uuid('id').defaultRandom().primaryKey(),
  trainerId: uuid('trainerId').references(() => users.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'longevity', 'parasiteCleanse', 'ailment'
  description: text('description'),
  config: jsonb('config').notNull(), // Stores the full protocol configuration
  tags: text('tags').array(),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

// Protocol Assignments table
export const protocolAssignments = pgTable('protocolAssignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  protocolId: uuid('protocolId').references(() => trainerHealthProtocols.id).notNull(),
  customerId: uuid('customerId').references(() => users.id).notNull(),
  trainerId: uuid('trainerId').references(() => users.id).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  status: text('status').notNull().default('active'), // 'active', 'completed', 'paused', 'cancelled'
  notes: text('notes'),
  progress: jsonb('progress'), // Track customer progress
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

// Sessions table - for authentication
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
});

// Activity Logs table - for tracking actions
export const activityLogs = pgTable('activityLogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').references(() => users.id).notNull(),
  action: text('action').notNull(),
  entityType: text('entityType'), // 'protocol', 'assignment', 'user'
  entityId: uuid('entityId'),
  metadata: jsonb('metadata'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  healthProtocols: many(trainerHealthProtocols),
  protocolAssignments: many(protocolAssignments),
  sessions: many(sessions),
  activityLogs: many(activityLogs),
  trainer: one(users, {
    fields: [users.trainerId],
    references: [users.id]
  })
}));

export const trainerHealthProtocolsRelations = relations(trainerHealthProtocols, ({ one, many }) => ({
  trainer: one(users, {
    fields: [trainerHealthProtocols.trainerId],
    references: [users.id]
  }),
  assignments: many(protocolAssignments)
}));

export const protocolAssignmentsRelations = relations(protocolAssignments, ({ one }) => ({
  protocol: one(trainerHealthProtocols, {
    fields: [protocolAssignments.protocolId],
    references: [trainerHealthProtocols.id]
  }),
  customer: one(users, {
    fields: [protocolAssignments.customerId],
    references: [users.id]
  }),
  trainer: one(users, {
    fields: [protocolAssignments.trainerId],
    references: [users.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  })
}));