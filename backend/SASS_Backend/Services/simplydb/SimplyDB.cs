using SASS_Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SASS_Backend.Services.simplydb
{
    public class SimplyDB : ISimplyDB
    {
        private List<User> _users;
        public SimplyDB()
        {
            this._users = new List<User>();

            this._users.Add(new Models.User() { Id = "b0cf29c1-db34-4942-9f73-45977ea195e3", Login = "kubus", Password = "puchatek" });
            this._users.Add(new User() { Id = "a742ca63-8ae4-4e70-a1c5-202e448df705", Login = "awesome-username", Password = "awesome-password" });
            this._users.Add(new Models.User() { Id = Guid.NewGuid().ToString(), Login = "piotrek", Password = "pan" });
            this._users.Add(new Models.User() { Id = Guid.NewGuid().ToString(), Login = "muchomor", Password = "sromotnikowy" });
            this._users.Add(new Models.User() { Id = Guid.NewGuid().ToString(), Login = "adam123", Password = "1234567" });
        }

        public bool AddUser(User user)
        {
            this._users.Add(user);
            return true;
        }

        public bool DeleteUser(string guid)
        {
            var user = this._users.Find((looking) => looking.Id == guid);

            if (user is not null)
            {
                _users.Remove(user);
                return true;
            }
            return false;
        }

        public User GetUser(string guid) => this._users.Find((looking) => looking.Id == guid);

        public User GetUser(User user) => _users.Find(u => u == user);

        public List<User> GetUsers() => this._users;

        public bool CheckId(string id) => _users.Any((user) => user.Id == id);
        public bool CheckLogin(string login) => _users.Any((user) => user.Login == login);


        public bool UserExist(User user) => _users.Any(u => u == user);

        public User Authenticate(string login, string password) => _users.Find(u => u.Login == login && password == u.Password);
    }
}
