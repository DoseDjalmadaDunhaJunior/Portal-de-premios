using FluentAssertions;
using Moq;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;
using PortalPremios.Api.Services;
using Xunit;

namespace PortalPremios.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IJsonRepository<User>> _userRepoMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _userRepoMock = new Mock<IJsonRepository<User>>();
        _userService = new UserService(_userRepoMock.Object);
    }

    [Fact]
    public async Task AuthenticateAsync_WithValidAdminCredentials_ShouldReturnLoginResponse()
    {
        // Arrange
        var users = new List<User>
        {
            new User
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Password = "admin",
                FullName = "Administrador Geral",
                Email = "admin@portal.com",
                Role = UserRole.Admin,
                PointsBalance = 500
            }
        };
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

        var request = new LoginRequest("admin", "admin");

        // Act
        var result = await _userService.AuthenticateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result!.Username.Should().Be("admin");
        result.Role.Should().Be(UserRole.Admin);
        result.PointsBalance.Should().Be(500);
    }

    [Fact]
    public async Task AuthenticateAsync_WithInvalidCredentials_ShouldReturnNull()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<User>());
        var request = new LoginRequest("admin", "wrongpassword");

        // Act
        var result = await _userService.AuthenticateAsync(request);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RegisterUserAsync_WhenUsernameIsUnique_ShouldPersistAndReturnUser()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<User>());
        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        var request = new CreateUserRequest("colaborador1", "senha123", "Colaborador Um", "colab1@portal.com", UserRole.User);

        // Act
        var created = await _userService.RegisterUserAsync(request);

        // Assert
        created.Should().NotBeNull();
        created.Username.Should().Be("colaborador1");
        created.Role.Should().Be(UserRole.User);
        created.PointsBalance.Should().Be(0);
        _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u => u.Username == "colaborador1")), Times.Once);
    }

    [Fact]
    public async Task RegisterUserAsync_WhenUsernameAlreadyExists_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var existing = new List<User> { new User { Username = "admin" } };
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(existing);

        var request = new CreateUserRequest("admin", "123", "Admin 2", "admin2@portal.com", UserRole.Admin);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _userService.RegisterUserAsync(request));
    }
}
