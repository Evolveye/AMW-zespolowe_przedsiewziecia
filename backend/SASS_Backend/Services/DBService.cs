using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
namespace SASS_Backend.Services
{
    public class DBService
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<simplydb.ISimplyDB, simplydb.SimplyDB>();
        }
        public void Configure() { }

    }
}
