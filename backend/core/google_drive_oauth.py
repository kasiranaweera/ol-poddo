"""
Google Drive integration using OAuth2 with personal Google account
Supports file uploads, downloads, and previews directly from your personal Drive
"""
import os
import io
import uuid
import pickle
from typing import Optional, Tuple
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload
from googleapiclient.errors import HttpError
from ..core.config import settings


class GoogleDriveOAuthManager:
    """Manager for Google Drive operations using OAuth2 with personal account"""
    
    # Only need drive.file scope - can only access files we create or are shared with
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    TOKEN_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "token.pickle")
    
    def __init__(self):
        """Initialize Google Drive manager with OAuth2 credentials"""
        self.service = None
        self.mock_mode = False
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Drive service with OAuth2 credentials"""
        try:
            # Check if credentials JSON exists
            if not settings.google_oauth_credentials_json or not os.path.exists(settings.google_oauth_credentials_json):
                print(f"[Google Drive OAuth] Credentials file not found at: {settings.google_oauth_credentials_json}")
                print("[Google Drive OAuth] Switching to mock mode for development")
                self.mock_mode = True
                return
            
            creds = None
            
            # Load existing token if it exists
            if os.path.exists(self.TOKEN_PATH):
                with open(self.TOKEN_PATH, 'rb') as token:
                    creds = pickle.load(token)
                    print("[Google Drive OAuth] Loaded existing token from cache")
            
            # If no valid token, request new one
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    print("[Google Drive OAuth] Token expired, refreshing...")
                    creds.refresh(Request())
                else:
                    print("[Google Drive OAuth] Requesting new OAuth2 token (browser will open)...")
                    flow = InstalledAppFlow.from_client_secrets_file(
                        settings.google_oauth_credentials_json, 
                        self.SCOPES
                    )
                    # run_local_server with port=0 uses an available port
                    # The redirect will work on localhost with any available port
                    creds = flow.run_local_server(port=0, open_browser=True)
                
                # Save the token for next time
                with open(self.TOKEN_PATH, 'wb') as token:
                    pickle.dump(creds, token)
                    print(f"[Google Drive OAuth] Token saved to {self.TOKEN_PATH}")
            
            self.service = build('drive', 'v3', credentials=creds)
            print("[Google Drive OAuth] Successfully initialized with personal account")
            
        except Exception as e:
            print(f"[Google Drive OAuth] Error initializing: {str(e)}")
            print("[Google Drive OAuth] Falling back to mock mode for development")
            self.mock_mode = True
    
    def upload_file(
        self,
        file_path: str,
        filename: str,
        mime_type: str,
        folder_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Upload a file to Google Drive from file path
        
        Args:
            file_path: Path to the file to upload
            filename: Name of the file in Google Drive
            mime_type: MIME type of the file
            folder_id: Optional folder ID to upload to
            description: Optional file description
        
        Returns:
            Tuple of (file_id, shareable_link)
        
        Raises:
            Exception: If upload fails
        """
        if self.mock_mode:
            file_id = str(uuid.uuid4())
            shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
            print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
            return (file_id, shareable_link)
        
        try:
            file_metadata = {
                'name': filename,
                'description': description or ''
            }
            
            if folder_id:
                file_metadata['parents'] = [folder_id]
            
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink, webContentLink',
                supportsAllDrives=True
            ).execute()
            
            file_id = file.get('id')
            shareable_link = file.get('webViewLink')
            
            print(f"[Google Drive OAuth] Successfully uploaded: {filename} (ID: {file_id})")
            return (file_id, shareable_link)
            
        except HttpError as error:
            print(f'[Google Drive OAuth] Upload error: {error}')
            raise
    
    async def upload_file_from_upload(
        self,
        file,
        filename: str,
        mime_type: str,
        folder_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Upload a file to Google Drive from FastAPI UploadFile
        
        Args:
            file: FastAPI UploadFile object
            filename: Name of the file in Google Drive
            mime_type: MIME type of the file
            folder_id: Optional folder ID to upload to
            description: Optional file description
        
        Returns:
            Tuple of (file_id, shareable_link)
        """
        if self.mock_mode:
            file_id = str(uuid.uuid4())
            shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
            print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
            return (file_id, shareable_link)
        
        try:
            # Read file content
            file_content = await file.read()
            
            file_metadata = {
                'name': filename,
                'description': description or ''
            }
            
            if folder_id:
                file_metadata['parents'] = [folder_id]
            
            # Create MediaIoBaseUpload from file content
            media = MediaIoBaseUpload(
                io.BytesIO(file_content),
                mimetype=mime_type,
                resumable=True
            )
            
            file_result = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink, webContentLink',
                supportsAllDrives=True
            ).execute()
            
            file_id = file_result.get('id')
            shareable_link = file_result.get('webViewLink')
            
            print(f"[Google Drive OAuth] Successfully uploaded: {filename} (ID: {file_id})")
            return (file_id, shareable_link)
            
        except HttpError as error:
            print(f'[Google Drive OAuth] Upload error: {error}')
            raise
    
    def download_file(
        self,
        file_id: str,
        output_path: str
    ) -> bool:
        """
        Download a file from Google Drive
        
        Args:
            file_id: The file ID to download
            output_path: Path where to save the file
        
        Returns:
            True if successful, False otherwise
        """
        if self.mock_mode:
            print(f"[Google Drive Mock] Would download file {file_id} to {output_path}")
            return True
        
        try:
            request = self.service.files().get_media(fileId=file_id)
            with open(output_path, 'wb') as fh:
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
            
            print(f"[Google Drive OAuth] Successfully downloaded file {file_id}")
            return True
            
        except HttpError as error:
            print(f'[Google Drive OAuth] Download error: {error}')
            return False
    
    def get_file_info(self, file_id: str) -> Optional[dict]:
        """
        Get file metadata from Google Drive
        
        Args:
            file_id: The file ID
        
        Returns:
            File metadata dictionary or None
        """
        if self.mock_mode:
            return {
                'id': file_id,
                'name': f'file_{file_id}.pdf',
                'mimeType': 'application/pdf'
            }
        
        try:
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType, size, createdTime, modifiedTime, webViewLink',
                supportsAllDrives=True
            ).execute()
            return file
            
        except HttpError as error:
            print(f'[Google Drive OAuth] Get file info error: {error}')
            return None
    
    def get_direct_download_url(self, file_id: str) -> str:
        """
        Returns clean direct download link (bypasses Google virus warning for most cases)
        """
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    def get_preview_url(self, file_id: str) -> str:
        """
        Returns embeddable preview URL (works in <iframe>)
        """
        return f"https://drive.google.com/file/d/{file_id}/preview"
    
    def get_thumbnail_url(self, file_id: str, size: str = "w400") -> str:
        """
        Returns thumbnail URL for the file
        
        Args:
            file_id: The file ID
            size: Thumbnail size (e.g., 'w200', 'w400', 'w800')
        
        Returns:
            Thumbnail URL
        """
        return f"https://drive.google.com/thumbnail?id={file_id}&sz={size}"


# Global instance
_drive_manager: Optional[GoogleDriveOAuthManager] = None


def get_drive_manager() -> GoogleDriveOAuthManager:
    """Get or create Google Drive manager instance"""
    global _drive_manager
    if _drive_manager is None:
        _drive_manager = GoogleDriveOAuthManager()
    return _drive_manager
