import re

file_path = 'E:/codex/core/src/views/PlaygroundView.tsx'
with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()

content = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.01\s*\)', 'var(--panel)', content)
content = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.03\s*\)', 'var(--border)', content)

# I should also replace hardcoded #fff or #ffffff in PlayGroundView if it's used for text.
# Wait, let's search for #fff first before blind replacing.

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)

print("Updated remaining rgba in PlaygroundView.")
