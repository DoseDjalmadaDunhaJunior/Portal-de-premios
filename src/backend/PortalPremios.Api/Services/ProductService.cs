using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;

namespace PortalPremios.Api.Services;

public class ProductService : IProductService
{
    private readonly IJsonRepository<Product> _productRepo;
    private readonly IJsonRepository<User> _userRepo;
    private readonly IJsonRepository<PointTransaction> _transactionRepo;

    public ProductService(
        IJsonRepository<Product> productRepo,
        IJsonRepository<User>? userRepo = null,
        IJsonRepository<PointTransaction>? transactionRepo = null)
    {
        _productRepo = productRepo;
        _userRepo = userRepo!;
        _transactionRepo = transactionRepo!;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        var products = await _productRepo.GetAllAsync();
        return products.OrderByDescending(p => p.CreatedAt);
    }

    public async Task<Product> CreateAsync(CreateProductRequest request)
    {
        if (request.PointsCost <= 0)
        {
            throw new ArgumentException("O custo em pontos deve ser maior que zero.", nameof(request.PointsCost));
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("O título do produto é obrigatório.", nameof(request.Title));
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            PointsCost = request.PointsCost,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Geral" : request.Category.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) 
                ? "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80" 
                : request.ImageUrl.Trim(),
            Stock = request.Stock,
            CreatedAt = DateTime.UtcNow
        };

        return await _productRepo.AddAsync(product);
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _productRepo.GetByIdAsync(id);
    }

    public async Task<PointTransaction> RedeemProductAsync(RedeemProductRequest request)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException($"Usuário com id {request.UserId} não encontrado.");
        }

        var product = await _productRepo.GetByIdAsync(request.ProductId);
        if (product == null)
        {
            throw new KeyNotFoundException($"Produto com id {request.ProductId} não encontrado.");
        }

        if (product.Stock <= 0)
        {
            throw new InvalidOperationException($"Produto '{product.Title}' sem estoque disponível.");
        }

        if (user.PointsBalance < product.PointsCost)
        {
            throw new InvalidOperationException($"Saldo de pontos insuficiente. Necessário: {product.PointsCost} pts, Disponível: {user.PointsBalance} pts.");
        }

        // Deduz pontos do usuário
        user.PointsBalance -= product.PointsCost;
        await _userRepo.UpdateAsync(user.Id, user);

        // Deduz estoque do produto
        product.Stock -= 1;
        await _productRepo.UpdateAsync(product.Id, product);

        // Registra transação de resgate
        var transaction = new PointTransaction
        {
            Id = Guid.NewGuid(),
            Type = TransactionType.Redemption,
            Points = product.PointsCost,
            UserId = user.Id,
            Username = user.FullName ?? user.Username,
            Description = $"Resgate de prêmio: {product.Title}",
            Timestamp = DateTime.UtcNow
        };

        return await _transactionRepo.AddAsync(transaction);
    }
}
