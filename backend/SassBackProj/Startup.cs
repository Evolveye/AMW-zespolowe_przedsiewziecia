using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using System.IO;
using SassBackProj.Middleware;
using Microsoft.AspNetCore.Http.Features;

namespace SassBackProj
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddWebSocketServerConnectionManager();
            services.AddDirectoryBrowser();

            services.Configure<FormOptions>(o => {
                o.ValueLengthLimit = int.MaxValue;
                o.MultipartBodyLengthLimit = int.MaxValue;
                o.MemoryBufferThreshold = int.MaxValue;
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {


            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseRouting();

            var options = new DefaultFilesOptions();
            options.DefaultFileNames.Clear();
            options.DefaultFileNames.Add("index.html");
            app.UseDefaultFiles(options);
            #region description
            /*
            UseDefaultFiles must be called before UseStaticFiles to serve the default file. UseDefaultFiles is a URL rewriter that doesn't serve the file.

           With UseDefaultFiles, requests to a folder in wwwroot search for:

           default.htm
           default.html
           index.htm
           index.html
           The first file found from the list is served as though the request were the fully qualified URI. The browser URL continues to reflect the URI requested.
           */
            #endregion



            app.UseStaticFiles(); // using static files from wwwroot-directory. contain only HTML/CSS/JS 
            
            app.UseStaticFiles(new StaticFileOptions // public directory, made to upload and dowlnoad files
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(env.ContentRootPath, "public")),
                    RequestPath = "/public"
            });
            app.UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(env.ContentRootPath, "public")),
                    RequestPath = "/public"
            });





            app.UseWebSockets();

            app.UseWebSocketServer();

            #region Endpoints Routing.

         //   app.Run();
            #endregion
        }
    }
}
