import argparse
import pathlib, re, json, datetime, hashlib, os, sys
# Ensure utf-8 stdout on Windows cp1258 terminals
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Markdown → HTML (thư viện phaser md to html). Nếu thiếu, fallback giữ raw.
try:
    import markdown as md_lib
    HAS_MARKDOWN = True
except ImportError:
    HAS_MARKDOWN = False
    md_lib = None

def md_to_html(md_text: str) -> str:
    if not HAS_MARKDOWN or not md_text.strip():
        return ""
    try:
        # extra = tables + fenced_code + ... ; codehilite cho màu code (pygments)
        return md_lib.markdown(md_text, extensions=["extra", "tables", "fenced_code", "codehilite", "sane_lists"])
    except Exception:
        try:
            return md_lib.markdown(md_text, extensions=["extra", "tables", "fenced_code"])
        except Exception:
            return ""

def strip_nav_divs(md_text: str) -> str:
    """Bỏ các div điều hướng (<div align=...>Back to Top / MDN ...</div>, div anchor back-to-top)
    khỏi markdown TRƯỚC khi render HTML — chỉ ảnh hưởng contentHtml, raw giữ nguyên."""
    out = []
    for l in md_text.splitlines():
        s = l.strip()
        if s.startswith("<div") and "align=" in s and s.endswith("</div>"):
            continue
        if s.startswith("<div") and 'id="back-to-top"' in s and s.endswith("</div>"):
            continue
        out.append(l)
    cleaned = "\n".join(out)
    # gộp dòng trắng thừa do strip
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned

# Hỗ trợ chạy từ mọi CWD: mặc định lấy tmp_reference và src/data tương đối với script
SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
DEFAULT_SRC = SCRIPT_DIR.parent / "tmp_reference"
DEFAULT_SRC_VI = SCRIPT_DIR.parent / "tmp_reference_vi"
DEFAULT_OUT = SCRIPT_DIR.parent / "src" / "data"

# Map ngôn ngữ → thư mục nguồn .md và thư mục output .json
LANG_CONFIG = {
    "en": {"src": DEFAULT_SRC, "out": DEFAULT_OUT / "en"},
    "vi": {"src": DEFAULT_SRC_VI, "out": DEFAULT_OUT / "vi"},
}

parser = argparse.ArgumentParser(description="Generate structured JSON from javascript-cheat-sheet markdown")
parser.add_argument("--src", type=pathlib.Path, default=DEFAULT_SRC, help="path to tmp_reference (contains *.md)")
parser.add_argument("--out", type=pathlib.Path, default=DEFAULT_OUT, help="output path for *.json")
parser.add_argument("--lang", type=str, default="all", choices=["en", "vi", "all"], help="language to generate (en, vi, or all)")
args = parser.parse_args()

# Xác định danh sách (lang, src_dir, out_dir) cần generate
custom_paths = (args.src != DEFAULT_SRC) or (args.out != DEFAULT_OUT)
runs = []
if custom_paths:
    # custom mode: 1 lần chạy với src/out tuỳ chỉnh, lang dùng để ghi metadata
    lang = args.lang if args.lang in ("en", "vi") else "en"
    runs.append((lang, args.src, args.out))
elif args.lang == "all":
    for lang in ["en", "vi"]:
        cfg = LANG_CONFIG[lang]
        runs.append((lang, cfg["src"], cfg["out"]))
else:
    cfg = LANG_CONFIG[args.lang]
    runs.append((args.lang, cfg["src"], cfg["out"]))

# Category mapping
CATEGORY_MAP = {
    "array-examples.md": {"category": "array", "tags": ["array", "collection", "list"]},
    "string-examples.md": {"category": "string", "tags": ["string", "text"]},
    "object-examples.md": {"category": "object", "tags": ["object", "prototype", "class", "oop"]},
    "function-examples.md": {"category": "function", "tags": ["function", "closure", "higher-order", "callback"]},
    "loop-examples.md": {"category": "loop", "tags": ["loop", "iteration", "for", "while"]},
    "conditionals-examples.md": {"category": "conditional", "tags": ["conditional", "if", "ternary", "switch", "boolean"]},
    "number-date-examples.md": {"category": "number-date", "tags": ["number", "math", "date", "numeric"]},
    "regex-examples.md": {"category": "regex", "tags": ["regex", "regexp", "pattern", "string"]},
    "notes.md": {"category": "notes", "tags": ["notes", "es6", "concepts", "dom"]},
    "README.md": {"category": "cheatsheet", "tags": ["cheatsheet", "overview", "comparison", "reference"]},
    "fcc-lessons.md": {"category": "fcc", "tags": ["fcc", "freecodecamp", "curriculum"]},
    "practical-examples.md": {"category": "practical", "tags": ["practical", "real-world", "example"]},
    "react.md": {"category": "react", "tags": ["react", "jsx", "component", "hooks"]},
}

TITLE_FALLBACK = {
    "README.md": "Vanilla JavaScript Cheat Sheet",
}

def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

def extract_mdn_url(content: str):
    m = re.search(r"https://developer\.mozilla\.org[^\"]+\)?", content)
    if m:
        url = m.group(0).rstrip(")\"")
        return url
    return None

def extract_code_blocks(content: str):
    return re.findall(r"```(?:js|javascript)?\n(.*?)```", content, re.S)

def extract_tables(content: str):
    lines = content.splitlines()
    tables=[]
    cur=[]
    for l in lines:
        if l.strip().startswith("|"):
            cur.append(l)
        else:
            if cur:
                # table block
                if len(cur)>=2:
                    tables.append("\n".join(cur))
                cur=[]
    if cur and len(cur)>=2:
        tables.append("\n".join(cur))
    return tables

def parse_markdown_file(path: pathlib.Path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    fname = path.name
    # get first title h1
    m = re.search(r"^#\s+(.+)", text, re.M)
    title = m.group(1).strip() if m else TITLE_FALLBACK.get(fname, fname.replace(".md",""))
    # description = first paragraph after title or first blockquote
    desc = ""
    # try to find first non-heading paragraph
    lines = text.splitlines()
    for i,l in enumerate(lines):
        if l.strip() and not l.strip().startswith("#") and not l.strip().startswith("<") and not l.strip().startswith("|") and not l.strip().startswith(">") and not l.strip().startswith("```") and not l.strip().startswith("[") and not l.strip().startswith("div") and len(l.strip())>20:
            desc = l.strip()
            break
    # fallback to blockquote
    if not desc:
        m2 = re.search(r"^>\s*(.+)", text, re.M)
        if m2:
            desc = m2.group(1).strip()
    meta = CATEGORY_MAP.get(fname, {"category": slugify(fname.replace(".md","")), "tags": []})
    category = meta["category"]
    base_tags = meta["tags"]

    # Find all headings
    heading_pat = re.compile(r"^(#{1,6})\s+(.+)", re.M)
    headings = list(heading_pat.finditer(text))
    sections=[]
    # For each heading level 2 or 3 etc, create section
    # Strategy: treat h2 and h3 and h4 as sections, with content until next heading of same or higher level
    for idx, h in enumerate(headings):
        level = len(h.group(1))
        raw_title = h.group(2).strip()
        # clean html tags, markdown formatting
        clean_title = re.sub(r"<[^>]+>", "", raw_title)
        clean_title = re.sub(r"[*_`]", "", clean_title).strip()
        # skip generic headings like "Table of contents", "Table Comparisons" is ok but we will filter later
        if clean_title.lower() in ["table of contents", "table of contents ", "mục lục"] :
            continue
        # anchor
        anchor = "#" + slugify(clean_title)
        start = h.end()
        # find end: next heading (any level) for leaf content — avoids duplicating wrapper h2 aggregations
        # fallback to next same-or-higher level aggregation for legacy, but we prefer immediate next
        end = len(text)
        if idx + 1 < len(headings):
            end = headings[idx + 1].start()
        content = text[start:end].strip()
        if not content or len(content) < 20:
            continue
        # For README, we keep tables sections, but for others main sections are h3/h4
        # Filter out very large TOC sections without real content
        if level == 1 and idx==0:
            continue
        # For level 2 that contains mostly TOC tables without substance, skip if content is mostly markdown table of links
        if level == 2 and "Table of contents" in clean_title:
            continue

        # Extract code blocks, tables, mdn url, summary
        code_blocks = extract_code_blocks(content)
        # syntax = first code block first line if looks like syntax
        syntax = None
        if code_blocks:
            first_block = code_blocks[0].strip().splitlines()
            # heuristic: first line contains '(' or '=' or '.' and short
            if first_block:
                candidate = first_block[0].strip()
                if len(candidate) < 120 and ("(" in candidate or "." in candidate or "=>" in candidate):
                    # if comment // syntax:
                    if candidate.startswith("//"):
                        # next line is syntax
                        if len(first_block)>1:
                            syntax = first_block[1].strip()
                        else:
                            syntax = candidate.lstrip("/ ").strip()
                    else:
                        syntax = candidate
                # also try to detect // syntax: line
                for line in first_block[:3]:
                    if "syntax" in line.lower():
                        # next line after syntax comment
                        idx2 = first_block.index(line)
                        if idx2+1 < len(first_block):
                            syntax = first_block[idx2+1].strip()
                        break
        # summary = first sentence/paragraph before code block
        # take first non-empty line not starting with ```, |, <, [
        summary = ""
        for l in content.splitlines():
            s=l.strip()
            if not s: continue
            if s.startswith("```") or s.startswith("|") or s.startswith("<div") or s.startswith("<") or s.startswith("[") or s.startswith("!") or s.startswith("#"):
                continue
            # remove markdown formatting
            s_clean = re.sub(r"[*_`<>\"]", "", s)
            s_clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", s_clean)
            if len(s_clean) < 10: continue
            summary = s_clean[:300]
            # trim to sentence
            if ". " in summary:
                summary = summary.split(". ")[0] + "."
            break
        if not summary:
            summary = clean_title

        # keywords generation
        keywords = set()
        # tokens from title
        for tok in re.findall(r"\w+", clean_title.lower()):
            if len(tok) >=2:
                keywords.add(tok)
        # add category
        keywords.add(category)
        # add tags
        for t in base_tags:
            keywords.add(t)
        # add syntax tokens
        if syntax:
            for tok in re.findall(r"\w+", syntax.lower()):
                if len(tok)>=2 and tok not in ["let","const","var","function"]:
                    keywords.add(tok)
        # also search for known JS keywords in content
        # extract returns / mutates hints
        returns = None
        mutates = None
        lower_content = content.lower()
        if "returns" in lower_content:
            mret = re.search(r"returns?\s+([^.\n]+)", content, re.I)
            if mret:
                returns = mret.group(1).strip()[:120]
                # clean html
                returns = re.sub(r"<[^>]+>", "", returns)
                returns = returns.strip(" *")
        if "mutat" in lower_content:
            mutates = "mutate" in lower_content or "mutates" in lower_content
            # more precise: "does not mutate" vs "mutates"
            if "does not mutate" in lower_content or "not mutating" in lower_content or "doesn't mutate" in lower_content:
                mutates = False
            elif "mutates" in lower_content:
                mutates = True

        # related: find links to other anchors in same file
        related = re.findall(r"\[([^\]]+)\]\(#([^\)]+)\)", content)
        related = [r[0] for r in related][:5]

        # mdn url
        mdn = extract_mdn_url(content)
        tables = extract_tables(content)
        # examples: structured from code blocks
        examples = []
        for cb in code_blocks[:5]: # limit 5 per section
            # skip empty
            cb = cb.strip()
            if len(cb) < 5:
                continue
            # try to extract output comments // => or // 
            examples.append({
                "code": cb[:1500],
                "explanation": summary[:200] if cb==code_blocks[0] else ""
            })

        # content truncated for search
        search_text_parts = [clean_title, summary, syntax or "", " ".join(keywords)]
        if returns: search_text_parts.append(returns)
        search_text = " ".join(search_text_parts).lower()
        # html render từ markdown nguyên (đã strip div điều hướng — raw giữ nguyên)
        content_html = md_to_html(strip_nav_divs(content)) if content else ""

        # create id
        id_slug = f"{category}-{slugify(clean_title)}"

        sections.append({
            "id": id_slug,
            "title": clean_title,
            "headingLevel": level,
            "anchor": anchor,
            "summary": summary[:500],
            "keywords": sorted(keywords),
            "syntax": syntax,
            "returns": returns,
            "mutates": mutates,
            "mdnUrl": mdn,
            "examples": examples,
            "tables": tables[:2], # keep at most 2 tables (legacy, html đã chứa bảng đầy đủ)
            "related": related,
            "content": content[:15000], # raw markdown nguyên — tăng từ 4000 lên 15000 để không cắt mất bảng/code
            "contentHtml": content_html[:20000], # html đã phaser — dùng hiển thị chính (bảng + code có màu)
            "searchText": search_text[:1000],
            "sourceFile": fname,
            "category": category
        })

    # deduplicate ids
    seen={}
    for s in sections:
        base=s["id"]
        if base in seen:
            seen[base]+=1
            s["id"]=f"{base}-{seen[base]}"
        else:
            seen[base]=1

    doc = {
        "sourceFile": fname,
        "sourceUrl": f"https://github.com/Kernix13/javascript-cheat-sheet/blob/main/{fname}",
        "category": category,
        "title": title,
        "description": desc[:500],
        "tags": base_tags,
        "totalSections": len(sections),
        "sections": sections
    }
    return doc

def generate_lang(lang: str, src_dir: pathlib.Path, out_dir: pathlib.Path):
    src_dir = src_dir.resolve()
    out_dir = out_dir.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n=== Generating language: {lang} ===")
    print(f"SRC_DIR={src_dir}")
    print(f"OUT_DIR={out_dir}")

    all_docs = []
    for p in sorted(src_dir.glob("*.md")):
        if p.name.startswith("_"):
            continue
        doc = parse_markdown_file(p)
        all_docs.append(doc)
        out_path = out_dir / (p.stem + ".json")
        out_path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {out_path.name}: {doc['totalSections']} sections, title: {doc['title'][:60]}")

    # Build master index
    entries = []
    for doc in all_docs:
        for sec in doc["sections"]:
            entries.append({
                "id": sec["id"],
                "title": sec["title"],
                "category": sec["category"],
                "sourceFile": sec["sourceFile"],
                "anchor": sec["anchor"],
                "summary": sec["summary"],
                "keywords": sec["keywords"],
                "syntax": sec["syntax"],
                "returns": sec["returns"],
                "mutates": sec["mutates"],
                "mdnUrl": sec["mdnUrl"],
                "searchText": sec["searchText"],
                "tags": doc["tags"]
            })

    # Sort entries by category then title
    entries.sort(key=lambda x: (x["category"], x["title"].lower()))

    # keyword index: map keyword -> list of ids
    keyword_index = {}
    for e in entries:
        for kw in e["keywords"]:
            keyword_index.setdefault(kw, []).append(e["id"])

    index_doc = {
        "version": "1.0.0",
        "lang": lang,
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "generator": "generate_docs.py from Kernix13/javascript-cheat-sheet",
        "sourceRepo": "https://github.com/Kernix13/javascript-cheat-sheet",
        "totalSources": len(all_docs),
        "totalEntries": len(entries),
        "categories": sorted(list(set(d["category"] for d in all_docs))),
        "entries": entries,
        "keywordIndex": keyword_index,
        "sources": [{"file": d["sourceFile"], "title": d["title"], "category": d["category"], "sections": d["totalSections"]} for d in all_docs]
    }

    # Write index
    (out_dir / "index.json").write_text(json.dumps(index_doc, ensure_ascii=False, indent=2), encoding="utf-8")
    # Write aggregated all.json
    (out_dir / "all.json").write_text(json.dumps({"docs": all_docs, "index": index_doc}, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nIndex: {len(entries)} entries, {len(keyword_index)} unique keywords")
    print(f"Categories: {index_doc['categories']}")
    # also output stats for README
    for d in all_docs:
        print(f"{d['sourceFile']}: {d['totalSections']} sections")

    # quick validation: ensure no empty
    assert len(entries) > 100, "too few entries"

for lang, src_dir, out_dir in runs:
    generate_lang(lang, src_dir, out_dir)
