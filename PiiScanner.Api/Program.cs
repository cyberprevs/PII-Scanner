using PiiScanner.Api.Hubs;
using PiiScanner.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS pour permettre Electron de se connecter
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowElectron", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add custom services
builder.Services.AddSingleton<ScanService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowElectron");

// Désactiver HTTPS redirect en développement pour SignalR
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<ScanHub>("/scanhub").RequireCors("AllowElectron");

app.Run();
