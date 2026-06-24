use rusqlite::{params, Connection};
use tauri::AppHandle;

fn str_field(item: &serde_json::Value, key: &str) -> String {
    match item.get(key) {
        Some(serde_json::Value::String(s)) => s.clone(),
        Some(serde_json::Value::Number(n)) => n.to_string(),
        _ => String::new(),
    }
}

fn int_field(item: &serde_json::Value, key: &str) -> i32 {
    match item.get(key) {
        Some(serde_json::Value::String(s)) => s.trim().parse().unwrap_or(0),
        Some(serde_json::Value::Number(n)) => n.as_i64().unwrap_or(0) as i32,
        _ => 0,
    }
}

fn str_field_or(item: &serde_json::Value, key: &str, fallback_key: &str) -> String {
    let val = str_field(item, key);
    if val.is_empty() { str_field(item, fallback_key) } else { val }
}

fn seed_category(
    tx: &rusqlite::Transaction,
    json_str: &str,
    category: &str,
) -> Result<(), String> {
    let items: Vec<serde_json::Value> =
        serde_json::from_str(json_str).map_err(|e| format!("{category}: {e}"))?;

    for item in &items {
        let ref_id = int_field(item, "id");
        let nom = str_field(item, "nom");

        let degats = serde_json::json!({
            "degats": str_field(item, "degats"),
            "pi": int_field(item, "pi"),
        });

        let mut caracs = serde_json::Map::new();
        for key in &[
            "courage", "intelligence", "charisme", "adresse",
            "force", "perception", "attaque", "parade",
        ] {
            let val = int_field(item, key);
            if val != 0 {
                caracs.insert(key.to_string(), serde_json::json!(val));
            }
        }
        let caracteristiques = serde_json::Value::Object(caracs);

        let protections = serde_json::json!({
            "pr_sol": str_field_or(item, "pr_sol", "pr"),
            "pr_mag": str_field(item, "pr_mag"),
            "pr_spe": str_field(item, "pr_spe"),
            "pluie": str_field(item, "pluie"),
            "froid": str_field(item, "froid"),
            "chaleur": str_field(item, "chaleur"),
        });

        let prix_info = serde_json::json!({
            "prix": str_field(item, "prix"),
            "monnaie": str_field(item, "monnaie"),
            "niveau": str_field(item, "niveau"),
            "restriction": str_field(item, "restriction"),
            "origine_rarete": str_field(item, "origine/rarete"),
        });

        let craft = serde_json::json!({
            "composants": str_field(item, "composants"),
            "outils": str_field(item, "outils"),
            "qualifications": str_field(item, "qualifications"),
            "difficulte": int_field(item, "difficulte"),
            "temps_de_confection": str_field(item, "temps_de_confection"),
            "confection": str_field(item, "confection"),
            "xp_confection": int_field(item, "xp_confection"),
            "xp_reparation": int_field(item, "xp_reparation"),
        });

        let details = serde_json::json!({
            "poids": str_field(item, "poids"),
            "aura": str_field(item, "aura"),
            "effet": str_field(item, "effet"),
            "type": str_field(item, "type"),
            "rupture": str_field(item, "rupture"),
            "esquive_bonus": str_field(item, "esquive"),
            "mains": str_field(item, "mains"),
            "contenant": str_field(item, "contenant"),
            "portee": str_field(item, "portee"),
            "couvre": str_field(item, "couvre"),
            "matiere": str_field(item, "matiere"),
            "charge": str_field(item, "charge"),
            "capacite": str_field(item, "capacite"),
            "places": str_field(item, "places"),
            "peremption": str_field(item, "peremption"),
            "recolte": str_field(item, "recolte"),
        });

        tx.execute(
            "INSERT INTO ref_items (category, ref_id, nom, degats, caracteristiques, protections, prix_info, craft, details)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                category,
                ref_id,
                nom,
                degats.to_string(),
                caracteristiques.to_string(),
                protections.to_string(),
                prix_info.to_string(),
                craft.to_string(),
                details.to_string(),
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn seed_reference_data(conn: &mut Connection, _app_handle: AppHandle) -> Result<(), String> {
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM ref_items", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if count > 0 {
        return Ok(());
    }

    let categories: Vec<(&str, &str)> = vec![
        (include_str!("../data/items/Mains_nues.json"), "Mains_nues"),
        (include_str!("../data/items/Armes.json"), "Armes"),
        (include_str!("../data/items/Protections.json"), "Protections"),
        (include_str!("../data/items/Accessoires.json"), "Accessoires"),
        (include_str!("../data/items/Sacs.json"), "Sacs"),
        (include_str!("../data/items/Sacoches.json"), "Sacoches"),
        (include_str!("../data/items/Potions.json"), "Potions"),
        (include_str!("../data/items/Outils.json"), "Outils"),
        (include_str!("../data/items/Munitions.json"), "Munitions"),
        (include_str!("../data/items/Armes_de_jet.json"), "Armes_de_jet"),
        (include_str!("../data/items/Pieges.json"), "Pieges"),
        (include_str!("../data/items/Objets_magiques.json"), "Objets_magiques"),
        (include_str!("../data/items/Boissons.json"), "Boissons"),
        (include_str!("../data/items/Bouffes.json"), "Bouffes"),
        (include_str!("../data/items/Ingredients.json"), "Ingredients"),
        (include_str!("../data/items/Objets_speciaux.json"), "Objets_speciaux"),
    ];

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    for (json_str, category) in &categories {
        seed_category(&tx, json_str, category)?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}
