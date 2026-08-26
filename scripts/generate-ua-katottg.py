#!/usr/bin/env python3
"""Generate compact in-repo KATOTTG snapshots from the official XLSX.

Uses only Python's standard library. Generated JSON is useful for auditing and
raw-data inspection; generated ESM is consumed at runtime without fs access,
JSON import attributes, or third-party geo dependencies.
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
    return ["".join(t.text or "" for t in si.findall(".//m:t", NS))
            for si in root.findall("m:si", NS)]


def worksheet_paths(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    by_id = {rel.attrib.get("Id"): rel.attrib.get("Target", "") for rel in rels}
    result = []
    for sheet in wb.findall("m:sheets/m:sheet", NS):
        rel_id = sheet.attrib.get(f"{{{NS['r']}}}id")
        target = by_id.get(rel_id, "").lstrip("/")
        if not target:
            continue
        path = target if target.startswith("xl/") else f"xl/{target}"
        result.append((sheet.attrib.get("name", path), path))
    if not result:
        raise RuntimeError("XLSX contains no worksheets")
    return result


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


def sheet_rows(zf: zipfile.ZipFile, path: str, strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(zf.read(path))
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


def read_rows(payload: bytes) -> list[list[str]]:
    with zipfile.ZipFile(io.BytesIO(payload)) as zf:
        strings = shared_strings(zf)
        candidates = []
        for name, path in worksheet_paths(zf):
            rows = sheet_rows(zf, path, strings)
            code_count = sum(1 for row in rows for value in row if UA_CODE_RE.match(value.strip()))
            candidates.append((code_count, name, rows))
            print(f"worksheet {name!r}: {len(rows)} rows, {code_count} KATOTTG codes")
        code_count, name, rows = max(candidates, key=lambda item: item[0])
        print(f"selected worksheet {name!r} with {code_count} KATOTTG codes")
        return rows


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("\u00a0", " ")).strip()


def detect_header(rows: list[list[str]]) -> int:
    for i, row in enumerate(rows[:50]):
        joined = " | ".join(normalized(x).lower() for x in row)
        if "категор" in joined and ("назва" in joined or "наймен" in joined):
            return i
    return -1


def parse_records(rows: list[list[str]]) -> list[list[str | None]]:
    header_idx = detect_header(rows)
    normalized_rows = [[normalized(x) for x in row] for row in rows[header_idx + 1:]]
    records: list[list[str | None]] = []

    for row in normalized_rows:
        if not any(row):
            continue
        code_cells = [(idx, value) for idx, value in enumerate(row) if UA_CODE_RE.match(value)]
        if not code_cells:
            continue
        _, code = code_cells[-1]
        category = next((value for value in row if value in CATEGORY_CODES), None)
        if category is None:
            continue

        cat_idx = row.index(category)
        trailing = [v for v in row[cat_idx + 1:]
                    if v and not UA_CODE_RE.match(v) and v not in CATEGORY_CODES]
        candidates = trailing or [v for v in row
                                  if v and not UA_CODE_RE.match(v) and v not in CATEGORY_CODES]
        if not candidates:
            continue
        name = candidates[-1]

        # Every official row repeats its hierarchy through the current object;
        # the previous UA code on this exact row is therefore its source parent.
        parent = code_cells[-2][1] if len(code_cells) > 1 else None
        records.append([code, name, category, TYPE_BY_CATEGORY[category], parent])

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
    parser.add_argument("--module-output", default="src/generated/ua-katottg.js")
    args = parser.parse_args()

    payload = fetch(args.url)
    rows = read_rows(payload)
    records = parse_records(rows)
    if len(records) < 20_000:
        raise RuntimeError(f"Refusing suspiciously small KATOTTG snapshot: {len(records)} records")

    counts: dict[str, int] = {}
    for _, _, category, *_ in records:
        counts[str(category)] = counts.get(str(category), 0) + 1

    meta = {
        "authority": "КАТОТТГ / Міністерство розвитку громад та територій України",
        "snapshot": args.snapshot,
        "source": args.url,
        "generated": True,
        "runtimeDependency": False,
        "recordCount": len(records),
        "countsByCategory": counts,
        "schema": ["code", "name", "category", "type", "parentCode"],
    }
    data = {"meta": meta, "rows": records}

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    compact_meta = json.dumps(meta, ensure_ascii=False, separators=(",", ":"))
    compact_rows = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    output.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    module_output = Path(args.module_output)
    module_output.parent.mkdir(parents=True, exist_ok=True)
    module_output.write_text(
        "// Generated by scripts/generate-ua-katottg.py. Do not edit manually.\n"
        f"export const UA_KATOTTG_META = Object.freeze({compact_meta});\n"
        f"export const UA_KATOTTG_ROWS = Object.freeze({compact_rows});\n",
        encoding="utf-8",
    )
    print(f"generated {len(records)} KATOTTG rows -> {output}, {module_output}")


if __name__ == "__main__":
    main()
