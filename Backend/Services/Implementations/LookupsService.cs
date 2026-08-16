using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class LookupsService : ILookupsService
    {
        private readonly SummerTrainingDBContext _context;

        public LookupsService(SummerTrainingDBContext context)
        {
            _context = context;
        }

        public async Task<List<CompanyLookupDto>> GetCompaniesAsync()
        {
            return await _context.Companies
                .Where(c => c.IsApproved && !c.IsDeleted)
                .Select(c => new CompanyLookupDto
                {
                    Id = c.Id,
                    CompanyName = c.CompanyName,
                })
                .ToListAsync();
        }

        public async Task<List<RoleLookupDto>> GetRolesAsync()
        {
            return await _context.Roles
                .Where(r => r.RoleName != "SuperAdmin")
                .Select(r => new RoleLookupDto
                {
                    Id = r.Id,
                    RoleName = r.RoleName
                })
                .ToListAsync();
        }

        public async Task<List<CollegeLookupDto>> GetCollegesAsync()
        {
            return await _context.Colleges
                .Where(c => !c.IsDeleted)
                .Select(c => new CollegeLookupDto
                {
                    Id = c.Id,
                    CollegeName = c.CollegeName,
                })
                .ToListAsync();
        }
    }
}
