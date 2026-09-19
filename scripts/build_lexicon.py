#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kaoyan-Tiku: Canonical Lexicon Builder
Extracts and builds runtime-optimized, deterministic indexes and shards
from kaoyan-canonical-lexicon.zip for both file:/// and HTTP environments.
"""

import os
import sys
import json
import zipfile
import time
import re

ZIP_PATH = r"C:\Users\Zhangwh\Downloads\kaoyan-canonical-lexicon.zip"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEXICON_DIR = os.path.join(BASE_DIR, "题库", "英语", "lexicon")
CANONICAL_DIR = os.path.join(LEXICON_DIR, "canonical")
DIST_DIR = os.path.join(LEXICON_DIR, "dist")
INDEXES_DIR = os.path.join(DIST_DIR, "indexes")
ARTICLES_DIR = os.path.join(DIST_DIR, "articles")
SHARDS_DIR = os.path.join(DIST_DIR, "shards")


def ensure_dirs():
    for d in [CANONICAL_DIR, DIST_DIR, INDEXES_DIR, ARTICLES_DIR, SHARDS_DIR]:
        os.makedirs(d, exist_ok=True)


def extract_canonical(z):
    print("Extracting canonical lexicon files...")
    # Extract only files within kaoyan-canonical-lexicon/
    prefix = "kaoyan-canonical-lexicon/"
    for member in z.infolist():
        if member.filename.startswith(prefix) and not member.is_dir():
            rel_path = member.filename[len(prefix):]
            target_path = os.path.join(CANONICAL_DIR, rel_path)
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with z.open(member) as src, open(target_path, "wb") as dst:
                dst.write(src.read())
    print(f"Extraction complete to: {CANONICAL_DIR}")


def parse_exchange_forms(exchange_str):
    """
    Parse ECDICT exchange string e.g.:
    '0:qualify/1:dp/d:qualified/p:qualified' -> ['qualified']
    'p:teeth' -> ['teeth']
    '3:takes/p:taken/d:took/i:taking' -> ['takes', 'taken', 'took', 'taking']
    """
    forms = set()
    if not exchange_str:
        return forms
    parts = exchange_str.split('/')
    for part in parts:
        if ':' in part:
            _, val = part.split(':', 1)
            val = val.strip().lower()
            if val and not val.isdigit() and len(val) > 1:
                forms.add(val)
    return forms


def build_runtime():
    t0 = time.time()
    ensure_dirs()

    if not os.path.exists(ZIP_PATH):
        print(f"Error: zip not found at {ZIP_PATH}", file=sys.stderr)
        sys.exit(1)

    with zipfile.ZipFile(ZIP_PATH) as z:
        extract_canonical(z)

        # 1. Load pre-built indexes
        print("Loading pre-built indexes from zip...")
        lemma_idx = json.loads(z.read("kaoyan-canonical-lexicon/indexes/lemma-to-lexeme.json").decode("utf-8"))
        surface_idx = json.loads(z.read("kaoyan-canonical-lexicon/indexes/surface-to-lexeme.json").decode("utf-8"))
        occ_by_article = json.loads(z.read("kaoyan-canonical-lexicon/indexes/occurrence-by-article.json").decode("utf-8"))
        occ_by_lexeme = json.loads(z.read("kaoyan-canonical-lexicon/indexes/occurrence-by-lexeme.json").decode("utf-8"))

        # 2. Load all Lexemes
        print("Loading lexemes.jsonl...")
        lexemes = {}
        phrases = []
        with z.open("kaoyan-canonical-lexicon/merged/lexemes.jsonl") as f:
            for line in f:
                lex = json.loads(line.decode("utf-8"))
                lex_id = lex["lexemeId"]
                lexemes[lex_id] = lex
                if lex.get("type") == "phrase":
                    phrases.append({
                        "lexemeId": lex_id,
                        "lemma": lex.get("lemma", ""),
                        "length": len(lex.get("lemma", "").split())
                    })

                # Also enrich lemma_idx with exchange and forms
                d = lex.get("dictionary", {})
                forms = d.get("forms", [])
                for form_obj in forms:
                    f_val = form_obj.get("form", "").strip().lower()
                    if f_val and len(f_val) > 1:
                        if f_val not in lemma_idx:
                            lemma_idx[f_val] = []
                        if lex_id not in lemma_idx[f_val]:
                            lemma_idx[f_val].append(lex_id)

                exchange_forms = parse_exchange_forms(d.get("exchange"))
                for ex_form in exchange_forms:
                    if ex_form not in lemma_idx:
                        lemma_idx[ex_form] = []
                    if lex_id not in lemma_idx[ex_form]:
                        lemma_idx[ex_form].append(lex_id)

        print(f"Loaded {len(lexemes)} lexemes ({len(phrases)} phrases). Extended lemma keys: {len(lemma_idx)}")

        # Sort phrases by word count / length descending for greedy matching
        phrases.sort(key=lambda x: (x["length"], len(x["lemma"])), reverse=True)

        # 3. Load all Occurrences
        print("Loading occurrences.jsonl...")
        occurrences = {}
        with z.open("kaoyan-canonical-lexicon/merged/occurrences.jsonl") as f:
            for line in f:
                occ = json.loads(line.decode("utf-8"))
                occurrences[occ["occurrenceId"]] = occ

        print(f"Loaded {len(occurrences)} occurrences.")

        # 4. Write Runtime Global Indexes
        print("Writing runtime global indexes...")
        # Header template for script / global assignment
        header = "window.__KY_LEXICON__ = window.__KY_LEXICON__ || {};\n"

        # surface index
        with open(os.path.join(INDEXES_DIR, "surface-index.js"), "w", encoding="utf-8") as f:
            f.write(header)
            f.write("window.__KY_LEXICON__.surfaceIndex = ")
            json.dump(surface_idx, f, ensure_ascii=False)
            f.write(";\n")

        # lemma index
        with open(os.path.join(INDEXES_DIR, "lemma-index.js"), "w", encoding="utf-8") as f:
            f.write(header)
            f.write("window.__KY_LEXICON__.lemmaIndex = ")
            json.dump(lemma_idx, f, ensure_ascii=False)
            f.write(";\n")

        # phrases index
        with open(os.path.join(INDEXES_DIR, "phrase-index.js"), "w", encoding="utf-8") as f:
            f.write(header)
            f.write("window.__KY_LEXICON__.phraseIndex = ")
            json.dump(phrases, f, ensure_ascii=False)
            f.write(";\n")

        # occurrence-by-lexeme index
        with open(os.path.join(INDEXES_DIR, "occ-by-lexeme.js"), "w", encoding="utf-8") as f:
            f.write(header)
            f.write("window.__KY_LEXICON__.occByLexeme = ")
            json.dump(occ_by_lexeme, f, ensure_ascii=False)
            f.write(";\n")

        # 5. Build Article Packages
        # For every reading article, bundle its occurrences + its referenced lexemes
        print("Writing per-article packages...")
        article_count = 0
        for article_id, occ_ids in occ_by_article.items():
            # Bundle all occurrences for this article
            art_occs = {}
            art_lex_ids = set()
            by_ps = {}
            for oid in occ_ids:
                if oid in occurrences:
                    occ = occurrences[oid]
                    art_occs[oid] = occ
                    art_lex_ids.add(occ["lexemeId"])
                    ps = occ.get("location", {}).get("ps")
                    if ps:
                        if ps not in by_ps:
                            by_ps[ps] = []
                        by_ps[ps].append(oid)

            # Include the full Lexeme records for these occurrences
            art_lexemes = {lid: lexemes[lid] for lid in art_lex_ids if lid in lexemes}

            package = {
                "articleId": article_id,
                "occurrences": art_occs,
                "byPs": by_ps,
                "lexemes": art_lexemes
            }

            art_file = os.path.join(ARTICLES_DIR, f"{article_id}.js")
            with open(art_file, "w", encoding="utf-8") as f:
                f.write("window.__KY_LEXICON__ = window.__KY_LEXICON__ || {};\n")
                f.write("window.__KY_LEXICON__.articles = window.__KY_LEXICON__.articles || {};\n")
                f.write(f"window.__KY_LEXICON__.articles[{json.dumps(article_id)}] = ")
                json.dump(package, f, ensure_ascii=False)
                f.write(";\n")
            article_count += 1

        print(f"Generated {article_count} article packages in: {ARTICLES_DIR}")

        # 6. Build Lexeme Shards (16 hex shards: lex-0 to lex-f)
        print("Writing lexeme shards (16 shards)...")
        lex_shards = {format(i, 'x'): {} for i in range(16)}
        for lid, lex in lexemes.items():
            # shard by first hex char after 'lex-'
            hex_char = lid[4].lower() if len(lid) > 4 and lid[4].lower() in lex_shards else '0'
            lex_shards[hex_char][lid] = lex

        for hex_char, shard_data in lex_shards.items():
            shard_file = os.path.join(SHARDS_DIR, f"lex-{hex_char}.js")
            with open(shard_file, "w", encoding="utf-8") as f:
                f.write("window.__KY_LEXICON__ = window.__KY_LEXICON__ || {};\n")
                f.write("window.__KY_LEXICON__.lexemes = window.__KY_LEXICON__.lexemes || {};\n")
                f.write("Object.assign(window.__KY_LEXICON__.lexemes, ")
                json.dump(shard_data, f, ensure_ascii=False)
                f.write(");\n")

        # 7. Build Occurrence Shards (16 hex shards: occ-0 to occ-f for cross-year context lookup)
        print("Writing occurrence shards (16 shards)...")
        occ_shards = {format(i, 'x'): {} for i in range(16)}
        for oid, occ in occurrences.items():
            hex_char = oid[4].lower() if len(oid) > 4 and oid[4].lower() in occ_shards else '0'
            occ_shards[hex_char][oid] = occ

        for hex_char, shard_data in occ_shards.items():
            shard_file = os.path.join(SHARDS_DIR, f"occ-{hex_char}.js")
            with open(shard_file, "w", encoding="utf-8") as f:
                f.write("window.__KY_LEXICON__ = window.__KY_LEXICON__ || {};\n")
                f.write("window.__KY_LEXICON__.allOccurrences = window.__KY_LEXICON__.allOccurrences || {};\n")
                f.write("Object.assign(window.__KY_LEXICON__.allOccurrences, ")
                json.dump(shard_data, f, ensure_ascii=False)
                f.write(");\n")

        # 8. Manifest
        manifest = {
            "version": "1.0.0",
            "buildTime": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lexemesCount": len(lexemes),
            "occurrencesCount": len(occurrences),
            "articlesCount": article_count,
            "phrasesCount": len(phrases),
            "shards": 16
        }
        with open(os.path.join(DIST_DIR, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Canonical Lexicon build successfully completed in {time.time() - t0:.2f}s!")


if __name__ == "__main__":
    build_runtime()
