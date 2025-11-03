using System.Security.Cryptography;
using System.Text;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using Microsoft.Extensions.Configuration;

namespace InternalLLMBasedInspectionTool.Infrastructure.Security;

public class DataEncryptionService : IDataEncryptionService {
    private readonly byte[] _key;
    private readonly byte[] _iv;

    public DataEncryptionService(IConfiguration configuration) {
        var encryptionKey = configuration["Encryption:Key"];
        if (string.IsNullOrWhiteSpace(encryptionKey)) {
            encryptionKey = "DefaultEncryptionKeyForMVP12345";
        }

        using var sha256 = SHA256.Create();
        _key = sha256.ComputeHash(Encoding.UTF8.GetBytes(encryptionKey));

        using var md5 = MD5.Create();
        _iv = md5.ComputeHash(Encoding.UTF8.GetBytes(encryptionKey));
        Array.Resize(ref _iv, 16);
    }

    public string Encrypt(string plainText) {
        if (string.IsNullOrEmpty(plainText)) {
            return plainText;
        }

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

        using var msEncrypt = new MemoryStream();
        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write)) {
            using (var swEncrypt = new StreamWriter(csEncrypt)) {
                swEncrypt.Write(plainText);
            }
        }

        return Convert.ToBase64String(msEncrypt.ToArray());
    }

    public string Decrypt(string cipherText) {
        if (string.IsNullOrEmpty(cipherText)) {
            return cipherText;
        }

        try {
            var cipherBytes = Convert.FromBase64String(cipherText);

            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

            using var msDecrypt = new MemoryStream(cipherBytes);
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        } catch {
            return cipherText;
        }
    }
}

