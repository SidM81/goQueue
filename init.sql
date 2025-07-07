-- topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- partitions table
CREATE TABLE IF NOT EXISTS partitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  partition_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (topic_id, partition_number)
);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partition_id UUID REFERENCES partitions(id) ON DELETE CASCADE,
  msg_offset BIGINT NOT NULL,  -- renamed from offset
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'acknowledged', 'failed')) DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  acked_at TIMESTAMP,
  UNIQUE (partition_id, msg_offset)
);

-- consumers table
CREATE TABLE IF NOT EXISTS consumers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- consumer_offsets table
CREATE TABLE IF NOT EXISTS consumer_offsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES consumers(id),
  partition_id UUID REFERENCES partitions(id),
  last_committed_offset BIGINT DEFAULT -1,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (consumer_id, partition_id)
);

-- dead letter queue table
CREATE TABLE IF NOT EXISTS dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id UUID REFERENCES messages(id),
  payload JSONB NOT NULL,
  reason TEXT,
  failed_at TIMESTAMP DEFAULT NOW()
);
