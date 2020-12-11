using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SASS_Backend.Models;


namespace SASS_Backend.Services.simplydb
{
    public interface ISimplyDB
    {
        public User Authenticate(string login, string password);
        public bool AddUser(User user);
        public bool DeleteUser(string guid);
        public User GetUser(User user);
        public User GetUser(string id);
        public bool CheckLogin(string login);
        public bool CheckId(string id);
        public List<User> GetUsers();

    }
}
