using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;

namespace PortalPremios.Api.Services;

public interface IUserService
{
    Task<LoginResponse?> AuthenticateAsync(LoginRequest request);
    Task<User> RegisterUserAsync(CreateUserRequest request);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetByIdAsync(Guid id);
}

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product> CreateAsync(CreateProductRequest request);
    Task<Product?> GetByIdAsync(Guid id);
    Task<PointTransaction> RedeemProductAsync(RedeemProductRequest request);
}

public interface IPointsService
{
    Task<Campaign> CreateCampaignAsync(string name, string description);
    Task<IEnumerable<Campaign>> GetCampaignsAsync();
    Task<Campaign?> GetCampaignByIdAsync(Guid id);
    Task<PointTransaction> AddPointsToCampaignAsync(AddCampaignPointsRequest request);
    Task<PointTransaction> DistributePointsToUserAsync(DistributePointsRequest request);
    Task<IEnumerable<PointTransaction>> GetCampaignStatementAsync(Guid campaignId);
    Task<IEnumerable<PointTransaction>> GetUserStatementAsync(Guid userId);
    Task<IEnumerable<PointTransaction>> GetAllTransactionsAsync();
}

public interface ISocialPostService
{
    Task<IEnumerable<SocialPost>> GetFeedAsync();
    Task<SocialPost> CreatePostAsync(CreatePostRequest request);
    Task<bool> LikePostAsync(Guid postId);
}
