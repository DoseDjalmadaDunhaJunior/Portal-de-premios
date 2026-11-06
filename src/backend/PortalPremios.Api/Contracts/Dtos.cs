using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;

namespace PortalPremios.Api.Contracts;

public record LoginRequest(string Username, string Password);
public record LoginResponse(Guid Id, string Username, string FullName, string Email, UserRole Role, int PointsBalance);

public record CreateUserRequest(string Username, string Password, string FullName, string Email, UserRole Role);
public record CreateProductRequest(string Title, string Description, int PointsCost, string Category, string ImageUrl, int Stock);

public record AddCampaignPointsRequest(Guid CampaignId, int Points, string Description);
public record DistributePointsRequest(Guid CampaignId, Guid UserId, int Points, string Reason);

public record RedeemProductRequest(Guid UserId, Guid ProductId);

public record CreatePostRequest(Guid AuthorId, string Content, string? ImageUrl);
