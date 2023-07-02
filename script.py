import os
import json

def generate_table_from_folders(directory):
    table = []
    folder_count = 0
    
    folder_names = sorted(os.listdir(directory))
    
    for folder_name in folder_names:
        if os.path.isdir(os.path.join(directory, folder_name)):
            table.append({"name": folder_name})
            folder_count += 1
    
    return table, folder_count

# Podaj ścieżkę do katalogu, w którym znajdują się foldery
directory_path = "/home/Oberon/Website/Oberon05-dev.github.io/napisy"

table_data, num_folders = generate_table_from_folders(directory_path)

# Podaj ścieżkę i nazwę pliku JSON, do którego chcesz zapisać tabelę
output_file = "/home/Oberon/Website/Oberon05-dev.github.io/coś.json"

with open(output_file, "w") as json_file:
    json.dump(table_data, json_file, indent=4)

print(f"Liczba folderów: {num_folders}")
print("Plik JSON został wygenerowany.")
