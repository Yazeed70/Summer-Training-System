using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Controllers.System
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookupsController : ControllerBase
    {
        private readonly ILookupsService _lookupsService;

        public LookupsController(ILookupsService lookupsService)
        {
            _lookupsService = lookupsService;
        }

        [HttpGet("companies")]
        public async Task<IActionResult> GetCompanies()
        {
            var companies = await _lookupsService.GetCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _lookupsService.GetRolesAsync();
            return Ok(roles);
        }

        [HttpGet("colleges")]
        public async Task<IActionResult> GetColleges()
        {
            var colleges = await _lookupsService.GetCollegesAsync();
            return Ok(colleges);
        }
    }
}
