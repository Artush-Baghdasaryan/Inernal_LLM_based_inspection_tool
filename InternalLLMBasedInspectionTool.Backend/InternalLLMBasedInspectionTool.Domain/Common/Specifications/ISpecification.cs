using InternalLLMBasedInspectionTool.Domain.Common.Models;

namespace InternalLLMBasedInspectionTool.Domain.Common.Specifications;

public interface ISpecification<TEntity> where TEntity : Entity {
    SpecificationResult IsSatisfiedBy(TEntity entity);
}
