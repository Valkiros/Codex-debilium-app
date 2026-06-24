use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::Path;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Debug)]
pub struct Personnage {
    pub id: String,
    pub name: String,
    pub data: Value,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RefEquipement {
    pub id: i64,
    pub category: String,
    pub ref_id: i32,
    pub nom: String,
    pub degats: serde_json::Value,
    pub caracteristiques: serde_json::Value,
    pub protections: serde_json::Value,
    pub prix_info: serde_json::Value,
    pub craft: serde_json::Value,
    pub details: serde_json::Value,
}

pub struct AppState {
    pub db: Mutex<Connection>,
}

pub fn init_db(app_data_dir: &Path) -> Result<Connection> {
    std::fs::create_dir_all(app_data_dir).ok();
    let db_path = app_data_dir.join("codex_debilium.db");
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS personnages (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Updated Table Schema to match Supabase
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ref_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            ref_id INTEGER DEFAULT 0,
            nom TEXT NOT NULL,
            degats TEXT DEFAULT '{}',
            caracteristiques TEXT DEFAULT '{}',
            protections TEXT DEFAULT '{}',
            prix_info TEXT DEFAULT '{}',
            craft TEXT DEFAULT '{}',
            details TEXT DEFAULT '{}'
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS personnages_versions (
            version_id INTEGER PRIMARY KEY AUTOINCREMENT,
            personnage_id TEXT NOT NULL,
            data TEXT NOT NULL,
            saved_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_versions_personnage_id ON personnages_versions(personnage_id)",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS db_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}
