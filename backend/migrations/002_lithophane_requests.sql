-- Lithophane custom-order enquiries from /lithophane.
--
-- The photo itself is NOT stored: it is emailed to the shop inbox, which is
-- the store of record for it. This table keeps a record of every enquiry
-- (and whether the email actually went out) without holding the files.
--
-- Apply with: psql <NEON_URL> -f 002_lithophane_requests.sql
--        or:  node apply.cjs 002_lithophane_requests.sql

CREATE TABLE IF NOT EXISTS lithophane_requests (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              varchar(120)  NOT NULL,
  email             varchar(254)  NOT NULL,
  phone             varchar(40),
  message           varchar(500),
  original_filename varchar(255),
  original_bytes    integer,
  compressed_bytes  integer       NOT NULL,
  user_agent        varchar(500),
  email_sent        boolean       NOT NULL,
  email_error       text,
  created_at        timestamptz   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lithophane_requests_created_at_idx
  ON lithophane_requests (created_at DESC);

-- Quick check for sends that failed and need a manual follow-up
CREATE INDEX IF NOT EXISTS lithophane_requests_failed_idx
  ON lithophane_requests (created_at DESC)
  WHERE email_sent = false;
