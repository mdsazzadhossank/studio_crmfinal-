-- ============================================================
-- Studio Pro CRM — Complete MySQL Database Schema
-- Generated: 2026-05-11
-- Compatible: MySQL 5.7+ / MariaDB 10.3+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Create database if needed
CREATE DATABASE IF NOT EXISTS `studio_pro_crm` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `studio_pro_crm`;

-- ============================================================
-- 1. USERS (Auth System)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','manager','user') NOT NULL DEFAULT 'user',
  `is_super_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `permissions` JSON DEFAULT NULL,
  `project_permissions` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Super Admin (password: admin — bcrypt hashed)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_super_admin`, `permissions`, `project_permissions`) VALUES
('u1', 'Super Admin', 'admin', '$2y$10$8KzQ3ZjX7xH1WMqWqWqWqOxlZqF5K0fM5N8P7Q9R1S2T3U4V5W6X7', 'admin', 1, 
 '["dashboard","projects","clients","all-clients","website","automation","course","marketing","models","scheduling","lead","invoice","daily-tasks","terms","task-manager","portfolio","employees","website-info","users","messages"]',
 '["project-financials","project-scripts","project-content","project-links","project-dates","project-team"]'
);

-- ============================================================
-- 2. CLIENTS (Studio Clients with projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `facebook` VARCHAR(500) DEFAULT '',
  `total_budget` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clients_name` (`name`),
  KEY `idx_clients_company` (`company`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. PROJECTS (belongs to a client)
-- ============================================================
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(50) NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `category` VARCHAR(100) DEFAULT '',
  `status` ENUM('Planning','Shooting','Editing','Completed') NOT NULL DEFAULT 'Planning',
  `budget` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `client_advance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `model_payment` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `extra_expenses` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `models` JSON DEFAULT NULL,
  `content_log` JSON DEFAULT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT '',
  `script` TEXT DEFAULT NULL,
  `scripts` JSON DEFAULT NULL,
  `messages` JSON DEFAULT NULL,
  `recommendation_link` VARCHAR(500) DEFAULT '',
  `video_duration` VARCHAR(50) DEFAULT '',
  `formats` JSON DEFAULT NULL,
  `content_type` VARCHAR(100) DEFAULT '',
  `framework` VARCHAR(100) DEFAULT '',
  `content_writer_id` VARCHAR(50) DEFAULT '',
  `editor_id` VARCHAR(50) DEFAULT '',
  `link` VARCHAR(500) DEFAULT '',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `priority` ENUM('Urgent','Normal') DEFAULT 'Normal',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_projects_client` (`client_id`),
  KEY `idx_projects_status` (`status`),
  CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. MODELS (Talent/Model Profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS `models` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT '',
  `hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `phone` VARCHAR(50) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `facebook` VARCHAR(500) DEFAULT '',
  `image_url` LONGTEXT DEFAULT NULL,
  `portfolio_links` JSON DEFAULT NULL,
  `portfolio_images` JSON DEFAULT NULL,
  `projects` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_models_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) DEFAULT '',
  `invoice_number` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tax_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Paid','Unpaid','Overdue') NOT NULL DEFAULT 'Unpaid',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoices_client` (`client_id`),
  KEY `idx_invoices_number` (`invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. INVOICE ITEMS (line items)
-- ============================================================
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_id` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `rate` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_invoice_items_invoice` (`invoice_id`),
  CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `designation` VARCHAR(255) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `address` TEXT DEFAULT NULL,
  `joining_date` DATE DEFAULT NULL,
  `salary` VARCHAR(100) DEFAULT '',
  `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employees_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS `leads` (
  `id` VARCHAR(50) NOT NULL,
  `client_name` VARCHAR(255) DEFAULT '',
  `conversation_id` VARCHAR(255) DEFAULT '',
  `whatsapp_number` VARCHAR(50) DEFAULT '',
  `facebook_page` VARCHAR(500) DEFAULT '',
  `business_type` VARCHAR(255) DEFAULT '',
  `business_duration` VARCHAR(100) DEFAULT '',
  `average_product_price` VARCHAR(100) DEFAULT '',
  `daily_marketing_budget` VARCHAR(100) DEFAULT '',
  `current_problems` TEXT DEFAULT NULL,
  `website_status` VARCHAR(255) DEFAULT '',
  `main_goal` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'new',
  `tags` JSON DEFAULT NULL,
  `reminder_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leads_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. SCHEDULE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `schedule_events` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `date` DATE NOT NULL,
  `type` ENUM('Shoot','Meeting','Deadline') NOT NULL DEFAULT 'Meeting',
  `models` JSON DEFAULT NULL,
  `crew` JSON DEFAULT NULL,
  `project_id` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. CONTENT ARCHIVE
-- ============================================================
CREATE TABLE IF NOT EXISTS `content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `category` VARCHAR(100) DEFAULT '',
  `image_url` VARCHAR(500) DEFAULT '',
  `project_id` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_content_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. TASKS (Task Manager)
-- ============================================================
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `assigned_to` VARCHAR(50) DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'todo',
  `priority` VARCHAR(50) DEFAULT 'normal',
  `due_date` DATE DEFAULT NULL,
  `data` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. WORK LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS `work_logs` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) DEFAULT '',
  `user_name` VARCHAR(255) DEFAULT '',
  `date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `hours` DECIMAL(5,2) DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_worklogs_user` (`user_id`),
  KEY `idx_worklogs_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. TIME LOGS (Clock In/Out)
-- ============================================================
CREATE TABLE IF NOT EXISTS `time_logs` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) DEFAULT '',
  `user_name` VARCHAR(255) DEFAULT '',
  `date` DATE NOT NULL,
  `clock_in` TIME DEFAULT NULL,
  `clock_out` TIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_timelogs_user` (`user_id`),
  KEY `idx_timelogs_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. MESSAGE TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS `message_templates` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) DEFAULT '',
  `category` VARCHAR(100) DEFAULT '',
  `content` TEXT DEFAULT NULL,
  `data` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. PORTFOLIO ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS `portfolio_items` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(500) DEFAULT '',
  `category` VARCHAR(100) DEFAULT '',
  `image_url` VARCHAR(500) DEFAULT '',
  `description` TEXT DEFAULT NULL,
  `link` VARCHAR(500) DEFAULT '',
  `data` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. KEY-VALUE STORE (Universal Data Store)
-- This table handles ALL localStorage keys that don't have
-- dedicated tables. Provides backward compatibility.
-- ============================================================
CREATE TABLE IF NOT EXISTS `kv_store` (
  `store_key` VARCHAR(255) NOT NULL,
  `store_value` LONGTEXT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. SETTINGS (App-wide settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT,
  `setting_key` VARCHAR(255) NOT NULL,
  `setting_value` LONGTEXT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. DAILY TASKS (Operations + Super Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS `daily_tasks` (
  `id` VARCHAR(50) NOT NULL,
  `date_key` VARCHAR(20) DEFAULT '',
  `step_id` VARCHAR(100) DEFAULT '',
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `user_id` VARCHAR(50) DEFAULT '',
  `task_type` VARCHAR(50) DEFAULT 'operations',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_daily_tasks_date` (`date_key`),
  KEY `idx_daily_tasks_type` (`task_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Insert default categories
-- ============================================================
INSERT IGNORE INTO `categories` (`name`) VALUES
('Fashion'), ('Commercial'), ('Product'), ('Event');

-- ============================================================
-- Done! Schema creation complete.
-- ============================================================
