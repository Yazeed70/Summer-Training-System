using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Core;

namespace summer_training_app.Services.Interfaces
{
    public interface ILookupsService
    {
        Task<List<CompanyLookupDto>> GetCompaniesAsync();
        Task<List<RoleLookupDto>> GetRolesAsync();
        Task<List<CollegeLookupDto>> GetCollegesAsync();
    }
}
