using FluentAssertions;
using Moq;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;
using PortalPremios.Api.Services;
using Xunit;

namespace PortalPremios.Tests.Services;

public class PointsServiceTests
{
    private readonly Mock<IJsonRepository<Campaign>> _campaignRepoMock;
    private readonly Mock<IJsonRepository<User>> _userRepoMock;
    private readonly Mock<IJsonRepository<PointTransaction>> _transactionRepoMock;
    private readonly PointsService _pointsService;

    public PointsServiceTests()
    {
        _campaignRepoMock = new Mock<IJsonRepository<Campaign>>();
        _userRepoMock = new Mock<IJsonRepository<User>>();
        _transactionRepoMock = new Mock<IJsonRepository<PointTransaction>>();

        _pointsService = new PointsService(
            _campaignRepoMock.Object,
            _userRepoMock.Object,
            _transactionRepoMock.Object);
    }

    [Fact]
    public async Task AddPointsToCampaignAsync_WhenCampaignExistsAndPointsValid_ShouldIncrementPoolAndRecordTransaction()
    {
        // Arrange
        var campaignId = Guid.NewGuid();
        var campaign = new Campaign
        {
            Id = campaignId,
            Name = "Campanha Metas Q1",
            TotalPointsPool = 1000,
            AvailablePoints = 1000
        };

        _campaignRepoMock.Setup(r => r.GetByIdAsync(campaignId)).ReturnsAsync(campaign);
        _campaignRepoMock.Setup(r => r.UpdateAsync(campaignId, It.IsAny<Campaign>())).ReturnsAsync(true);
        _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<PointTransaction>()))
            .ReturnsAsync((PointTransaction t) => t);

        var request = new AddCampaignPointsRequest(campaignId, 500, "Aporte adicional de orçamento");

        // Act
        var transaction = await _pointsService.AddPointsToCampaignAsync(request);

        // Assert
        campaign.AvailablePoints.Should().Be(1500);
        campaign.TotalPointsPool.Should().Be(1500);
        transaction.Should().NotBeNull();
        transaction.Type.Should().Be(TransactionType.CampaignCredit);
        transaction.Points.Should().Be(500);

        _campaignRepoMock.Verify(r => r.UpdateAsync(campaignId, campaign), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.Is<PointTransaction>(t => t.Type == TransactionType.CampaignCredit && t.Points == 500)), Times.Once);
    }

    [Fact]
    public async Task DistributePointsToUserAsync_WhenSufficientPoints_ShouldDebitCampaignCreditUserAndRecord()
    {
        // Arrange
        var campaignId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var campaign = new Campaign
        {
            Id = campaignId,
            Name = "Campanha Performance",
            AvailablePoints = 2000,
            TotalPointsPool = 2000
        };

        var user = new User
        {
            Id = userId,
            Username = "marina",
            PointsBalance = 100
        };

        _campaignRepoMock.Setup(r => r.GetByIdAsync(campaignId)).ReturnsAsync(campaign);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _campaignRepoMock.Setup(r => r.UpdateAsync(campaignId, It.IsAny<Campaign>())).ReturnsAsync(true);
        _userRepoMock.Setup(r => r.UpdateAsync(userId, It.IsAny<User>())).ReturnsAsync(true);
        _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<PointTransaction>()))
            .ReturnsAsync((PointTransaction t) => t);

        var request = new DistributePointsRequest(campaignId, userId, 400, "Destaque do mês");

        // Act
        var transaction = await _pointsService.DistributePointsToUserAsync(request);

        // Assert
        campaign.AvailablePoints.Should().Be(1600);
        user.PointsBalance.Should().Be(500);
        transaction.Should().NotBeNull();
        transaction.Type.Should().Be(TransactionType.DistributionToUser);
        transaction.Points.Should().Be(400);
        transaction.UserId.Should().Be(userId);
        transaction.CampaignId.Should().Be(campaignId);

        _campaignRepoMock.Verify(r => r.UpdateAsync(campaignId, campaign), Times.Once);
        _userRepoMock.Verify(r => r.UpdateAsync(userId, user), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.IsAny<PointTransaction>()), Times.Once);
    }

    [Fact]
    public async Task DistributePointsToUserAsync_WhenCampaignHasInsufficientPoints_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var campaignId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var campaign = new Campaign { Id = campaignId, AvailablePoints = 100 };
        var user = new User { Id = userId, PointsBalance = 50 };

        _campaignRepoMock.Setup(r => r.GetByIdAsync(campaignId)).ReturnsAsync(campaign);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

        var request = new DistributePointsRequest(campaignId, userId, 300, "Tentativa sem saldo");

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _pointsService.DistributePointsToUserAsync(request));
    }

    [Fact]
    public async Task GetCampaignStatementAsync_ShouldFilterByCampaignIdAndSortDescending()
    {
        // Arrange
        var c1 = Guid.NewGuid();
        var c2 = Guid.NewGuid();

        var list = new List<PointTransaction>
        {
            new PointTransaction { Id = Guid.NewGuid(), CampaignId = c1, Timestamp = DateTime.UtcNow.AddHours(-2), Points = 100 },
            new PointTransaction { Id = Guid.NewGuid(), CampaignId = c2, Timestamp = DateTime.UtcNow.AddHours(-1), Points = 200 },
            new PointTransaction { Id = Guid.NewGuid(), CampaignId = c1, Timestamp = DateTime.UtcNow, Points = 300 }
        };

        _transactionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(list);

        // Act
        var statement = (await _pointsService.GetCampaignStatementAsync(c1)).ToList();

        // Assert
        statement.Should().HaveCount(2);
        statement[0].Points.Should().Be(300); // Mais recente primeiro
        statement[1].Points.Should().Be(100);
    }

    [Fact]
    public async Task GetUserStatementAsync_ShouldFilterByUserIdAndSortDescending()
    {
        // Arrange
        var u1 = Guid.NewGuid();
        var u2 = Guid.NewGuid();

        var list = new List<PointTransaction>
        {
            new PointTransaction { Id = Guid.NewGuid(), UserId = u1, Timestamp = DateTime.UtcNow.AddMinutes(-10), Points = 50 },
            new PointTransaction { Id = Guid.NewGuid(), UserId = u2, Timestamp = DateTime.UtcNow.AddMinutes(-5), Points = 75 },
            new PointTransaction { Id = Guid.NewGuid(), UserId = u1, Timestamp = DateTime.UtcNow, Points = 150 }
        };

        _transactionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(list);

        // Act
        var statement = (await _pointsService.GetUserStatementAsync(u1)).ToList();

        // Assert
        statement.Should().HaveCount(2);
        statement[0].Points.Should().Be(150);
        statement[1].Points.Should().Be(50);
    }
}
