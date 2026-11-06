using PortalPremios.Api.Data;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Repositories;
using PortalPremios.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers e JSON
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuração do CORS para frontend React Vite
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configuração de Persistência JSON
var dataDir = Path.Combine(builder.Environment.ContentRootPath, "Data", "Storage");
Directory.CreateDirectory(dataDir);

builder.Services.AddSingleton<IJsonRepository<User>>(new JsonRepository<User>(dataDir, "users.json"));
builder.Services.AddSingleton<IJsonRepository<Product>>(new JsonRepository<Product>(dataDir, "products.json"));
builder.Services.AddSingleton<IJsonRepository<Campaign>>(new JsonRepository<Campaign>(dataDir, "campaigns.json"));
builder.Services.AddSingleton<IJsonRepository<PointTransaction>>(new JsonRepository<PointTransaction>(dataDir, "transactions.json"));
builder.Services.AddSingleton<IJsonRepository<SocialPost>>(new JsonRepository<SocialPost>(dataDir, "posts.json"));

// Registro de Serviços da Camada de Aplicação
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IPointsService, PointsService>();
builder.Services.AddScoped<ISocialPostService, SocialPostService>();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Execução do Seeding Inicial de Dados Acadêmicos / Estudo
using (var scope = app.Services.CreateScope())
{
    var userRepo = scope.ServiceProvider.GetRequiredService<IJsonRepository<User>>();
    var prodRepo = scope.ServiceProvider.GetRequiredService<IJsonRepository<Product>>();
    var campRepo = scope.ServiceProvider.GetRequiredService<IJsonRepository<Campaign>>();
    var txRepo = scope.ServiceProvider.GetRequiredService<IJsonRepository<PointTransaction>>();
    var postRepo = scope.ServiceProvider.GetRequiredService<IJsonRepository<SocialPost>>();

    await DataSeeder.SeedInitialDataAsync(userRepo, prodRepo, campRepo, txRepo, postRepo);
}

app.Run();
