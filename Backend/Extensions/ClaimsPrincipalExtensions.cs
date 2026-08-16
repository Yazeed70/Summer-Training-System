using System;
using System.Security.Claims;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Extensions
{

    public static class ClaimsPrincipalExtensions
    {

        public static int? GetInternalUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(value, out var id))
            {
                return id;
            }
            return null;
        }
        public static Guid? GetPublicUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("PublicId")?.Value;
            if (Guid.TryParse(value, out var guid))
            {
                return guid;
            }
            return null;
        }

        public static int? GetUserRoleId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(ClaimTypes.Role)?.Value;
            if (Enum.TryParse<enRoles>(value, out var role))
            {
                return (int)role;
            }

            return null;
        }

        public static int? GetCollegeId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("CollegeId")?.Value;
            if(int.TryParse(value, out var collegeId))
            {
                return collegeId;
            }
            return null;
        }

        public static int? GetCompanyId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("CompanyId")?.Value;
            if (int.TryParse(value, out var companyId))
            {
                return companyId;
            }
            return null;
        }
    }
}
