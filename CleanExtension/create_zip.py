import os
import zipfile

def create_zip(zip_name, source_dir):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.zip') or file.endswith('.py'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
                print(f"Added {file_path} as {arcname}")

if __name__ == '__main__':
    source = r'C:\Users\CASPER\Desktop\gunluk_program\projeler\AutoCAR\CleanExtension'
    dest = r'C:\Users\CASPER\Desktop\gunluk_program\projeler\AutoCAR\AutoCAR-v1.4.0.zip'
    create_zip(dest, source)
