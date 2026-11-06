using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Repositories;

namespace PortalPremios.Api.Services;

public class SocialPostService : ISocialPostService
{
    private readonly IJsonRepository<SocialPost> _postRepo;
    private readonly IJsonRepository<User> _userRepo;

    public SocialPostService(
        IJsonRepository<SocialPost> postRepo,
        IJsonRepository<User> userRepo)
    {
        _postRepo = postRepo;
        _userRepo = userRepo;
    }

    public async Task<IEnumerable<SocialPost>> GetFeedAsync()
    {
        var posts = await _postRepo.GetAllAsync();
        return posts.OrderByDescending(p => p.CreatedAt);
    }

    public async Task<SocialPost> CreatePostAsync(CreatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ArgumentException("O conteúdo da publicação não pode ser vazio.");
        }

        var author = await _userRepo.GetByIdAsync(request.AuthorId);
        var authorName = author != null ? (!string.IsNullOrWhiteSpace(author.FullName) ? author.FullName : author.Username) : "Membro da Comunidade";

        var post = new SocialPost
        {
            Id = Guid.NewGuid(),
            AuthorId = request.AuthorId,
            AuthorName = authorName,
            Content = request.Content.Trim(),
            ImageUrl = request.ImageUrl, // suporte extensível a imagens
            LikesCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        return await _postRepo.AddAsync(post);
    }

    public async Task<bool> LikePostAsync(Guid postId)
    {
        var post = await _postRepo.GetByIdAsync(postId);
        if (post == null) return false;

        post.LikesCount += 1;
        return await _postRepo.UpdateAsync(post.Id, post);
    }
}
