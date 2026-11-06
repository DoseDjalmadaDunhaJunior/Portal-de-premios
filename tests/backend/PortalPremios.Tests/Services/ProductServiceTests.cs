using FluentAssertions;
using Moq;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;
using PortalPremios.Api.Services;
using Xunit;

namespace PortalPremios.Tests.Services;

public class ProductServiceTests
{
    private readonly Mock<IJsonRepository<Product>> _productRepoMock;
    private readonly Mock<IJsonRepository<User>> _userRepoMock;
    private readonly Mock<IJsonRepository<PointTransaction>> _transactionRepoMock;
    private readonly ProductService _productService;

    public ProductServiceTests()
    {
        _productRepoMock = new Mock<IJsonRepository<Product>>();
        _userRepoMock = new Mock<IJsonRepository<User>>();
        _transactionRepoMock = new Mock<IJsonRepository<PointTransaction>>();

        _productService = new ProductService(
            _productRepoMock.Object,
            _userRepoMock.Object,
            _transactionRepoMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllProducts()
    {
        // Arrange
        var products = new List<Product>
        {
            new Product { Id = Guid.NewGuid(), Title = "Fone Bluetooth", PointsCost = 1200 },
            new Product { Id = Guid.NewGuid(), Title = "Mochila Executiva", PointsCost = 850 }
        };
        _productRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(products);

        // Act
        var result = await _productService.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldAddAndReturnProduct()
    {
        // Arrange
        _productRepoMock.Setup(r => r.AddAsync(It.IsAny<Product>())).ReturnsAsync((Product p) => p);
        var request = new CreateProductRequest("Kindle Paperwhite", "Leitor de livros", 3000, "Eletrônicos", "https://img.com/kindle.png", 50);

        // Act
        var result = await _productService.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Kindle Paperwhite");
        result.PointsCost.Should().Be(3000);
        _productRepoMock.Verify(r => r.AddAsync(It.Is<Product>(p => p.Title == "Kindle Paperwhite")), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidCost_ShouldThrowArgumentException()
    {
        // Arrange
        var request = new CreateProductRequest("Produto Inválido", "Desc", -10, "Cat", "", 10);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _productService.CreateAsync(request));
    }

    [Fact]
    public async Task RedeemProductAsync_WhenUserHasEnoughPointsAndStockAvailable_ShouldDeductPointsStockAndRecord()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Username = "marina",
            PointsBalance = 1000
        };

        var product = new Product
        {
            Id = productId,
            Title = "Fone Bluetooth",
            PointsCost = 600,
            Stock = 5
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _productRepoMock.Setup(r => r.GetByIdAsync(productId)).ReturnsAsync(product);
        _userRepoMock.Setup(r => r.UpdateAsync(userId, It.IsAny<User>())).ReturnsAsync(true);
        _productRepoMock.Setup(r => r.UpdateAsync(productId, It.IsAny<Product>())).ReturnsAsync(true);
        _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<PointTransaction>())).ReturnsAsync((PointTransaction t) => t);

        var request = new RedeemProductRequest(userId, productId);

        // Act
        var tx = await _productService.RedeemProductAsync(request);

        // Assert
        user.PointsBalance.Should().Be(400);
        product.Stock.Should().Be(4);
        tx.Should().NotBeNull();
        tx.Type.Should().Be(TransactionType.Redemption);
        tx.Points.Should().Be(600);
        tx.Description.Should().Contain("Fone Bluetooth");

        _userRepoMock.Verify(r => r.UpdateAsync(userId, user), Times.Once);
        _productRepoMock.Verify(r => r.UpdateAsync(productId, product), Times.Once);
        _transactionRepoMock.Verify(r => r.AddAsync(It.IsAny<PointTransaction>()), Times.Once);
    }

    [Fact]
    public async Task RedeemProductAsync_WhenUserHasInsufficientPoints_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        var user = new User { Id = userId, PointsBalance = 200 };
        var product = new Product { Id = productId, Title = "Cadeira Gamer", PointsCost = 1500, Stock = 3 };

        _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _productRepoMock.Setup(r => r.GetByIdAsync(productId)).ReturnsAsync(product);

        var request = new RedeemProductRequest(userId, productId);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _productService.RedeemProductAsync(request));
    }

    [Fact]
    public async Task RedeemProductAsync_WhenProductOutOfStock_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        var user = new User { Id = userId, PointsBalance = 2000 };
        var product = new Product { Id = productId, Title = "Mouse Gamer", PointsCost = 500, Stock = 0 };

        _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _productRepoMock.Setup(r => r.GetByIdAsync(productId)).ReturnsAsync(product);

        var request = new RedeemProductRequest(userId, productId);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _productService.RedeemProductAsync(request));
    }
}
