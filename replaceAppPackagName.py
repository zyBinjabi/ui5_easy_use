import os

def replace_in_file(file_path, replacements):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_directory(directory):
    replacements = {
        "${AppName}": "${ez5.appName}",
        "${PackageName}": "${ez5.packageName}"
    }
    
    
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            replace_in_file(file_path, replacements)

if __name__ == "__main__":
    process_directory("./mypackage")
