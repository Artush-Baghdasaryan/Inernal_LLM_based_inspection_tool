namespace InternalLLMBasedInspectionTool.Domain.Common.Security;

public interface IDataEncryptionService {
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}

