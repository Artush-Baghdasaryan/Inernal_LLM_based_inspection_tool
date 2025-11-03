using MongoDB.Bson.Serialization.Attributes;

namespace InternalLLMBasedInspectionTool.Domain.Common.Models;

public class Entity {
    [BsonId]
    public Guid Id { get; protected set; }

    public void SetId(Guid id) {
        Id = id;
    }

    public void GenerateId() {
        if (Id != Guid.Empty) {
            return;
        }

        Id = Guid.NewGuid();
    }
}
