using Microsoft.AspNetCore.SignalR;

namespace PiiScanner.Api.Hubs;

public class ScanHub : Hub
{
    public async Task SendProgress(string scanId, int current, int total)
    {
        await Clients.All.SendAsync("ReceiveProgress", scanId, current, total);
    }

    public async Task SendScanComplete(string scanId)
    {
        await Clients.All.SendAsync("ScanComplete", scanId);
    }

    public async Task SendError(string scanId, string error)
    {
        await Clients.All.SendAsync("ScanError", scanId, error);
    }
}
