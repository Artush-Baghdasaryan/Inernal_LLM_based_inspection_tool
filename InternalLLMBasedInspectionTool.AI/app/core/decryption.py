import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

from app.core.config import ENCRYPTION_KEY


class DataDecryptionService:
    def __init__(self):
        key_bytes = ENCRYPTION_KEY.encode('utf-8')
        self._key = hashlib.sha256(key_bytes).digest()
        
        md5_hash = hashlib.md5(key_bytes).digest()
        self._iv = md5_hash[:16]
    
    def decrypt(self, cipher_text: str) -> str:
        if not cipher_text:
            return cipher_text
        
        try:
            cipher_bytes = base64.b64decode(cipher_text)
            
            cipher = AES.new(self._key, AES.MODE_CBC, self._iv)
            
            decrypted_bytes = cipher.decrypt(cipher_bytes)
            
            plain_text = unpad(decrypted_bytes, AES.block_size).decode('utf-8')
            
            return plain_text
        except Exception:
            # If decryption fails, return original text
            return cipher_text

