using System.Text.Json;

namespace PortalPremios.Api.Repositories;

public class JsonRepository<T> : IJsonRepository<T> where T : class
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public JsonRepository(string dataDirectory, string fileName)
    {
        if (!Directory.Exists(dataDirectory))
        {
            Directory.CreateDirectory(dataDirectory);
        }

        _filePath = Path.Combine(dataDirectory, fileName);

        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, "[]");
        }
    }

    private async Task<List<T>> ReadAllInternalAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (!File.Exists(_filePath))
            {
                return new List<T>();
            }

            var json = await File.ReadAllTextAsync(_filePath);
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<T>();
            }

            return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task SaveAllInternalAsync(List<T> items)
    {
        await _lock.WaitAsync();
        try
        {
            var json = JsonSerializer.Serialize(items, JsonOptions);
            await File.WriteAllTextAsync(_filePath, json);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await ReadAllInternalAsync();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        var items = await ReadAllInternalAsync();
        var idProp = typeof(T).GetProperty("Id");
        if (idProp == null) return null;

        return items.FirstOrDefault(item =>
        {
            var val = idProp.GetValue(item);
            return val is Guid guidVal && guidVal == id;
        });
    }

    public async Task<T> AddAsync(T entity)
    {
        var items = await ReadAllInternalAsync();
        items.Add(entity);
        await SaveAllInternalAsync(items);
        return entity;
    }

    public async Task<bool> UpdateAsync(Guid id, T entity)
    {
        var items = await ReadAllInternalAsync();
        var idProp = typeof(T).GetProperty("Id");
        if (idProp == null) return false;

        var index = items.FindIndex(item =>
        {
            var val = idProp.GetValue(item);
            return val is Guid guidVal && guidVal == id;
        });

        if (index < 0) return false;

        items[index] = entity;
        await SaveAllInternalAsync(items);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var items = await ReadAllInternalAsync();
        var idProp = typeof(T).GetProperty("Id");
        if (idProp == null) return false;

        var removedCount = items.RemoveAll(item =>
        {
            var val = idProp.GetValue(item);
            return val is Guid guidVal && guidVal == id;
        });

        if (removedCount > 0)
        {
            await SaveAllInternalAsync(items);
            return true;
        }

        return false;
    }
}
