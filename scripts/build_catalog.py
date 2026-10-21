#!/usr/bin/env python3
"""
Builds the offline fallback catalog (src/data/catalog.json) from two real TMDB-derived
open datasets:

  * movies_metadata.csv  (Kaggle "The Movies Dataset" / TMDB export)
  * TMDB_tv_dataset_v3.csv (Kaggle "Full TMDb TV Shows Dataset" / asaniczka)
  * tmdb_5000_credits.csv (Kaggle "TMDB 5000 Movie Dataset", cast)

Nothing is invented here: every row keeps its real TMDB id, poster path, rating,
overview and dates. The JSON is only used when TMDB_API_KEY is not configured;
with a key the app talks to the live TMDB API instead.

Usage:
  python3 scripts/build_catalog.py --movies /path/movies_metadata.csv \
      --tv /path/TMDB_tv_dataset_v3.csv --credits /path/tmdb_5000_credits.csv
"""
import argparse, ast, csv, json, math, re, sys
from datetime import datetime, date
from pathlib import Path

GENRE_ALIASES = {
    "Sci-Fi & Fantasy": ["Science Fiction", "Fantasy"],
    "Action & Adventure": ["Action", "Adventure"],
    "War & Politics": ["War"],
    "Sci-Fi": ["Science Fiction"],
}
VALID_GENRES = {
    "Action","Adventure","Animation","Comedy","Crime","Documentary","Drama","Family",
    "Fantasy","History","Horror","Music","Mystery","Romance","Science Fiction","TV Movie",
    "Thriller","War","Western","Kids","News","Reality","Soap","Talk",
}

def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def clean_genres(names):
    out = []
    for raw in names:
        if not raw: continue
        name = str(raw).strip()
        for g in GENRE_ALIASES.get(name, [name]):
            if g in VALID_GENRES and g not in out:
                out.append(g)
    return out

def parse_genres_movie(raw):
    try:
        data = ast.literal_eval(raw) if raw else []
        return clean_genres([d.get("name") for d in data if isinstance(d, dict)])
    except Exception:
        return []

def parse_date(value):
    value = (value or "").strip()
    if not value or value.startswith("0000"): return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date().isoformat()
    except Exception:
        return None

def num(value, default=0.0):
    try:
        f = float(value)
        if math.isnan(f) or math.isinf(f): return default
        return f
    except Exception:
        return default

def weighted_rating(rating, votes, mean, minimum=300):
    return (votes / (votes + minimum)) * rating + (minimum / (votes + minimum)) * mean

def trim(text, limit=700):
    text = re.sub(r"\s+", " ", (text or "")).strip()
    if len(text) <= limit: return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--movies", required=True)
    ap.add_argument("--tv", required=True)
    ap.add_argument("--credits", required=False)
    ap.add_argument("--out", default="src/data/catalog.json")
    ap.add_argument("--movie-cap", type=int, default=1700)
    ap.add_argument("--tv-cap", type=int, default=650)
    args = ap.parse_args()

    cast_by_movie = {}
    if args.credits and Path(args.credits).exists():
        with open(args.credits, encoding="utf-8", errors="replace") as f:
            for row in csv.DictReader(f):
                try:
                    mid = int(float(row["movie_id"]))
                    members = json.loads(row["cast"])[:8]
                except Exception:
                    continue
                cast_by_movie[mid] = [
                    {"id": m.get("id"), "name": m.get("name", ""),
                     "character": (m.get("character") or "")[:80]}
                    for m in members if m.get("name")
                ]

    movies, tv = [], []

    # ---------------- movies ----------------
    with open(args.movies, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            try:
                mid = int(float(row["id"]))
            except Exception:
                continue
            if str(row.get("adult", "")).lower() == "true": continue
            poster = (row.get("poster_path") or "").strip()
            if not poster.startswith("/"): continue
            overview = trim(row.get("overview"), 700)
            if len(overview) < 60: continue
            title = (row.get("title") or row.get("original_title") or "").strip()
            if not title: continue
            released = parse_date(row.get("release_date"))
            if not released or released > date.today().isoformat(): continue
            votes = int(num(row.get("vote_count")))
            rating = round(num(row.get("vote_average")), 1)
            is_arabic = (row.get("original_language") or "").strip() == "ar"
            if (votes < 25 and not is_arabic) or rating <= 0: continue
            genres = parse_genres_movie(row.get("genres"))
            if not genres: continue
            runtime = int(num(row.get("runtime")))
            movies.append({
                "id": mid, "type": "movie", "title": title,
                "originalTitle": (row.get("original_title") or title).strip(),
                "overview": overview, "tagline": trim(row.get("tagline"), 160) or None,
                "posterPath": poster,
                "backdropPath": None,
                "releaseDate": released, "rating": rating, "voteCount": votes,
                "popularity": round(num(row.get("popularity")), 2),
                "genres": genres, "genreSlugs": [slugify(g) for g in genres],
                "runtime": runtime or None, "seasons": None, "episodes": None,
                "originalLanguage": (row.get("original_language") or "").strip() or "en",
                "cast": cast_by_movie.get(mid, []), "creators": [],
            })

    seen = set(); unique = []
    for m in movies:
        if m["id"] in seen: continue
        seen.add(m["id"]); unique.append(m)
    mean = sum(m["rating"] for m in unique) / max(1, len(unique))
    for m in unique:
        m["_score"] = weighted_rating(m["rating"], m["voteCount"], mean)
    cap = args.movie_cap
    by_pop = sorted(unique, key=lambda m: m["popularity"], reverse=True)[: int(cap * 0.7)]
    by_rating = sorted(unique, key=lambda m: m["_score"], reverse=True)[: int(cap * 0.5)]
    by_recent = sorted(unique, key=lambda m: m["releaseDate"], reverse=True)[: int(cap * 0.25)]
    arabic = sorted(
        [m for m in unique if m["originalLanguage"] == "ar"],
        key=lambda m: (m["voteCount"], m["rating"]), reverse=True,
    )[:120]
    selected, ids = [], set()
    for group in (by_pop, by_rating, by_recent, arabic):
        for m in group:
            if len(selected) >= cap and m not in arabic: break
            if m["id"] in ids: continue
            ids.add(m["id"]); m.pop("_score", None); selected.append(m)

    # ---------------- tv ----------------
    with open(args.tv, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            try:
                tid = int(float(row["id"]))
            except Exception:
                continue
            poster = (row.get("poster_path") or "").strip()
            if not poster.startswith("/"): continue
            overview = trim(row.get("overview"), 700)
            if len(overview) < 50: continue
            name = (row.get("name") or "").strip()
            if not name: continue
            first = parse_date(row.get("first_air_date"))
            if not first: continue
            votes = int(num(row.get("vote_count")))
            rating = round(num(row.get("vote_average")), 1)
            is_arabic = (row.get("original_language") or "").strip() == "ar"
            if (votes < 30 and not is_arabic) or rating <= 0: continue
            genres = clean_genres((row.get("genres") or "").split(","))
            if not genres: continue
            seasons = int(num(row.get("number_of_seasons")))
            if seasons < 1: continue
            tv.append({
                "id": tid, "type": "tv", "title": name,
                "originalTitle": (row.get("original_name") or name).strip(),
                "overview": overview, "tagline": trim(row.get("tagline"), 160) or None,
                "posterPath": poster,
                "backdropPath": (row.get("backdrop_path") or "").strip() or None,
                "releaseDate": first, "rating": rating, "voteCount": votes,
                "popularity": round(num(row.get("popularity")), 2),
                "genres": genres, "genreSlugs": [slugify(g) for g in genres],
                "runtime": int(num(row.get("episode_run_time"))) or None,
                "seasons": seasons, "episodes": int(num(row.get("number_of_episodes"))) or None,
                "originalLanguage": (row.get("original_language") or "").strip() or "en",
                "status": (row.get("status") or "").strip() or None,
                "creators": [c.strip() for c in (row.get("created_by") or "").split(",") if c.strip()][:4],
                "cast": [],
            })
    seen_tv = set(); tvu = []
    for t in tv:
        if t["id"] in seen_tv: continue
        seen_tv.add(t["id"]); tvu.append(t)
    arabic_tv = sorted([t for t in tvu if t["originalLanguage"] == "ar"], key=lambda t: t["popularity"], reverse=True)[:150]
    tvt = sorted(tvu, key=lambda t: t["popularity"], reverse=True)[: args.tv_cap]
    tvt += [t for t in sorted(tvu, key=lambda t: t["rating"], reverse=True)[: 120] if t["id"] not in {x["id"] for x in tvt}]
    tvt += [t for t in arabic_tv if t["id"] not in {x["id"] for x in tvt}]
    tvt.sort(key=lambda t: t["popularity"], reverse=True)

    payload = {
        "generatedAt": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "source": "TMDB open exports (Kaggle datasets) — real metadata, used as offline fallback",
        "counts": {"movies": len(selected), "tv": len(tvt)},
        "titles": sorted(selected + tvt, key=lambda x: x["popularity"], reverse=True),
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    langs = {}
    for t in payload["titles"]:
        langs[t["originalLanguage"]] = langs.get(t["originalLanguage"], 0) + 1
    print(f"movies={len(selected)} tv={len(tvt)} total={len(payload['titles'])}")
    print(f"arabic movies={sum(1 for m in selected if m['originalLanguage']=='ar')}")
    print("top languages:", sorted(langs.items(), key=lambda kv: -kv[1])[:8])
    print("size MB:", round(out.stat().st_size / 1048576, 2))

if __name__ == "__main__":
    main()
