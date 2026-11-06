using Microsoft.AspNetCore.Mvc;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Services;

namespace PortalPremios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _userService.AuthenticateAsync(request);
        if (response == null)
        {
            return Unauthorized(new { message = "Usuário ou senha inválidos." });
        }

        return Ok(response);
    }
}
