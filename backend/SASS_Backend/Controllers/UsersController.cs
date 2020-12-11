using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using SASS_Backend.Models;
using Microsoft.AspNetCore.Authorization;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SASS_Backend.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly Services.simplydb.ISimplyDB _users;
        //static List<Models.User> _users = new() {
        //    new Models.User() { Id = Guid.NewGuid().ToString(), Login = "adam123", Password = "1234567" },
        //    new Models.User() { Id = Guid.NewGuid().ToString(), Login = "muchomor", Password = "sromotnikowy" },
        //    new Models.User() { Id = Guid.NewGuid().ToString(), Login = "piotrek", Password = "pan" },
        //    new Models.User() { Id = "b0cf29c1-db34-4942-9f73-45977ea195e3", Login = "kubus", Password ="puchatek" },
        //};

        public UsersController(Services.simplydb.ISimplyDB db)
        {
            _users = db;
        }
        [HttpGet]
        public IActionResult GetAll()
        {
           return Ok(_users.GetUsers());
        }

        [Authorize]
        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            return Ok( _users.GetUser(id));
        }

        [HttpPut("{id}")]
        public IActionResult Update([FromBody] User user)
        {
            Models.User old_user = _users.GetUser(user);

            if (user == null)
                return BadRequest("Cannot update user account.");

            _users.DeleteUser(old_user.Id);
            _users.AddUser(user);

            return Ok(user);
        }

        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            if(_users.CheckLogin(user.Login))
            {
                return BadRequest("User already exist.");
            }
            _users.AddUser(user);
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {

            if (_users.DeleteUser(id))
            {
                return Ok();
            }
            return BadRequest("User doesn't exist.");
            

        }

        //[HttpGet]
        //public IActionResult GetAll()
        //{
        //    return Ok(_users);
        //}

        //[HttpGet("{id}")]
        //public IActionResult Get(string id)
        //{
        //    User getu =  _users.FirstOrDefault((u) => u.Id == id);


        //    return  getu is null ? NoContent():Ok(getu);
        //}


        //[HttpPut("{id}")]
        //public IActionResult Update([FromBody] User user)
        //{
        //    Models.User old_user = _users.Find((u) => u.Id == user.Id);

        //    if (user == null)
        //        return BadRequest("Cannot update user account.");

        //    _users.Remove(old_user);
        //    _users.Add(user);

        //    return Ok(user);
        //}


        //[HttpPost]
        //public IActionResult Post([FromBody] User user)
        //{
        //    if (_users.Any((u) => u.Login == user.Login))
        //        return BadRequest("Login is already taken."); //TODO; user juz istnieje.

        //    _users.Add(user);
        //    return Ok(user);
        //}


        //[HttpDelete("{id}")]
        //public IActionResult Delete(string id)
        //{
        //    Models.User user = _users.Find((u) => u.Id == id);

        //    if (user is null)
        //        return BadRequest("User doesn't exist.");

        //    _users.Remove(user);
        //    return Ok();

        //}

    }
}
