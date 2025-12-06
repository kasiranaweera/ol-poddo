#!/usr/bin/env python3
"""
Create Google Drive folders for OL-Poddo using OAuth2 authentication.

This script will:
1. Authenticate with your personal Google account (if not already)
2. Create three folders: Papers, Textbooks, and Study Notes
3. Output the folder IDs for you to add to .env

Run this script from the backend directory:
    python create_google_drive_folders.py
"""

import os
import sys
import json
from pathlib import Path

# Add parent to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from google.oauth2.service_account import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import google.auth
from googleapiclient.discovery import build
import pickle
import io


def create_folders():
    """Create Google Drive folders and return their IDs."""
    
    print("\n" + "="*60)
    print("OL-Poddo Google Drive Folder Creator")
    print("="*60 + "\n")
    
    try:
        # Load OAuth2 credentials
        credentials_path = Path(__file__).parent / "keys" / "outh-key.json"
        
        if not credentials_path.exists():
            print(f"❌ OAuth2 credentials not found at: {credentials_path}")
            print("Please ensure your outh-key.json is in the keys directory")
            return False
        
        # Load existing token if available, otherwise start OAuth2 flow
        token_path = Path(__file__).parent / "token.pickle"
        credentials = None
        
        if token_path.exists():
            with open(token_path, 'rb') as token_file:
                credentials = pickle.load(token_file)
                print("✅ Loaded existing Google Drive credentials from cache\n")
        
        # If no valid credentials, start OAuth2 flow
        if credentials is None or not credentials.valid:
            if credentials and credentials.expired and credentials.refresh_token:
                print("🔄 Refreshing expired credentials...")
                credentials.refresh(Request())
            else:
                print("🔐 Starting OAuth2 authentication...")
                print("A browser window will open for you to authorize OL-Poddo\n")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(credentials_path),
                    scopes=['https://www.googleapis.com/auth/drive']
                )
                credentials = flow.run_local_server(port=0)
                
                # Save credentials for future use
                with open(token_path, 'wb') as token_file:
                    pickle.dump(credentials, token_file)
                print("✅ Credentials saved for future use\n")
        
        # Build Google Drive service
        service = build('drive', 'v3', credentials=credentials)
        print("✅ Successfully connected to Google Drive\n")
        
        # Create folders
        folders = {
            "Papers": "📄 Contains exam papers and past papers",
            "Textbooks": "📚 Contains textbooks and learning materials",
            "Study Notes": "📝 Contains study notes and chapter summaries"
        }
        
        folder_ids = {}
        
        for folder_name, folder_description in folders.items():
            print(f"Creating folder: {folder_name}")
            print(f"Description: {folder_description}")
            
            file_metadata = {
                'name': f'OL-Poddo-{folder_name}',
                'mimeType': 'application/vnd.google-apps.folder',
                'description': folder_description
            }
            
            try:
                folder = service.files().create(
                    body=file_metadata,
                    fields='id,name,webViewLink'
                ).execute()
                
                folder_id = folder.get('id')
                folder_ids[folder_name] = folder_id
                
                print(f"✅ Created: {folder_name}")
                print(f"   Folder ID: {folder_id}")
                print(f"   Link: https://drive.google.com/drive/folders/{folder_id}\n")
                
            except Exception as e:
                print(f"❌ Failed to create {folder_name}: {e}\n")
                return False
        
        # Display summary with .env format
        print("="*60)
        print("✅ ALL FOLDERS CREATED SUCCESSFULLY!")
        print("="*60 + "\n")
        
        print("Add these folder IDs to your .env file:\n")
        print("# Google Drive Folder IDs (Update these in .env)")
        print(f"GOOGLE_DRIVE_PAPERS_FOLDER_ID={folder_ids.get('Papers', '')}")
        print(f"GOOGLE_DRIVE_TEXTBOOKS_FOLDER_ID={folder_ids.get('Textbooks', '')}")
        print(f"GOOGLE_DRIVE_NOTES_FOLDER_ID={folder_ids.get('Study Notes', '')}\n")
        
        print("Next steps:")
        print("1. Copy the folder IDs above")
        print("2. Update your .env file with these IDs")
        print("3. Restart the backend server")
        print("4. Try uploading a file again\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = create_folders()
    sys.exit(0 if success else 1)
