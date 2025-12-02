import re
import ast
import json
import csv
from pathlib import Path

# ------------ Helpers pour parser le SavedVariables Lua ------------

def lua_savedvars_to_python_dict(lua_text: str):
    """
    Transforme un fichier SavedVariables Lua de type :
    ItemDataRetrieverDB = { ["items"] = { ... } }
    en un dict Python via ast.literal_eval.
    """

    s = lua_text

    # 1) Supprimer les commentaires Lua (-- ...)
    s = re.sub(r'--.*', '', s)

    # 2) Remplacer booleans & nil (Lua -> Python)
    s = re.sub(r'\btrue\b', 'True', s)
    s = re.sub(r'\bfalse\b', 'False', s)
    s = re.sub(r'\bnil\b', 'None', s)

    # 3) Remplacer ["key"] = par "key":
    s = re.sub(r'\[\s*"([^"]+)"\s*\]\s*=', r'"\1":', s)

    # 4) Supprimer le "ItemDataRetrieverDB ="
    s = re.sub(r'^\s*ItemDataRetrieverDB\s*=\s*', '', s, count=1, flags=re.MULTILINE)

    # 5) Spécial: convertir "items": { ... } en "items": [ ... ]
    pattern1 = r'("items"\s*:\s*){(.*?)}(\s*,\s*"enriched")'
    pattern2 = r'("items"\s*:\s*){(.*?)}(\s*})'

    def repl_items_to_list(match):
        before = match.group(1)  # "items":
        inner  = match.group(2)  # contenu { ... }
        after  = match.group(3)  # , "enriched"  OU  }
        return f'{before}[{inner}]{after}'

    s, n1 = re.subn(pattern1, repl_items_to_list, s, flags=re.S)
    if n1 == 0:
        s, n2 = re.subn(pattern2, repl_items_to_list, s, flags=re.S)
        # si n2 == 0 : tant pis, mais normalement pattern1 ou 2 matchent

    # 6) Retirer les virgules finales avant } ou ]
    s = re.sub(r',(\s*[}\]])', r'\1', s)

    # 7) Évaluer en dict Python
    data = ast.literal_eval(s)
    return data


def load_items_from_lua(path: Path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    data = lua_savedvars_to_python_dict(text)
    items = data.get("items", [])
    print(f"{path.name}: {len(items)} items chargés")
    return items


# ------------ Fusion + export JSON & CSV ------------

def merge_two_lua_files(paths, out_json: Path, out_csv: Path):
    all_items_by_id = {}

    def is_enriched(item):
        # Heuristique : item enrichi si ilvl ou stats sont présents
        return ("stats" in item) or ("ilvl" in item)

    for p in paths:
        items = load_items_from_lua(p)
        for it in items:
            item_id = it.get("id")
            if item_id is None:
                continue

            existing = all_items_by_id.get(item_id)
            if existing is None:
                all_items_by_id[item_id] = it
            else:
                # Si on a deux versions, on préfère celle qui est "enrichie"
                if is_enriched(it) and not is_enriched(existing):
                    all_items_by_id[item_id] = it

    merged_items = list(all_items_by_id.values())
    merged = {"items": merged_items}

    print(f"Total unique items: {len(merged_items)}")

    # ---------- Écriture JSON ----------
    out_json.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"JSON écrit dans {out_json}")

    # ---------- Écriture CSV ----------
    # Colonnes "simples"
    base_fields = [
        "id",
        "name",
        "slot",
        "inventoryType",
        "classID",
        "subClassID",
        "subClass",
        "itemClass",
        "itemSubClass",
        "quality",
        "qualityText",
        "difficulty",
        "ilvl",
        "reqLevel",
        "icon",
        "sellPrice",
        # colonne JSON pour les stats
        "stats",
    ]

    with out_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=base_fields)
        writer.writeheader()

        for it in merged_items:
            row = {}

            # Remplir les colonnes de base
            for key in base_fields:
                if key == "stats":
                    continue
                row[key] = it.get(key, "")

            # Colonne stats : JSON string compact
            stats = it.get("stats") or {}
            # On force une string JSON (Supabase -> colonne jsonb)
            row["stats"] = json.dumps(stats, ensure_ascii=False, separators=(",", ":"))

            writer.writerow(row)

    print(f"CSV écrit dans {out_csv}")


if __name__ == "__main__":
    base = Path(".")

    lua_files = [
        base / "ItemDataRetriever_1_to_2M.lua",
        base / "ItemDataRetriever_2_to_9M.lua",
    ]

    out_json = base / "items_merged.json"
    out_csv  = base / "items_merged.csv"

    merge_two_lua_files(lua_files, out_json, out_csv)
