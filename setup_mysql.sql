CREATE DATABASE IF NOT EXISTS mymeds_production;
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMedsSecurePassword2024!';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
GRANT CREATE ON *.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
