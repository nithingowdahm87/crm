CREATE DATABASE IF NOT EXISTS crm;

USE crm;

CREATE TABLE IF NOT EXISTS hcps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  organization VARCHAR(255),
  INDEX idx_hcp_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO hcps (name, specialty, organization) VALUES
('Dr. Ananya Sharma', 'Cardiology', 'City Heart Clinic'),
('Dr. Rohan Verma', 'Oncology', 'Metro Cancer Institute'),
('Dr. Priya Iyer', 'General Medicine', 'Green Valley Medical');

CREATE TABLE IF NOT EXISTS interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hcp_id INT NOT NULL,
  interaction_type VARCHAR(100),
  sentiment VARCHAR(50),
  topics TEXT,
  outcomes TEXT,
  follow_up_actions TEXT,
  attendees TEXT,
  materials TEXT,
  samples TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hcp_id) REFERENCES hcps(id) ON DELETE CASCADE,
  INDEX idx_hcp_id (hcp_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS agent_tool_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interaction_id INT,
  tool VARCHAR(100) NOT NULL,
  output TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interaction_id) REFERENCES interactions(id) ON DELETE SET NULL,
  INDEX idx_interaction_id (interaction_id),
  INDEX idx_tool (tool),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
