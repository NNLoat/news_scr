import Database from 'better-sqlite3';
import { createHash } from 'crypto';

/**
 * Generates a SHA-256 hash for a given URL.
 * This is used as the primary key in the database.
 * @param url The URL to hash.
 * @returns The SHA-256 hash as a hex string.
 */
export function hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex');
}

/**
 * Manages the SQLite database connection and operations for the crawler.
 */
export class CrawlerDB {
    private db: Database.Database;
    private insertCommand: Database.Statement;

    constructor(dbPath: string) {
        // Initialize the database connection
        this.db = new Database(dbPath);

        // Prepare the statement for inserting data
        this.insertCommand = this.db.prepare(`
            INSERT INTO articles (url_hash, url, html_content, title, content, date, author, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(url_hash) DO UPDATE SET
                html_content = excluded.html_content,
                title = excluded.title,
                content = excluded.content,
                date = excluded.date,
                author = excluded.author;
        `);
    }

    /**
     * Inserts or updates a record with both HTML content and parsed data.
     * @param data The data object containing both raw and parsed information.
     * @returns True if the operation was successful, false otherwise.
     */
    public saveArticle(data: {
        url: string;
        html_content: string;
        title?: string;
        content?: string;
        date?: string;
        author?: string;
    }): boolean {
        try {
            const urlHash = hashUrl(data.url);
            const now = Date.now();
            
            this.insertCommand.run(
                urlHash,
                data.url,
                data.html_content,
                data.title || null,
                data.content || null,
                data.date || null,
                data.author || null,
                now
            );
            return true;
        } catch (error) {
            console.error(`Failed to save article for URL: ${data.url}`, error);
            // Re-throw the error if not in a transaction to prevent silent failures.
            if (!this.db.inTransaction) {
                 throw error;
            }
            return false;
        }
    }

    /**
     * Retrieves the cached HTML content for a given URL.
     * @param url The URL to look up.
     * @returns The HTML content as a string, or null if not found.
     */
    public getHtmlContent(url: string): string | null {
        const urlHash = hashUrl(url);
        const row = this.db.prepare('SELECT html_content FROM articles WHERE url_hash = ?').get(urlHash) as { html_content: string } | undefined;
        return row ? row.html_content : null;
    }

    /**
     * Closes the database connection.
     */
    public close(): void {
        this.db.close();
        console.log('Database connection closed.');
    }
}