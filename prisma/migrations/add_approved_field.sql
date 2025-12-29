-- Migration: Add approved field to users table
-- This migration adds the approved field with default true to preserve existing users

ALTER TABLE `users` ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT true;

-- All existing users are automatically approved
-- New users created via public registration will have approved = false

