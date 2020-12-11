using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using SASS_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using SASS_Backend.Services.simplydb;

namespace SASS_Backend.Controllers
{
    [Route("api/authenticate")]
    public class AuthenticateControler : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ISimplyDB _db;

        public AuthenticateControler(IConfiguration configuration, ISimplyDB db)
        {
            this._configuration = configuration;
            this._db = db;
        }


        [HttpPost]
        public IActionResult Post()
        {
            var authorizationHeader = Request.Headers["Authorization"].First();
            var key = authorizationHeader.Split(' ')[1];
            var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(key)).Split(':');
            var serverSecret = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:ServerSecret"]));

            if (_db.Authenticate(credentials[0], credentials[1]) is not null)
            {
                var result = new { token = GenerateToken(serverSecret) };
                return Ok(result);
            }

            return BadRequest("Authoryzation goes wrong.");
        }

        private string GenerateToken(SecurityKey key)
        {
            var now = DateTime.UtcNow;
            var issuer = _configuration["JWT:Issuer"];
            var audience = _configuration["JWT:Audience"];
            var identity = new ClaimsIdentity();
            var signingCredentials = new SigningCredentials(key,
           SecurityAlgorithms.HmacSha256);
            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateJwtSecurityToken(issuer, audience, identity,
           now, now.Add(TimeSpan.FromHours(1)), now, signingCredentials);
            var encodedJwt = handler.WriteToken(token);
            return encodedJwt;
        }
    }
}
