# Backend CORS Configuration Checklist

## ✅ Cần có trong Program.cs hoặc Startup.cs:

```csharp
// 1. Add CORS service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            // Allow localhost for development
            if (origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:"))
                return true;
            
            // Allow production domains
            if (origin == "https://custom-bracelet-with-gps-website.vercel.app")
                return true;
                
            return false;
        })
        .AllowAnyMethod()        // ← QUAN TRỌNG: Allow OPTIONS, POST, GET, etc.
        .AllowAnyHeader()        // ← QUAN TRỌNG: Allow Content-Type, Authorization, etc.
        .AllowCredentials();     // ← QUAN TRỌNG NẾU DÙNG COOKIES/AUTH
    });
});

// ... other services ...

var app = builder.Build();

// 2. Use CORS middleware (PHẢI Ở TRƯỚC UseAuthorization!)
app.UseCors("AllowFrontend");  // ← PHẢI Ở ĐÂY!

// 3. Other middlewares
app.UseAuthentication();  // Nếu có
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## 🔍 Các lỗi thường gặp:

### ❌ Lỗi 1: Thiếu `.AllowAnyMethod()`
→ Preflight OPTIONS request sẽ bị block

### ❌ Lỗi 2: Thiếu `.AllowAnyHeader()`
→ Headers như `Content-Type`, `Authorization` sẽ bị block

### ❌ Lỗi 3: `UseCors()` ở SAU `UseAuthorization()`
→ CORS check sẽ không chạy đúng

### ❌ Lỗi 4: Thiếu `.AllowCredentials()` khi frontend gửi cookies
→ Credentials sẽ bị block

## 🧪 Test CORS từ browser:

Mở Console (F12) và chạy:

```javascript
fetch('http://localhost:5037/api/Auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test@123'
  })
})
.then(res => {
  console.log('✅ CORS OK! Status:', res.status);
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('❌ CORS Error:', err))
```

Nếu thấy lỗi CORS, backend config chưa đúng.
Nếu thấy 401/400, backend config đã OK (chỉ là credentials sai).
