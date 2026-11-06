using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Domain.Enums;
using PortalPremios.Api.Repositories;

namespace PortalPremios.Api.Data;

public static class DataSeeder
{
    public static async Task SeedInitialDataAsync(
        IJsonRepository<User> userRepo,
        IJsonRepository<Product> productRepo,
        IJsonRepository<Campaign> campaignRepo,
        IJsonRepository<PointTransaction> transactionRepo,
        IJsonRepository<SocialPost> postRepo)
    {
        // 1. Seed Usuários (Requisito: usuário admin / senha admin pré-cadastrado)
        var users = (await userRepo.GetAllAsync()).ToList();
        User adminUser;
        if (!users.Any())
        {
            adminUser = new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Username = "admin",
                Password = "admin",
                FullName = "Administrador do Sistema",
                Email = "admin@premios.local",
                Role = UserRole.Admin,
                PointsBalance = 1500,
                CreatedAt = DateTime.UtcNow
            };
            await userRepo.AddAsync(adminUser);

            var userAna = new User
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Username = "ana.silva",
                Password = "123",
                FullName = "Ana Silva",
                Email = "ana.silva@empresa.com",
                Role = UserRole.User,
                PointsBalance = 800,
                CreatedAt = DateTime.UtcNow
            };
            await userRepo.AddAsync(userAna);

            var userLucas = new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Username = "lucas.costa",
                Password = "123",
                FullName = "Lucas Costa",
                Email = "lucas.costa@empresa.com",
                Role = UserRole.User,
                PointsBalance = 450,
                CreatedAt = DateTime.UtcNow
            };
            await userRepo.AddAsync(userLucas);
        }
        else
        {
            adminUser = users.First();
        }

        // 2. Seed Campanhas
        var campaigns = (await campaignRepo.GetAllAsync()).ToList();
        Campaign campaignQ1;
        if (!campaigns.Any())
        {
            campaignQ1 = new Campaign
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Name = "Reconhecimento & Inovação 2026",
                Description = "Campanha corporativa semestral para premiar entregas de valor e ideação.",
                TotalPointsPool = 10000,
                AvailablePoints = 7250,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            };
            await campaignRepo.AddAsync(campaignQ1);
        }
        else
        {
            campaignQ1 = campaigns.First();
        }

        // 3. Seed Prêmios / Produtos (Requisito: produtos pré-cadastrados no JSON)
        var products = (await productRepo.GetAllAsync()).ToList();
        if (!products.Any())
        {
            var seedProducts = new List<Product>
            {
                new Product
                {
                    Id = Guid.NewGuid(),
                    Title = "Fone Noise Cancelling Sony WH-1000XM5",
                    Description = "Cancelamento de ruído premium e som de alta fidelidade para foco total.",
                    PointsCost = 2500,
                    Category = "Eletrônicos",
                    ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    Stock = 15,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Title = "Kindle Paperwhite 16GB",
                    Description = "Tela antirreflexo de 6,8” e iluminação ajustável para leitura confortável.",
                    PointsCost = 1400,
                    Category = "Gadgets",
                    ImageUrl = "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=600&auto=format&fit=crop&q=80",
                    Stock = 30,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Title = "Mochila Antifurto Executiva Impermeável",
                    Description = "Design ergonômico, compartimento para laptop de 16'' e porta USB externa.",
                    PointsCost = 750,
                    Category = "Acessórios",
                    ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
                    Stock = 50,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Title = "Voucher Curso de Certificação Cloud / DevOps",
                    Description = "Acesso completo a exames oficiais e simulados de mercado.",
                    PointsCost = 1800,
                    Category = "Educação",
                    ImageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
                    Stock = 100,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Title = "Cafeteira Nespresso Vertuo Pop",
                    Description = "Cafés expressos e longos de qualidade barista com um toque de botão.",
                    PointsCost = 1200,
                    Category = "Casa & Conforto",
                    ImageUrl = "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
                    Stock = 20,
                    CreatedAt = DateTime.UtcNow
                }
            };

            foreach (var prod in seedProducts)
            {
                await productRepo.AddAsync(prod);
            }
        }

        // 4. Seed Extratos e Histórico
        var transactions = (await transactionRepo.GetAllAsync()).ToList();
        if (!transactions.Any())
        {
            await transactionRepo.AddAsync(new PointTransaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.CampaignCredit,
                Points = 10000,
                CampaignId = campaignQ1.Id,
                CampaignName = campaignQ1.Name,
                Description = "Aporte inicial do comitê de recompensas",
                Timestamp = DateTime.UtcNow.AddDays(-10)
            });

            await transactionRepo.AddAsync(new PointTransaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.DistributionToUser,
                Points = 1500,
                CampaignId = campaignQ1.Id,
                CampaignName = campaignQ1.Name,
                UserId = adminUser.Id,
                Username = adminUser.FullName,
                Description = "Liderança de projeto piloto de inovação",
                Timestamp = DateTime.UtcNow.AddDays(-5)
            });

            await transactionRepo.AddAsync(new PointTransaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.DistributionToUser,
                Points = 800,
                CampaignId = campaignQ1.Id,
                CampaignName = campaignQ1.Name,
                UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Username = "Ana Silva",
                Description = "Entrega com excelência da sprint crítica",
                Timestamp = DateTime.UtcNow.AddDays(-3)
            });

            await transactionRepo.AddAsync(new PointTransaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.DistributionToUser,
                Points = 450,
                CampaignId = campaignQ1.Id,
                CampaignName = campaignQ1.Name,
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Username = "Lucas Costa",
                Description = "Mentoria e apoio a novos integrantes da equipe",
                Timestamp = DateTime.UtcNow.AddDays(-1)
            });
        }

        // 5. Seed Feed Social
        var posts = (await postRepo.GetAllAsync()).ToList();
        if (!posts.Any())
        {
            await postRepo.AddAsync(new SocialPost
            {
                Id = Guid.NewGuid(),
                AuthorId = adminUser.Id,
                AuthorName = adminUser.FullName,
                Content = "Bem-vindos ao novo Portal de Prêmios e Recompensas! Reconhecemos hoje todo o empenho e dedicação de nossos times. Aproveitem o catálogo e continuem brilhando!",
                ImageUrl = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80",
                LikesCount = 12,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            });

            await postRepo.AddAsync(new SocialPost
            {
                Id = Guid.NewGuid(),
                AuthorId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                AuthorName = "Ana Silva",
                Content = "Muito feliz em receber pontos na Campanha de Inovação! Já estou de olho no fone com cancelamento de ruído no catálogo. Obrigado a todo o squad!",
                ImageUrl = null,
                LikesCount = 7,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            });
        }
    }
}
