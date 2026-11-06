using Microsoft.AspNetCore.Mvc;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Services;

namespace PortalPremios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SocialFeedController : ControllerBase
{
    private readonly ISocialPostService _postService;

    public SocialFeedController(ISocialPostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeed()
    {
        var posts = await _postService.GetFeedAsync();
        return Ok(posts);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        try
        {
            var post = await _postService.CreatePostAsync(request);
            return Ok(post);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> LikePost(Guid id)
    {
        var success = await _postService.LikePostAsync(id);
        if (!success) return NotFound(new { message = "Post não encontrado." });
        return Ok(new { success = true });
    }
}
