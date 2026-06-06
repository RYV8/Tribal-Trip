#!/bin/sh
set -eu

: "${TRIBE_TRIP_API_URL:=/api}"

escaped_api_url=$(printf '%s' "$TRIBE_TRIP_API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.TRIBE_TRIP_CONFIG = Object.assign(
  {
    apiUrl: "$escaped_api_url",
  },
  window.TRIBE_TRIP_CONFIG || {},
)
EOF
