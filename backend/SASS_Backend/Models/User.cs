using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SASS_Backend.Models
{
    public class User
    {
        /// <summary>
        /// Type of Guid
        /// </summary>
        public string Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
    }
}
