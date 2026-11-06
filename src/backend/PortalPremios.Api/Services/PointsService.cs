using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;

namespace PortalPremios.Api.Services;

public class PointsService : IPointsService
{
    private readonly IJsonRepository<Campaign> _campaignRepo;
    private readonly IJsonRepository<User> _userRepo;
    private readonly IJsonRepository<PointTransaction> _transactionRepo;

    public PointsService(
        IJsonRepository<Campaign> campaignRepo,
        IJsonRepository<User> userRepo,
        IJsonRepository<PointTransaction> transactionRepo)
    {
        _campaignRepo = campaignRepo;
        _userRepo = userRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Campaign> CreateCampaignAsync(string name, string description)
    {
        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Description = description.Trim(),
            TotalPointsPool = 0,
            AvailablePoints = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        return await _campaignRepo.AddAsync(campaign);
    }

    public async Task<IEnumerable<Campaign>> GetCampaignsAsync()
    {
        var campaigns = await _campaignRepo.GetAllAsync();
        return campaigns.OrderByDescending(c => c.CreatedAt);
    }

    public async Task<Campaign?> GetCampaignByIdAsync(Guid id)
    {
        return await _campaignRepo.GetByIdAsync(id);
    }

    public async Task<PointTransaction> AddPointsToCampaignAsync(AddCampaignPointsRequest request)
    {
        if (request.Points <= 0)
        {
            throw new ArgumentException("A quantidade de pontos para adicionar deve ser positiva.");
        }

        var campaign = await _campaignRepo.GetByIdAsync(request.CampaignId);
        if (campaign == null)
        {
            throw new KeyNotFoundException($"Campanha não encontrada com id: {request.CampaignId}");
        }

        campaign.TotalPointsPool += request.Points;
        campaign.AvailablePoints += request.Points;
        await _campaignRepo.UpdateAsync(campaign.Id, campaign);

        var transaction = new PointTransaction
        {
            Id = Guid.NewGuid(),
            Type = TransactionType.CampaignCredit,
            Points = request.Points,
            CampaignId = campaign.Id,
            CampaignName = campaign.Name,
            Description = string.IsNullOrWhiteSpace(request.Description) ? "Aporte de pontos na campanha" : request.Description,
            Timestamp = DateTime.UtcNow
        };

        return await _transactionRepo.AddAsync(transaction);
    }

    public async Task<PointTransaction> DistributePointsToUserAsync(DistributePointsRequest request)
    {
        if (request.Points <= 0)
        {
            throw new ArgumentException("A quantidade de pontos a distribuir deve ser positiva.");
        }

        var campaign = await _campaignRepo.GetByIdAsync(request.CampaignId);
        if (campaign == null)
        {
            throw new KeyNotFoundException($"Campanha com id {request.CampaignId} não encontrada.");
        }

        if (campaign.AvailablePoints < request.Points)
        {
            throw new InvalidOperationException($"Saldo insuficiente na campanha. Disponível: {campaign.AvailablePoints}, Solicitado: {request.Points}");
        }

        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException($"Usuário com id {request.UserId} não encontrado.");
        }

        // Atualiza saldos
        campaign.AvailablePoints -= request.Points;
        await _campaignRepo.UpdateAsync(campaign.Id, campaign);

        user.PointsBalance += request.Points;
        await _userRepo.UpdateAsync(user.Id, user);

        var transaction = new PointTransaction
        {
            Id = Guid.NewGuid(),
            Type = TransactionType.DistributionToUser,
            Points = request.Points,
            CampaignId = campaign.Id,
            CampaignName = campaign.Name,
            UserId = user.Id,
            Username = user.FullName ?? user.Username,
            Description = string.IsNullOrWhiteSpace(request.Reason) ? $"Distribuição de pontos da campanha '{campaign.Name}'" : request.Reason,
            Timestamp = DateTime.UtcNow
        };

        return await _transactionRepo.AddAsync(transaction);
    }

    public async Task<IEnumerable<PointTransaction>> GetCampaignStatementAsync(Guid campaignId)
    {
        var all = await _transactionRepo.GetAllAsync();
        return all.Where(t => t.CampaignId == campaignId)
                  .OrderByDescending(t => t.Timestamp);
    }

    public async Task<IEnumerable<PointTransaction>> GetUserStatementAsync(Guid userId)
    {
        var all = await _transactionRepo.GetAllAsync();
        return all.Where(t => t.UserId == userId)
                  .OrderByDescending(t => t.Timestamp);
    }

    public async Task<IEnumerable<PointTransaction>> GetAllTransactionsAsync()
    {
        var all = await _transactionRepo.GetAllAsync();
        return all.OrderByDescending(t => t.Timestamp);
    }
}
