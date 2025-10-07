-- Create password reset tokens table
-- Note: This matches the Prisma schema which uses TEXT for ID fields (cuid)
CREATE TABLE IF NOT EXISTS patches_password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP(3) NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS patches_password_reset_tokens_token_idx ON patches_password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS patches_password_reset_tokens_user_id_idx ON patches_password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS patches_password_reset_tokens_expires_at_idx ON patches_password_reset_tokens(expires_at);

-- Function to automatically delete expired tokens
CREATE OR REPLACE FUNCTION delete_expired_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM patches_password_reset_tokens 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired tokens
-- This would need to be run periodically (e.g., with a cron job or pg_cron extension)
-- For now, we'll delete expired tokens on each password reset request

COMMENT ON TABLE patches_password_reset_tokens IS 'Stores temporary password reset tokens with automatic expiration';
COMMENT ON COLUMN patches_password_reset_tokens.token IS 'Unique token sent to user email for password reset';
COMMENT ON COLUMN patches_password_reset_tokens.expires_at IS 'Token expiration timestamp (typically 1 hour from creation)';
COMMENT ON COLUMN patches_password_reset_tokens.used IS 'Whether the token has been used to reset password';

