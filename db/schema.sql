CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  credits integer NOT NULL DEFAULT 100 CHECK (credits >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  image_url text NOT NULL,
  model text NOT NULL,
  aspect_ratio text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations (created_at DESC);
CREATE INDEX IF NOT EXISTS generations_user_created_at_idx ON generations (user_id, created_at DESC);
