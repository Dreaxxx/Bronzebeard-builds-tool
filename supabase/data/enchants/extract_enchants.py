import ast
import csv
import json
import re
from pathlib import Path

INPUT_LUA = "LCMysticExport.lua"
OUTPUT_JSON = "mystic_enchants.json"
OUTPUT_CSV = "mystic_enchants.csv"


def load_entries_from_lua(path: str):
    """
    Lit la SavedVariable LCMysticExport.lua et extrait
    la valeur de LCMysticExportJSON (qui est une string JSON).
    """
    text = Path(path).read_text(encoding="utf-8", errors="replace")

    start = text.find('"')
    end = text.rfind('"')
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Impossible de trouver la chaîne JSON dans le fichier Lua.")

    json_literal = text[start : end + 1]
    json_text = ast.literal_eval(json_literal)

    entries = json.loads(json_text)
    if not isinstance(entries, list):
        raise ValueError("Le JSON extrait ne contient pas une liste.")
    return entries


def strip_mystic_prefix(name: str) -> str:
    """
    Enlève 'Mystic Scroll: ' / 'Mystic Scroll :' / 'Mystic Scroll:' du début.
    """
    name = name.strip()
    prefixes = ["Mystic Scroll: ", "Mystic Scroll :", "Mystic Scroll:"]
    for p in prefixes:
        if name.startswith(p):
            return name[len(p):].strip()
    return name


def transform_entry(entry: dict):
    """
    Transforme une entrée brute de LCMysticExportJSON en ligne simplifiée
    pour Supabase (id, name, description, rarity, class, level).
    """
    item_id = entry.get("itemID")

    raw_name = entry.get("name", "") or ""
    enchant_name = strip_mystic_prefix(raw_name)

    desc = entry.get("description", "") or ""

    # On privilégie ce que l’addon a déjà mis
    clazz = entry.get("class")
    if not clazz:
        clazz = ""

    level = entry.get("level")
    if level is None:
        level = 1

    rarity = entry.get("rarity") or ""

    return {
        "id": item_id,
        "name": enchant_name,
        "description": desc,
        "rarity": rarity,
        "class": clazz,
        "level": level,
    }


def remove_duplicates_keep_best(entries):
    """
    Retire les doublons par ID en gardant, pour chaque ID,
    l'entrée qui a la description la plus complète (description la plus longue).
    """
    best_by_id = {}

    for e in entries:
        eid = e.get("id")
        if eid is None:
            # Pas d'id => on ignore
            continue

        desc = e.get("description") or ""
        desc_len = len(desc.strip())

        current_best = best_by_id.get(eid)
        if current_best is None:
            # Première fois qu'on voit cet ID
            best_by_id[eid] = e
        else:
            # Comparer la longueur de la description
            current_desc = current_best.get("description") or ""
            current_len = len(current_desc.strip())
            if desc_len > current_len:
                best_by_id[eid] = e

    # On renvoie la liste des meilleurs
    return list(best_by_id.values())


def main():
    # 1) Charger les entrées depuis le fichier Lua
    entries = load_entries_from_lua(INPUT_LUA)

    # 2) Transformer chaque entrée
    transformed = [transform_entry(e) for e in entries]

    # 3) Dédoublonnage par ID en gardant la description la plus complète
    dedup = remove_duplicates_keep_best(transformed)

    # 4) Écrire JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f_json:
        json.dump(dedup, f_json, ensure_ascii=False, indent=2)

    # 5) Écrire CSV
    fieldnames = ["id", "name", "description", "rarity", "class", "level"]
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f_csv:
        writer = csv.DictWriter(f_csv, fieldnames=fieldnames)
        writer.writeheader()
        for row in dedup:
            writer.writerow(row)

    print(f"✔ {len(entries)} entrées chargées")
    print(f"✔ {len(dedup)} entrées uniques après dédoublonnage (description la plus complète)")
    print(f"JSON → {OUTPUT_JSON}")
    print(f"CSV  → {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
