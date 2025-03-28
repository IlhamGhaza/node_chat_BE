CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_users_username ON users (username)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX idx_users_email ON users (email)
WHERE
    deleted_at IS NULL;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

SELECT * FROM users;
--conversation table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    participant_one INTEGER NOT NULL REFERENCES users (id),
    participant_two INTEGER NOT NULL REFERENCES users (id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Membuat indeks unik pada pasangan peserta yang memastikan pasangan peserta unik
CREATE UNIQUE INDEX idx_conversations_unique_pair ON conversations (
    LEAST(
        participant_one,
        participant_two
    ),
    GREATEST(
        participant_one,
        participant_two
    )
)
WHERE
    deleted_at IS NULL;

-- Trigger untuk memperbarui kolom updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_modtime
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

--message table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations (id),
    sender_id INTEGER NOT NULL REFERENCES users (id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id)
WHERE
    deleted_at IS NULL;

CREATE INDEX idx_messages_sender_id ON messages (sender_id)
WHERE
    deleted_at IS NULL;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_modtime
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

SELECT *
FROM conversations
    --contact table 
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users (id), contact_id INTEGER NOT NULL REFERENCES users (id), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, deleted_at TIMESTAMP WITH TIME ZONE, UNIQUE (user_id, contact_id)
);

CREATE INDEX idx_contacts_user_id ON contacts (user_id)
WHERE
    deleted_at IS NULL;

CREATE INDEX idx_contacts_contact_id ON contacts (contact_id)
WHERE
    deleted_at IS NULL;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_modtime
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
--
ALTER TABLE users ADD COLUMN photo_profile VARCHAR(255);

--insert data
INSERT INTO
    users (username, email, password)
VALUES (
        'joko',
        'joko@user.com',
        'hashed_password_2'
    );

INSERT INTO
    conversations (
        participant_one,
        participant_two
    )
VALUES (2, 37);

INSERT INTO
    conversations (
        participant_one,
        participant_two
    )
VALUES (2, 39);

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (3, 2, 'Halo Joko, apa kabar?');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (
        3,
        37,
        'Halo Ilham, saya baik-baik saja. Terima kasih!'
    );

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (3, 2, 'minjem duit');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (3, 37, 'ga mau');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (3, 2, 'pelit lu');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (3, 37, 'bodo');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (8, 2, 'hola');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (8, 39, '???');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (8, 2, 'salken, ini james');

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content
    )
VALUES (8, 39, 'salken');

INSERT INTO contacts (user_id, contact_id) VALUES (2, 37);

-- Untuk tabel `users`
SELECT last_value FROM users_id_seq;

SELECT last_value FROM conversations_id_seq;

SELECT last_value FROM messages_id_seq;