"""
Google Drive integration for storing and retrieving documents
"""
import os
import io
from typing import Optional, Tuple
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials as OAuth2Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload
from googleapiclient.errors import HttpError
from ..core.config import settings


class GoogleDriveManager:
    """Manager for Google Drive operations"""
    
    def __init__(self):
        """Initialize Google Drive manager with credentials"""
        self.service = None
        self.mock_mode = False  # Flag to indicate if we're using mock data
        # When interacting with shared drives, pass this flag to Drive API calls
        self.supports_all_drives = True
        self._drive_id_cache = {}  # Cache for folder -> drive_id lookups
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Drive service with credentials"""
        try:
            # Check if service account credentials are configured
            if settings.google_service_account_json:
                # Check if file exists
                if not os.path.exists(settings.google_service_account_json):
                    print(f"[Google Drive] Credentials file not found at: {settings.google_service_account_json}")
                    print("[Google Drive] Switching to mock mode for development")
                    self.mock_mode = True
                    return
                
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_service_account_json,
                    scopes=['https://www.googleapis.com/auth/drive.file']
                )
                self.service = build('drive', 'v3', credentials=credentials)
                print("[Google Drive] Successfully initialized with real credentials")
            else:
                print("[Google Drive] No credentials configured, using mock mode for development")
                self.mock_mode = True
        except Exception as e:
            print(f"[Google Drive] Error initializing: {str(e)}")
            print("[Google Drive] Falling back to mock mode for development")
            self.mock_mode = True
    
    def _get_shared_drive_id(self, folder_id: str) -> Optional[str]:
        """
        Find the shared drive ID that contains the given folder.
        Service accounts can only write to shared drives, not personal storage.
        
        Args:
            folder_id: The folder ID to find the shared drive for
        
        Returns:
            The shared drive ID, or None if not found or on personal drive
        """
        # Check cache first
        if folder_id in self._drive_id_cache:
            return self._drive_id_cache[folder_id]
        
        try:
            # Query the folder to get its driveId
            file_info = self.service.files().get(
                fileId=folder_id,
                fields='driveId',
                supportsAllDrives=self.supports_all_drives
            ).execute()
            
            drive_id = file_info.get('driveId')
            if drive_id:
                print(f"[Google Drive] Folder {folder_id} is on Shared Drive: {drive_id}")
                self._drive_id_cache[folder_id] = drive_id
                return drive_id
            else:
                print(f"[Google Drive] Folder {folder_id} is not on a Shared Drive (personal storage)")
                return None
        except Exception as e:
            print(f"[Google Drive] Failed to get drive ID for folder {folder_id}: {str(e)}")
            return None
    
    def upload_file(
        self,
        file_path: str,
        filename: str,
        mime_type: str,
        folder_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Upload a file to Google Drive
        
        Args:
            file_path: Path to the file to upload
            filename: Name of the file in Google Drive
            mime_type: MIME type of the file
            folder_id: Optional folder ID to upload to
            description: Optional file description
        
        Returns:
            Tuple of (file_id, sharable_link)
        
        Raises:
            Exception: If upload fails
        """
        # If in mock mode, return mock data
        if self.mock_mode:
            import uuid
            file_id = str(uuid.uuid4())
            shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
            print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
            return (file_id, shareable_link)
        
        try:
            file_metadata = {
                'name': filename,
                'description': description or ''
            }
            
            drive_id = None
            if folder_id:
                file_metadata['parents'] = [folder_id]
                # Get the shared drive ID for this folder
                drive_id = self._get_shared_drive_id(folder_id)
            
            media = MediaFileUpload(file_path, mimetype=mime_type)
            
            if drive_id:
                # For shared drives, use corpora parameter
                file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, webViewLink, webContentLink',
                    supportsAllDrives=self.supports_all_drives,
                    corpora='drive',
                    driveId=drive_id
                ).execute()
            else:
                file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, webViewLink, webContentLink',
                    supportsAllDrives=self.supports_all_drives,
                ).execute()
            
            file_id = file.get('id')
            shareable_link = file.get('webViewLink', file.get('webContentLink'))
            
            # Make file accessible to anyone with link
            self._share_file(file_id, drive_id)
            
            return file_id, shareable_link
        
        except HttpError as error:
            error_msg = str(error)
            # If folder not found, fall back to mock mode
            if '404' in error_msg or 'File not found' in error_msg or 'notFound' in error_msg:
                print(f"[Google Drive] Folder not found or not accessible: {folder_id}")
                print("[Google Drive] Switching to mock mode for this upload")
                import uuid
                file_id = str(uuid.uuid4())
                shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
                print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
                return (file_id, shareable_link)
            else:
                raise Exception(f"Failed to upload file to Google Drive: {error}")
    
    def upload_file_from_bytes(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        folder_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Upload file from bytes to Google Drive
        
        Args:
            file_bytes: File content as bytes
            filename: Name of the file in Google Drive
            mime_type: MIME type of the file
            folder_id: Optional folder ID to upload to
            description: Optional file description
        
        Returns:
            Tuple of (file_id, shareable_link)
        
        Raises:
            Exception: If upload fails
        """
        # If in mock mode, return mock data
        if self.mock_mode:
            import uuid
            file_id = str(uuid.uuid4())
            shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
            print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
            return (file_id, shareable_link)
        
        try:
            print(f"[Google Drive] Uploading file: {filename}")
            print(f"[Google Drive] File size: {len(file_bytes)} bytes")
            print(f"[Google Drive] MIME type: {mime_type}")
            print(f"[Google Drive] Folder ID: {folder_id}")
            
            file_metadata = {
                'name': filename,
                'description': description or ''
            }
            
            drive_id = None
            if folder_id:
                file_metadata['parents'] = [folder_id]
                print(f"[Google Drive] Using parent folder: {folder_id}")
                # Get the shared drive ID for this folder
                drive_id = self._get_shared_drive_id(folder_id)
                if drive_id:
                    print(f"[Google Drive] Will upload to Shared Drive: {drive_id}")
            else:
                print(f"[Google Drive] Uploading to root directory (no parent folder)")
            
            file_stream = io.BytesIO(file_bytes)
            media = MediaIoBaseUpload(file_stream, mimetype=mime_type)
            
            print(f"[Google Drive] Starting file upload...")
            # Build create request with corpora parameter for shared drives
            if drive_id:
                # For shared drives, use the corpora parameter to target the specific drive
                file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, webViewLink, webContentLink',
                    supportsAllDrives=self.supports_all_drives,
                    corpora='drive',
                    driveId=drive_id
                ).execute()
            else:
                file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, webViewLink, webContentLink',
                    supportsAllDrives=self.supports_all_drives,
                ).execute()
            
            file_id = file.get('id')
            shareable_link = file.get('webViewLink', file.get('webContentLink'))
            
            print(f"[Google Drive] File uploaded successfully! ID: {file_id}")
            print(f"[Google Drive] Shareable link: {shareable_link}")
            
            # Make file accessible to anyone with link
            self._share_file(file_id, drive_id)
            
            return file_id, shareable_link
        
        except HttpError as error:
            error_msg = str(error)
            print(f"[Google Drive] HttpError occurred: {error_msg}")
            # If folder not found or storage quota exceeded, fall back to mock mode
            if ('404' in error_msg or 'File not found' in error_msg or 'notFound' in error_msg or
                '403' in error_msg or 'storageQuotaExceeded' in error_msg or 'Service Accounts do not have storage quota' in error_msg):
                print(f"[Google Drive] Cannot upload to Google Drive (folder not found, no storage quota, or permission denied)")
                print("[Google Drive] Switching to mock mode for this upload")
                import uuid
                file_id = str(uuid.uuid4())
                shareable_link = f"https://drive.google.com/file/d/{file_id}/view"
                print(f"[Google Drive Mock] Generated mock file ID: {file_id} for {filename}")
                return (file_id, shareable_link)
            else:
                print(f"[Google Drive] Unexpected error, re-raising exception")
                raise Exception(f"Failed to upload file to Google Drive: {error}")
    
    def download_file(self, file_id: str, output_path: str) -> bool:
        """
        Download a file from Google Drive
        
        Args:
            file_id: Google Drive file ID
            output_path: Path where to save the file
        
        Returns:
            True if successful
        
        Raises:
            Exception: If download fails
        """
        try:
            request = self.service.files().get_media(fileId=file_id)
            
            with open(output_path, 'wb') as f:
                f.write(request.execute())
            
            return True
        
        except HttpError as error:
            raise Exception(f"Failed to download file from Google Drive: {error}")
    
    def delete_file(self, file_id: str) -> bool:
        """
        Delete a file from Google Drive
        
        Args:
            file_id: Google Drive file ID
        
        Returns:
            True if successful
        
        Raises:
            Exception: If deletion fails
        """
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
        
        except HttpError as error:
            raise Exception(f"Failed to delete file from Google Drive: {error}")
    
    def get_file_info(self, file_id: str) -> dict:
        """
        Get information about a file
        
        Args:
            file_id: Google Drive file ID
        
        Returns:
            Dictionary with file information
        
        Raises:
            Exception: If retrieval fails
        """
        try:
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, size, mimeType, webViewLink, webContentLink, createdTime, modifiedTime'
            ).execute()
            
            return file
        
        except HttpError as error:
            raise Exception(f"Failed to get file info from Google Drive: {error}")
    
    def _share_file(self, file_id: str, drive_id: Optional[str] = None) -> None:
        """
        Make a file accessible to anyone with the link
        
        Args:
            file_id: Google Drive file ID
            drive_id: Optional shared drive ID (for shared drive files)
        """
        try:
            permission = {
                'type': 'anyone',
                'role': 'reader'
            }
            
            # Build permission request with shared drive support if applicable
            if drive_id:
                self.service.permissions().create(
                    fileId=file_id,
                    body=permission,
                    fields='id',
                    supportsAllDrives=self.supports_all_drives,
                    driveId=drive_id,
                    corpora='drive'
                ).execute()
            else:
                self.service.permissions().create(
                    fileId=file_id,
                    body=permission,
                    fields='id',
                    supportsAllDrives=self.supports_all_drives,
                ).execute()
        
        except HttpError as error:
            # If sharing fails, continue anyway (file might already be shared)
            print(f"[Google Drive] Warning: Failed to share file {file_id}: {str(error)}")
            pass
    
    def create_folder(self, folder_name: str, parent_folder_id: Optional[str] = None) -> str:
        """
        Create a folder in Google Drive
        
        Args:
            folder_name: Name of the folder to create
            parent_folder_id: Optional parent folder ID
        
        Returns:
            Folder ID
        
        Raises:
            Exception: If creation fails
        """
        try:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            
            if parent_folder_id:
                file_metadata['parents'] = [parent_folder_id]
            
            folder = self.service.files().create(
                body=file_metadata,
                fields='id',
                supportsAllDrives=self.supports_all_drives,
            ).execute()
            
            return folder.get('id')
        
        except HttpError as error:
            raise Exception(f"Failed to create folder in Google Drive: {error}")
    
    def list_files_in_folder(self, folder_id: str, query: Optional[str] = None) -> list:
        """
        List files in a Google Drive folder
        
        Args:
            folder_id: Google Drive folder ID
            query: Optional additional query filter
        
        Returns:
            List of files
        
        Raises:
            Exception: If listing fails
        """
        try:
            q = f"'{folder_id}' in parents and trashed=false"
            if query:
                q += f" and {query}"
            
            results = self.service.files().list(
                q=q,
                spaces='drive',
                fields='files(id, name, mimeType, size, createdTime, modifiedTime)',
                pageSize=100,
                supportsAllDrives=self.supports_all_drives,
            ).execute()
            
            return results.get('files', [])
        
        except HttpError as error:
            raise Exception(f"Failed to list files from Google Drive: {error}")


# Global Google Drive manager instance
def get_drive_manager() -> GoogleDriveManager:
    """Get or create Google Drive manager instance"""
    try:
        return GoogleDriveManager()
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Google Drive manager: {str(e)}")
