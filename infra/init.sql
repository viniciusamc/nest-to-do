CREATE TABLE users(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	email varchar(255) NOT NULL UNIQUE,
	password varchar(255) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT current_timestamp
)
CREATE TABLE tasks(
	id SERIAL PRIMARY KEY,
	fk_id_user BIGINT REFERENCES users(id) NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	date timestamp,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
	updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
)
