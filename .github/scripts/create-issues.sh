#!/bin/bash
set -euo pipefail

REPO="Lukasavicus/baby-health"
PROJECT_NUM=4
PROJECT_ID="PVT_kwHOAHoSM84BT9OT"
STATUS_FIELD_ID="PVTSSF_lAHOAHoSM84BT9OTzhBIl58"
TODO_ID="f75ad846"
DOCS_DIR="/Users/lucassilva/Documents/90.LUKE/2.PROJECTS/[DEV] BabyHealth/docs"
MAPPING_FILE="/tmp/babyhealth-issue-mapping.txt"

touch "$MAPPING_FILE"

get_priority() {
  local ep_num="$1"
  case "$ep_num" in
    1|2|3|4|5|6|7|8) echo "P0" ;;
    9|10|11) echo "P1" ;;
    *) echo "P0" ;;
  esac
}

create_issue_and_add() {
  local title="$1"
  local body_file="$2"
  local labels="$3"

  local url
  url=$(gh issue create --repo "$REPO" --title "$title" --body-file "$body_file" --label "$labels" 2>&1) || true

  if [ -n "$url" ]; then
    local num
    num=$(echo "$url" | grep -oE '[0-9]+$' || echo "?")
    echo "$title|$num|$url" >> "$MAPPING_FILE"

    local item_id
    item_id=$(gh project item-add "$PROJECT_NUM" --owner Lukasavicus --url "$url" --format json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")

    if [ -n "$item_id" ]; then
      gh project item-edit --project-id "$PROJECT_ID" --id "$item_id" --field-id "$STATUS_FIELD_ID" --single-select-option-id "$TODO_ID" 2>/dev/null || true
    fi
    echo "  ✓ #$num $title"
  else
    echo "  ✗ FAILED: $title"
  fi
}

process_dir() {
  local dir="$1"
  local prefix="$2"
  local type_label="$3"

  for f in "$dir"/${prefix}-*.md; do
    [ -f "$f" ] || continue
    local base
    base=$(basename "$f" .md)
    local ep_raw
    ep_raw=$(echo "$base" | sed -E "s/^${prefix}-0*([0-9]+).*/\1/")
    local ep_padded
    ep_padded=$(printf '%02d' "$ep_raw")
    local title
    title=$(head -1 "$f" | sed 's/^# //')
    local priority
    priority=$(get_priority "$ep_raw")
    create_issue_and_add "$title" "$f" "${type_label},${priority},EP-${ep_padded}"
  done
}

MODE="${1:-all}"

case "$MODE" in
  features)
    echo "=== Creating Feature Issues ==="
    process_dir "$DOCS_DIR/features" "FE" "feature"
    ;;
  stories)
    echo "=== Creating Story Issues ==="
    process_dir "$DOCS_DIR/stories" "US" "story"
    ;;
  tasks)
    echo "=== Creating Task Issues ==="
    process_dir "$DOCS_DIR/tasks" "TK" "task"
    ;;
  all)
    echo "=== Creating Feature Issues ==="
    process_dir "$DOCS_DIR/features" "FE" "feature"
    echo ""
    echo "=== Creating Story Issues ==="
    process_dir "$DOCS_DIR/stories" "US" "story"
    echo ""
    echo "=== Creating Task Issues ==="
    process_dir "$DOCS_DIR/tasks" "TK" "task"
    ;;
esac

echo ""
echo "=== Summary ==="
echo "Total issues in mapping: $(wc -l < "$MAPPING_FILE" | tr -d ' ')"
