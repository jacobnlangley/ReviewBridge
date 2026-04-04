#!/usr/bin/env bash

set -euo pipefail

YES=0
DUMP_FILE=""
SCHEMA="${CLONE_SCHEMA:-public}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --)
      shift
      ;;
    --yes)
      YES=1
      shift
      ;;
    --dump-file)
      DUMP_FILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      cat <<'EOF'
Usage:
  PROD_DATABASE_URL='postgresql://...' DEV_DATABASE_URL='postgresql://...' bash scripts/db/clone-prod-to-dev.sh --yes

Options:
  --yes                Skip interactive confirmation.
  --dump-file <path>   Reuse/write dump file path.
  --schema <name>      Schema to clone (default: public).
  -h, --help           Show this help.

Notes:
  - This script overwrites objects in the target schema.
  - Uses pg_dump + pg_restore with --clean --if-exists.
  - Default behavior clones only the public schema.
  - Set KEEP_DUMP=1 to keep dump artifact after restore.
EOF
      exit 0
      ;;
    --schema)
      SCHEMA="${2:-}"
      shift 2
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  printf 'Missing PROD_DATABASE_URL\n' >&2
  exit 1
fi

if [[ -z "${DEV_DATABASE_URL:-}" ]]; then
  printf 'Missing DEV_DATABASE_URL\n' >&2
  exit 1
fi

if [[ "${PROD_DATABASE_URL}" == "${DEV_DATABASE_URL}" ]]; then
  printf 'PROD_DATABASE_URL and DEV_DATABASE_URL are identical. Aborting.\n' >&2
  exit 1
fi

if [[ -z "${DUMP_FILE}" ]]; then
  ts=$(date +%Y%m%d_%H%M%S)
  DUMP_FILE="/tmp/attune-bridge-prod-to-dev-${ts}.dump"
fi

if [[ "${YES}" -ne 1 ]]; then
  printf 'This will overwrite the DEV database using PROD data.\n' >&2
  printf 'Type "clone prod to dev" to continue: ' >&2
  read -r confirmation
  if [[ "${confirmation}" != "clone prod to dev" ]]; then
    printf 'Confirmation failed. Aborting.\n' >&2
    exit 1
  fi
fi

printf 'Creating dump: %s\n' "${DUMP_FILE}"
pg_dump "${PROD_DATABASE_URL}" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --schema "${SCHEMA}" \
  --file "${DUMP_FILE}"

printf 'Restoring dump into DEV database...\n'
pg_restore "${DUMP_FILE}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --schema "${SCHEMA}" \
  --dbname "${DEV_DATABASE_URL}"

printf 'Clone complete.\n'

if [[ "${KEEP_DUMP:-0}" == "1" ]]; then
  printf 'Keeping dump file: %s\n' "${DUMP_FILE}"
else
  rm -f "${DUMP_FILE}"
  printf 'Removed dump file: %s\n' "${DUMP_FILE}"
fi
