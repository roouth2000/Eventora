-- ============================================================
-- Eventora MySQL Database Setup Script
-- Run this ONCE as a MySQL admin (root or DBA) to create
-- the database and a dedicated application user.
--
-- Security: The app user has ONLY the permissions it needs.
-- NEVER use root credentials in your .env for production.
-- TODO(security): Enable SSL/TLS for MySQL connections in prod
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS eventora
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create a dedicated application user
--    Replace 'your_strong_password' with a secure generated password
CREATE USER IF NOT EXISTS 'eventora_user'@'localhost'
  IDENTIFIED BY 'your_strong_password';

-- 3. Grant only the permissions the app needs (Principle of Least Privilege)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON eventora.*
  TO 'eventora_user'@'localhost';

-- For production (after initial migration), reduce to DML only:
-- REVOKE CREATE, ALTER, INDEX, DROP ON eventora.* FROM 'eventora_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON eventora.* TO 'eventora_user'@'localhost';

FLUSH PRIVILEGES;

-- 4. Verify
SHOW GRANTS FOR 'eventora_user'@'localhost';
