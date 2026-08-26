#!/usr/bin/env python3
"""Generate a compact in-repo KATOTTG snapshot from the official XLSX.

Uses only Python's standard library. The generated file is runtime data owned by
this package; no third-party geo package is required by consumers.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
PKG_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
UA_CODE_RE = re.compile(r"^UA[0-9A-Z]{17}$")
CATEGORY_CODES = {"O", "K", "P", "H", "M", "T", "C", "X", "B"}
TYPE_BY_CATEGORY = {
    "O": "region",
    "K": "special_city",
    "P": "district",
    "H": "community",
    "M": "city",
    "T": "urban_settlement",
    "C": "village",
    "X": "settlement",
    "B": "city_district",
}


def col_index(ref: str) -> int:
    letters = "".join(ch for ch in ref if ch.isalpha()).upper()
    out = 0
    for ch in letters:
        out = out * 26 + ord(ch) - 64
    return out - 1


def shared_strings(zf: zipfile.ZipFile) -> list[str]:
    try:
        root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    values = []
    for si in root.findall("m:si", NS):
        values.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
    return values


def first_sheet_path(zf: zipfile.ZipFile) -> str:
    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    sheet = wb.find("m:sheets/m:sheet", NS)
    if sheet is None:
        raise RuntimeError("XLSX contains no worksheets")
    rel_id = sheet.attrib[f"{{{NS['r']}}}id"]
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    for rel in rels:
        if rel.attrib.get("Id") == rel_id:
            target = rel.attrib["Target"].lstrip("/")
            return target if target.startswith("xl/") else f"xl/{target}"
    raise RuntimeError("Unable to resolve first worksheet")


def cell_value(cell: ET.Element, strings: list[str]) -> str:
    kind = cell.attrib.get("t")
    if kind == "inlineStr":
        return "".join(t.text or "" for t in cell.findall(".//m:t", NS)).strip()
    value = cell.find("m:v", NS)
    if value is None or value.text is None:
        return ""
    raw = value.text.strip()
    if kind == "s":
        try:
            return strings[int(raw)].strip()
        except (ValueError, IndexError):
            return raw
    return raw


def read_rows(payload: bytes) -> list[list[str]]:
    with zipfile.ZipFile(io.BytesIO(payload)) as zf:
        strings = shared_strings(zf)
        sheet_path = first_sheet_path(zf)
        root = ET.fromstring(zf.read(sheet_path))
        rows: list[list[str]] = []
        for row in root.findall(".//m:sheetData/m:row", NS):
            cells: dict[int, str] = {}
            for cell in row.findall("m:c", NS):
                cells[col_index(cell.attrib.get("r", "A1"))] = cell_value(cell, strings)
            if not cells:
                continue
            width = max(cells) + 1
            rows.append([cells.get(i, "").strip() for i in range(width)])
        return rows


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("\u00a0", " ")).strip()


def detect_header(rows: list[list[str]]) -> int:
    for i, row in enumerate(rows[:30]):
        joined = " | ".join(normalized(x).lower() for x in row)
        if "категор" in joined and ("назва" in joined or "наймен" in joined):
            return i
    # Official KATOTTG files sometimes have a title block and no conventional
    # header wording; data rows are still self-describing via UA code + category.
    return -1


def parse_records(rows: list[list[str]]) -> list[list[str | None]]:
    header_idx = detect_header(rows)
    records: list[list[str | None]] = []
    parent_by_depth: dict[int, str] = {}

    for raw_row in rows[header_idx + 1:]:
        row = [normalized(x) for x in raw_row]
        if not any(row):
            continue
        code_cells = [(idx, value) for idx, value in enumerate(row) if UA_CODE_RE.match(value)]
        if not code_cells:
            continue

        code_idx, code = code_cells[0]
        category = next((value for value in row if value in CATEGORY_CODES), None)
        if category is None:
            continue

        # The official sheet stores hierarchy codes across level columns. The
        # populated UA-code column therefore gives depth without relying on
        # localized header labels.
        earlier_codes = [idx for idx, value in code_cells if idx <= code_idx]
        depth = max(0, len(earlier_codes) - 1)

        # Prefer the text immediately after category; otherwise use the last
        # meaningful non-code, non-category value on the row.
        cat_idx = row.index(category)
        trailing = [v for v in row[cat_idx + 1:] if v and not UA_CODE_RE.match(v) and v not in CATEGORY_CODES]
        candidates = trailing or [v for v in row if v and not UA_CODE_RE.match(v) and v not in CATEGORY_CODES]
        if not candidates:
            continue
        name = candidates[-1]

        parent = parent_by_depth.get(depth - 1) if depth > 0 else None
        parent_by_depth[depth] = code
        for key in list(parent_by_depth):
            if key > depth:
                del parent_by_depth[key]

        records.append([code, name, category, TYPE_BY_CATEGORY[category], parent])

    # De-duplicate exact codes defensively while preserving source order.
    out: list[list[str | None]] = []
    seen: set[str] = set()
    for row in records:
        code = str(row[0])
        if code in seen:
            continue
        seen.add(code)
        out.append(row)
    return out


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "parsing-lexicon-katottg-generator/1"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--output", default="src/generated/ua-katottg.json")
    args = parser.parse_args()

    payload = fetch(args.url)
    rows = read_rows(payload)
    records = parse_records(rows)
    if len(records) < 20_000:
        raise RuntimeError(f"Refusing suspiciously small KATOTTG snapshot: {len(records)} records")

    counts: dict[str, int] = {}
    for _, _, category, *_ in records:
        counts[str(category)] = counts.get(str(category), 0) + 1

    data = {
        "meta": {
            "authority": "КАТОТТГ / Міністерство розвитку громад та територій України",
            "snapshot": args.snapshot,
            "source": args.url,
            "generated": True,
            "runtimeDependency": False,
            "recordCount": len(records),
            "countsByCategory": counts,
            "schema": ["code", "name", "category", "type", "parentCode"],
        },
        "rows": records,
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"generated {len(records)} KATOTTG rows -> {output}")


if __name__ == "__main__":
    main()
