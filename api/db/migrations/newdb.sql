CREATE TABLE IF NOT EXISTS tokens (
    ID TEXT PRIMARY KEY UNIQUE NOT NULL,
    IsAdmin BOOLEAN DEFAULT 0 CHECK (IsAdmin in (0, 1))
);

CREATE TABLE IF NOT EXISTS files (
    ID TEXT PRIMARY KEY UNIQUE NOT NULL,
    TokenID TEXT NOT NULL,
    Sha256 TEXT NOT NULL,
    Size BIGINT NOT NULL,
    Name TEXT DEFAULT 'Unnamed file' NOT NULL,
    Mime TEXT DEFAULT 'application/octet-stream' NOT NULL,
    Expire TIMESTAMP DEFAULT NULL,
    uploadIP TEXT NOT NULL DEFAULT '127.0.0.1', -- filler for now, maybe not needed?
    uploadTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(TokenID) REFERENCES tokens(ID)
);

-- CREATE TABLE IF NOT EXISTS meta {
--     Lock char(1) PRIMARY KEY NOT NULL DEFAULT 'X',
--     version INT NOT NULL DEFAULT 0,
--     CHECK (Lock='X')
-- }