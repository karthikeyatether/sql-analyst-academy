import re
import glob

def replace_rgba(text):
    # Replacements for dark backgrounds usually -> var(--panel) or var(--glass-panel-bg)
    text = re.sub(r'rgba\(\s*21,\s*26,\s*38,\s*0\.92\s*\)', 'var(--glass-panel-bg)', text)
    text = re.sub(r'rgba\(\s*0,\s*0,\s*0,\s*0\.35\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*0,\s*0,\s*0,\s*0\.7\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*0,\s*0,\s*0,\s*0\.2\s*\)', 'var(--panel)', text)
    
    # Replacements for light borders -> var(--glass-border) or var(--border)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.08\s*\)', 'var(--glass-border)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.12\s*\)', 'var(--border)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.1\s*\)', 'var(--border)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.03\s*\)', 'var(--border)', text)
    
    # Replacements for subtle white backgrounds -> var(--panel) or var(--glass-panel-bg)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.01\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.02\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.025\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.04\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.05\s*\)', 'var(--panel)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.06\s*\)', 'var(--panel)', text)

    # Replacements for white text -> var(--text) or var(--muted)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.95\s*\)', 'var(--text)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.9\s*\)', 'var(--text)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.85\s*\)', 'var(--text)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.7\s*\)', 'var(--muted)', text)
    text = re.sub(r'rgba\(\s*255,\s*255,\s*255,\s*0\.6\s*\)', 'var(--muted)', text)

    return text

files = glob.glob('E:/codex/core/src/components/*.tsx') + glob.glob('E:/codex/core/src/views/*.tsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = replace_rgba(content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")

