using Microsoft.AspNetCore.Mvc;
using PortalPremios.Api.Contracts;
using PortalPremios.Api.Services;

namespace PortalPremios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PointsController : ControllerBase
{
    private readonly IPointsService _pointsService;

    public PointsController(IPointsService pointsService)
    {
        _pointsService = pointsService;
    }

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns()
    {
        var campaigns = await _pointsService.GetCampaignsAsync();
        return Ok(campaigns);
    }

    public record CreateCampaignDto(string Name, string Description);

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignDto dto)
    {
        var campaign = await _pointsService.CreateCampaignAsync(dto.Name, dto.Description);
        return Ok(campaign);
    }

    [HttpPost("campaigns/add-points")]
    public async Task<IActionResult> AddCampaignPoints([FromBody] AddCampaignPointsRequest request)
    {
        try
        {
            var tx = await _pointsService.AddPointsToCampaignAsync(request);
            return Ok(tx);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("distribute")]
    public async Task<IActionResult> DistributePoints([FromBody] DistributePointsRequest request)
    {
        try
        {
            var tx = await _pointsService.DistributePointsToUserAsync(request);
            return Ok(tx);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("statement/campaign/{campaignId:guid}")]
    public async Task<IActionResult> GetCampaignStatement(Guid campaignId)
    {
        var statement = await _pointsService.GetCampaignStatementAsync(campaignId);
        return Ok(statement);
    }

    [HttpGet("statement/user/{userId:guid}")]
    public async Task<IActionResult> GetUserStatement(Guid userId)
    {
        var statement = await _pointsService.GetUserStatementAsync(userId);
        return Ok(statement);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions()
    {
        var statement = await _pointsService.GetAllTransactionsAsync();
        return Ok(statement);
    }
}
