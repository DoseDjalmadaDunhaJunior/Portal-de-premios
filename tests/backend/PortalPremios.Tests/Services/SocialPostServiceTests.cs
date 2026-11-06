using FluentAssertions;
using Moq;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Domain.Entities;
using PortalPremios.Api.Repositories;
using PortalPremios.Api.Services;
using Xunit;

namespace PortalPremios.Tests.Services;

public class SocialPostServiceTests
{
    private readonly Mock<IJsonRepository<SocialPost>> _postRepoMock;
    private readonly Mock<IJsonRepository<User>> _userRepoMock;
    private readonly SocialPostService _postService;

    public SocialPostServiceTests()
    {
        _postRepoMock = new Mock<IJsonRepository<SocialPost>>();
        _userRepoMock = new Mock<IJsonRepository<User>>();
        _postService = new SocialPostService(_postRepoMock.Object, _userRepoMock.Object);
    }

    [Fact]
    public async Task CreatePostAsync_WhenAuthorExists_ShouldCreatePostWithAuthorName()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var author = new User { Id = authorId, FullName = "Carlos Mendes" };

        _userRepoMock.Setup(r => r.GetByIdAsync(authorId)).ReturnsAsync(author);
        _postRepoMock.Setup(r => r.AddAsync(It.IsAny<SocialPost>())).ReturnsAsync((SocialPost p) => p);

        var request = new CreatePostRequest(authorId, "Parabéns ao time pelo fechamento do trimestre!", null);

        // Act
        var post = await _postService.CreatePostAsync(request);

        // Assert
        post.Should().NotBeNull();
        post.AuthorName.Should().Be("Carlos Mendes");
        post.Content.Should().Contain("Parabéns");
        post.LikesCount.Should().Be(0);
        _postRepoMock.Verify(r => r.AddAsync(It.IsAny<SocialPost>()), Times.Once);
    }

    [Fact]
    public async Task LikePostAsync_WhenPostExists_ShouldIncrementLikeCount()
    {
        // Arrange
        var postId = Guid.NewGuid();
        var post = new SocialPost { Id = postId, LikesCount = 5 };

        _postRepoMock.Setup(r => r.GetByIdAsync(postId)).ReturnsAsync(post);
        _postRepoMock.Setup(r => r.UpdateAsync(postId, It.IsAny<SocialPost>())).ReturnsAsync(true);

        // Act
        var result = await _postService.LikePostAsync(postId);

        // Assert
        result.Should().BeTrue();
        post.LikesCount.Should().Be(6);
        _postRepoMock.Verify(r => r.UpdateAsync(postId, post), Times.Once);
    }
}
