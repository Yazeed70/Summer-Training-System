using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Shared;
namespace summer_training_app.Services.Interfaces
{
    public interface IAuthService
    {
        public Task<(string? Token, ApiErrorResponseDTO? Error)> RegisterAsync(RegisterRequestDto registerDto);
        public Task<(string? Token, ApiErrorResponseDTO? Error)> LoginAsync(LoginRequestDto loginDto);
        public Task<ApiErrorResponseDTO?>                        UpdateProfileAsync(UpdateProfileDto updateProfileDto, int userId);

        //public Task<(string? Token, ApiErrorResponseDTO? Error)> DeleteProfileAsync(string profileId);
        //public Task<(string? Token, ApiErrorResponseDTO? Error)> GetProfileAsync(string profileId);
    }
}
