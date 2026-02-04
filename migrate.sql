ALTER TABLE habits ADD COLUMN sort_order INT DEFAULT 0;

UPDATE habits 
SET sort_order = id 
WHERE deleted_at IS NULL;

ALTER TABLE habits ADD COLUMN color VARCHAR(7) DEFAULT NULL;
