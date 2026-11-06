using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Repositories;

namespace PortalPremios.Api.Services;

public class UserService : IUserService
{
    private readonly IJsonRepository<User> _userRepo;

    public UserService(IJsonRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
    {
        var users = await _userRepo.GetAllAsync();
        var user = users.FirstOrDefault(u => 
            u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase) && 
            u.Password == request.Password);

        if (user == null) return null;

        return new LoginResponse(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role,
            user.PointsBalance
        );
    }

    public async Task<User> RegisterUserAsync(CreateUserRequest request)
    {
        var users = await _userRepo.GetAllAsync();
        if (users.Any(u => u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"O nome de usuário '{request.Username}' já está em uso.");
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            Password = request.Password,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Role = request.Role,
            PointsBalance = 0,
            CreatedAt = DateTime.UtcNow
        };

        return await _userRepo.AddAsync(newUser);
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _userRepo.GetAllAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _userRepo.GetByIdAsync(id);
    }
}
