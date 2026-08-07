import re

with open('src/AppWorkspace.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const provider = monaco.languages.registerCompletionItemProvider("sql", {')
end_idx = content.find('completionProviderRef.current = provider;', start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len('completionProviderRef.current = provider;')
    
    replacement = 'const sqlProviders = registerSqlAutocomplete(monaco, editor, tableSchemas, liveSchemaRef, sqlUpperKeywordsRef);\n    completionProviderRef.current = sqlProviders as any;'
    
    new_content = content[:start_idx] + replacement + content[end_idx:]
    
    import_stmt = 'import { registerSqlAutocomplete } from "./utils/sqlAutocompleteProvider";\n'
    if import_stmt not in new_content:
        new_content = new_content.replace('import { SplitPane, VSplitPane }', import_stmt + 'import { SplitPane, VSplitPane }')
        
    with open('src/AppWorkspace.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully replaced autocomplete block.')
else:
    print(f'Indices not found: start_idx={start_idx}, end_idx={end_idx}')
