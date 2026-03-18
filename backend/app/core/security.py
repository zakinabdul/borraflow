import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
import json

# Initialize Firebase app
cred_dict = {
    "type": "service_account",
    "project_id": settings.firebase_project_id,
    "private_key_id": settings.firebase_private_key_id,
    "private_key": settings.firebase_private_key.replace('\\n', '\n'),
    "client_email": settings.firebase_client_email,
    "client_id": settings.firebase_client_id,
    "auth_uri": settings.firebase_auth_uri,
    "token_uri": settings.firebase_token_uri,
    "auth_provider_x509_cert_url": settings.firebase_auth_provider_x509_cert_url,
    "client_x509_cert_url": settings.firebase_client_x509_cert_url
}

cred = credentials.Certificate(cred_dict)
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to verify Firebase JWT token and get current user.
    """
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(credentials.credentials)
        #print(f"✅ JWT Verified - User: {decoded_token.get('email', 'unknown')}")
        return decoded_token
    except Exception as e:
        print(f"❌ JWT Verification Failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )