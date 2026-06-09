import os
import zipfile

def create_zip(zip_filename, source_dir):
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(source_dir):
            for file in files:
                if 'autocar' in file or file.endswith('.zip') or file.endswith('.py'):
                    continue
                # Skip the icons directory entirely to be safe
                if 'icons' in root or 'icons' in file:
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir)
                arcname = rel_path.replace(os.sep, '/')
                zf.write(file_path, arcname)
                print(f"Added {file_path} as {arcname}")

if __name__ == '__main__':
    source = r'C:\Users\CASPER\Desktop\gunluk_program\projeler\AutoCAR\browser-extension'
    dest = r'C:\Users\CASPER\Desktop\autocar-firefox-v2.zip'
    create_zip(dest, source)
