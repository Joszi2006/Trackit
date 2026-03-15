#!/usr/bin/env python3
"""
Trackit design principles enforcement hook.
Runs before every Write and Edit tool call.
Blocks writes that violate layer boundaries or basic structure rules.
"""

import json
import sys
import re

data = json.load(sys.stdin)
tool_input = data.get('tool_input', {})

# Handle both possible field names across tool types
file_path = tool_input.get('file_path', tool_input.get('path', ''))
# Write uses 'content', Edit uses 'new_string', newer API uses 'file_text'
content = tool_input.get('content',
          tool_input.get('new_string',
          tool_input.get('file_text', '')))

if not file_path or not content:
    sys.exit(0)

issues = []
lines = content.split('\n')

# ─────────────────────────────────────────────
# 1. Layer boundary violations
# ─────────────────────────────────────────────

in_frontend = '/frontend/' in file_path or '/(pages)/' in file_path
in_backend  = '/backend/' in file_path
in_api_route = '/app/api/' in file_path
in_page = file_path.endswith('page.tsx') or file_path.endswith('layout.tsx')

backend_import = re.search(r"from ['\"](@/backend|\.\.?/.*backend)", content)
frontend_import = re.search(r"from ['\"](@/frontend|\.\.?/.*frontend)", content)
prisma_usage = re.search(r"(prisma\.|PrismaClient|@prisma/client)", content)

if (in_frontend or in_page) and backend_import:
    issues.append(
        "LAYER VIOLATION: Frontend file imports directly from backend/.\n"
        "  Fix: fetch data through an API route instead.\n"
        f"  Import found: {backend_import.group(0)}"
    )

if in_backend and frontend_import:
    issues.append(
        "LAYER VIOLATION: Backend file imports from frontend/.\n"
        "  Fix: backend must never depend on frontend code.\n"
        f"  Import found: {frontend_import.group(0)}"
    )

if (in_frontend or in_page) and prisma_usage:
    issues.append(
        "DB VIOLATION: Prisma/database access in frontend code.\n"
        "  Fix: all DB calls belong in backend/ — use an API route."
    )

# ─────────────────────────────────────────────
# 2. Fat API routes
# ─────────────────────────────────────────────

if in_api_route and len(lines) > 60:
    issues.append(
        f"FAT ROUTE: API route is {len(lines)} lines — routes must be thin.\n"
        "  Fix: move business logic into the appropriate backend/engine/ file.\n"
        "  Rule: route handler should parse request → call one backend function → return response."
    )

# ─────────────────────────────────────────────
# 3. Business logic in pages
# ─────────────────────────────────────────────

if in_page:
    algo_patterns = re.search(
        r"(\.filter\(|\.reduce\(|\.sort\(|if \(.*&&.*&&|for \(let)",
        content
    )
    if algo_patterns:
        issues.append(
            "LOGIC IN PAGE: Algorithmic logic detected in a page component.\n"
            "  Fix: pages are thin shells — move logic to a hook in frontend/hooks/\n"
            "  or a backend function, then consume it here."
        )

# ─────────────────────────────────────────────
# 4. File length
# ─────────────────────────────────────────────

if len(lines) > 350:
    issues.append(
        f"FILE TOO LONG: {len(lines)} lines exceeds the 350-line limit.\n"
        "  Fix: split by responsibility — one concept per file."
    )

# ─────────────────────────────────────────────
# 5. Function length (rough heuristic)
# ─────────────────────────────────────────────

current_fn_lines = 0
current_fn_name = ''
max_fn_lines = 0
max_fn_name = ''
brace_depth = 0
in_function = False

for line in lines:
    fn_match = re.search(r'(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\()', line)
    if fn_match and '{' in line:
        in_function = True
        current_fn_lines = 0
        current_fn_name = fn_match.group(1) or fn_match.group(2) or 'anonymous'
        brace_depth = line.count('{') - line.count('}')
    elif in_function:
        current_fn_lines += 1
        brace_depth += line.count('{') - line.count('}')
        if brace_depth <= 0:
            if current_fn_lines > max_fn_lines:
                max_fn_lines = current_fn_lines
                max_fn_name = current_fn_name
            in_function = False

if max_fn_lines > 60:
    issues.append(
        f"LONG FUNCTION: `{max_fn_name}` is ~{max_fn_lines} lines — target is under 60.\n"
        "  Fix: extract cohesive sub-steps into named helper functions."
    )

# ─────────────────────────────────────────────
# 6. Too many exports (god file)
# ─────────────────────────────────────────────

export_count = len(re.findall(r'^export (const|function|class|async function)', content, re.MULTILINE))
if export_count > 8:
    issues.append(
        f"GOD FILE: {export_count} exports in one file — target is under 8.\n"
        "  Fix: group by responsibility and split into separate files."
    )

# ─────────────────────────────────────────────
# 7. Hardcoded secrets / env values
# ─────────────────────────────────────────────

secret_pattern = re.search(r'(sk-ant-|postgresql://[^$].*@|password\s*[:=]\s*["\'][^"\']{6,})', content)
if secret_pattern and '.env' not in file_path and 'example' not in file_path:
    issues.append(
        "SECRET DETECTED: Hardcoded credential or connection string found.\n"
        "  Fix: use process.env.YOUR_VAR instead."
    )

# ─────────────────────────────────────────────
# Output
# ─────────────────────────────────────────────

if issues:
    separator = '\n' + '─' * 60 + '\n'
    message = separator
    message += f"DESIGN CHECK FAILED — {len(issues)} issue(s) in {file_path.split('/')[-1]}\n"
    message += separator
    for i, issue in enumerate(issues, 1):
        message += f"\n[{i}] {issue}\n"
    message += separator
    message += "Fix the issues above before writing this file.\n"
    print(message, file=sys.stderr)
    sys.exit(2)

sys.exit(0)
