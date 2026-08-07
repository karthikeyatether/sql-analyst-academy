import re

file_path = 'E:/codex/core/src/AppWorkspace.tsx'
with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()

# Toast background:
content = re.sub(r'rgba\(\s*31,\s*41,\s*55,\s*0\.95\s*\)', 'var(--glass-panel-bg)', content)
# Toast color:
content = re.sub(r'color: "#fff",', 'color: "var(--text)",', content)

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)

print("Updated AppWorkspace.tsx toast styles.")
