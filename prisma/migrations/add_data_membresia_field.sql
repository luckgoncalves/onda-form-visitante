-- Migration: Add dataMembresia field to users table
-- This migration adds the dataMembresia field (VARCHAR) to store membership date in YYYY-MM format

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `dataMembresia` VARCHAR(7) NULL;

-- The field is optional, so existing users will have NULL
-- New users can have their membership date set during registration
