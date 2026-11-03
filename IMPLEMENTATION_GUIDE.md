## Token Expiration & Authorization Implementation Guide

### ✅ Implementation Summary

Your application now has **automatic token expiration and authorization checking** with automatic redirect to login page. Here's what was implemented:

---

## 1. Centralized Axios Instance (`src/api/axiosInstance.js`)

**Purpose:** Single axios instance with built-in interceptors to handle authentication

**Key Features:**
- ✅ **Request Interceptor**: Automatically attaches token from Redux to all API requests
- ✅ **Response Interceptor**: Catches 401 (Unauthorized) and 403 (Forbidden) errors
- ✅ **Auto Logout**: Clears Redux state and localStorage on auth failure
- ✅ **Auto Redirect**: Redirects to `/login` page immediately when token expires

**Code:**
```javascript
// Request adds Bearer token to headers
Authorization: `Bearer ${token}`

// Response catches 401/403 errors
- Dispatches logout() action (clears Redux + localStorage)
- Redirects to /login page
```

---

## 2. Updated Redux Slices

All Redux slices now use the **centralized axiosInstance** instead of individual axios imports:

✅ **Updated Slices:**
- `planSlice.js` - Plan management APIs
- `creditAndTransactionSlice.js` - Credit & billing APIs
- `creditDeductionSlice.js` - Credit deduction APIs
- `contactCustomPlanSlice.js` - Custom plan queries
- `databaseSlice.js` - Candidate database APIs
- `jobSlice.js` - Job management APIs
- `companySlice.js` - Company profile APIs
- `dashboardSlice.js` - Dashboard APIs
- `getCandidateMatches.js` - Candidate matching APIs
- `Signupslice.js` - Signup flow APIs
- `categorySlice.js` - Category APIs

**Benefits:**
- ❌ No more duplicated `getAuthHeader()` functions
- ✅ Consistent error handling across all API calls
- ✅ Automatic token attachment to all requests
- ✅ Centralized token expiration logic

---

## 3. Enhanced Protected Routes (`src/routes/ProtectedRoutes.jsx`)

**Improvements:**
- ✅ Syncs Redux token with localStorage on mount
- ✅ Redirects to login if token is missing
- ✅ Checks for token consistency between Redux and localStorage

**Flow:**
```
User Access → ProtectedRoutes Check
  ├─ Token exists? → Show Protected Content
  └─ No Token? → Redirect to /login
```

---

## 4. How Token Expiration Redirect Works

### **Scenario 1: Token Expires on Backend**

```
1. User makes API request
   ↓
2. Backend returns 401 (Token Expired)
   ↓
3. Response Interceptor catches 401
   ↓
4. Dispatch logout() → Clear Redux + localStorage
   ↓
5. Redirect to /login automatically
   ↓
6. User redirected to login form
```

### **Scenario 2: API Returns 403 (Forbidden)**

```
1. User makes unauthorized API request
   ↓
2. Backend returns 403 (Insufficient permissions)
   ↓
3. Response Interceptor catches 403
   ↓
4. Dispatch logout() → Clear Redis + localStorage
   ↓
5. Redirect to /login
```

### **Scenario 3: Direct Route Protection**

```
User tries to access /dashboard without token
  ↓
ProtectedRoutes checks state.auth.token
  ↓
Token missing? → Redirect to /login
```

---

## 5. Token Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│            Login Success                            │
│  - Token saved to Redux: state.auth.token           │
│  - Token saved to localStorage                      │
└────────────────────┬────────────────────────────────┘
                     ↓
        ┌──────────────────────────┐
        │  User Accesses Protected │
        │  Routes/Pages            │
        └────────┬─────────────────┘
                 ↓
    ┌────────────────────────────────┐
    │  Every API Request             │
    │  Request Interceptor attaches: │
    │  Header: Authorization Bearer  │
    └────────┬───────────────────────┘
             ↓
    ┌────────────────────────────┐
    │  Backend Response          │
    └────┬──────────────────┬────┘
         ↓                  ↓
    ✅ Success         ❌ 401/403 Error
    ↓                  ↓
    Return Data    Logout & Redirect
                   to /login
```

---

## 6. Testing the Implementation

### **Test 1: Manual Token Expiration**
```javascript
// In browser console
localStorage.removeItem('token');
// Try to navigate - should redirect to login
```

### **Test 2: 401 Error Response**
```javascript
// Backend should return 401 when token is invalid
// App will automatically:
// - Clear Redux state
// - Clear localStorage
// - Redirect to login
```

### **Test 3: Protected Route Access**
```javascript
// Try accessing /dashboard without login
// Should redirect to /login
```

---

## 7. Error Handling

The interceptor handles:
- ✅ `401 Unauthorized` - Token expired or invalid
- ✅ `403 Forbidden` - User lacks permissions
- ✅ Network errors - Passed through to Redux error handlers
- ✅ Other errors - Passed through to components for UI handling

---

## 8. Key Files Changed

| File | Change |
|------|--------|
| `src/api/axiosInstance.js` | ✅ **NEW** - Centralized axios with interceptors |
| `src/routes/ProtectedRoutes.jsx` | Enhanced token validation |
| All Redux slices | Updated to use axiosInstance |

---

## 9. Future Enhancements (Optional)

### Add Token Refresh Logic
```javascript
// In axiosInstance response interceptor:
if (status === 401) {
  // Try to refresh token from backend
  const newToken = await refreshToken();
  if (newToken) {
    // Retry original request with new token
  } else {
    // Logout user
  }
}
```

### Add Loading State During Logout
```javascript
// Dispatch a logout action with reason
dispatch(logout('Token expired'));
// Show toast notification to user
toast.error('Session expired. Please login again.');
```

### Monitor Token Expiration Proactively
```javascript
// Optional: Check token expiration time before making requests
const isTokenExpiringSoon = () => {
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const expiresIn = decoded.exp * 1000 - Date.now();
  return expiresIn < 60000; // Less than 1 minute
};
```

---

## 10. Common Issues & Solutions

### Issue: User not redirected after 401 error
**Solution:** Verify backend is returning 401 status (not 200 with error message)

### Issue: Token not being sent with requests
**Solution:** Check Redux state has token: `console.log(store.getState().auth.token)`

### Issue: Redirect loop
**Solution:** Verify `/login` page doesn't require protected routes

### Issue: Token cleared but user not seeing login page
**Solution:** Check browser console for errors, verify `<Outlet />` in ProtectedRoutes

---

## 11. Monitoring & Debugging

### Enable Logging
```javascript
// In axiosInstance.js, uncomment console logs:
console.log('🔐 Token retrieved:', token);
console.log('🔴 Authentication failed:', status);
```

### Check Redux State
```javascript
// In Redux DevTools or console:
store.getState().auth // Check token value
```

### Monitor Network Requests
```javascript
// In browser DevTools → Network tab
// Watch for 401/403 responses
// Check Authorization header is present
```

---

## Summary

✅ **Automatic token expiration detection**
✅ **Automatic 401/403 error handling**
✅ **Automatic logout and redirect**
✅ **Centralized authentication logic**
✅ **Consistent across all API calls**
✅ **Zero user confusion about session expiry**
