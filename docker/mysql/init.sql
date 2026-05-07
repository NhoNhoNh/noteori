-- Noteori Database Initialization
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

ALTER DATABASE noteori CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON noteori.* TO 'noteori_user'@'%';
FLUSH PRIVILEGES;
