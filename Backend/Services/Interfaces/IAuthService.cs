using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Auth;

namespace summer_training_app.Services.Interfaces
{
    public interface IAuthService
    {
        Task<Result<string>> RegisterAsync(RegisterRequestDto registerDto);
        Task<Result<string>> LoginAsync(LoginRequestDto loginDto);
        Task<Result> UpdateProfileAsync(UpdateProfileDto updateProfileDto, int userId);
    }
}
