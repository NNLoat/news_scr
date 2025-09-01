import Database from 'better-sqlite3';

/**
 * Initializes the database schema.
 * Creates the 'articles' table if it does not exist.
 * @param db The active database connection.
 */
export function initializeDbSchema(db: Database.Database): void {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS articles (
            url_hash TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            html_content TEXT NOT NULL,
            title TEXT,
            content TEXT,
            date TEXT,
            author TEXT,
            created_at INTEGER NOT NULL
        );
    `).run();
}
