import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── THUNKS ──────────────────────────────────────────────────────────────────

// 5. Get Notifications (token)
// GET /api/employer/notifications?page=1&limit=10&isRead=false&type=job
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (
    { page = 1, limit = 10, isRead, type } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      if (isRead !== undefined && isRead !== null && isRead !== "all" && isRead !== "") {
        params.append("isRead", isRead);
      }

      if (type && type !== "all") {
        params.append("type", type);
      }

      const queryString = params.toString();
      const res = await axiosInstance.get(
        `/api/employer/notifications${queryString ? `?${queryString}` : ""}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// 6. Get Unread Count (token)
// GET /api/employer/notifications/unread-count
export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/notifications/unread-count");
      // Could be { data: { count: 5 } } or { count: 5 } or { data: 5 }
      const count =
        res.data?.data?.count ??
        res.data?.count ??
        res.data?.unreadCount ??
        (typeof res.data?.data === "number" ? res.data.data : 0);
      return count;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch unread count"
      );
    }
  }
);

// 7. Mark All Read (token)
// PATCH /api/employer/notifications/read-all
export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch("/api/employer/notifications/read-all");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark all as read"
      );
    }
  }
);

// 8. Clear All Notifications (token)
// DELETE /api/employer/notifications/clear-all
export const clearAllNotifications = createAsyncThunk(
  "notification/clearAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/api/employer/notifications/clear-all");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to clear all notifications"
      );
    }
  }
);

// 9. Mark One Read (token)
// PATCH /api/employer/notifications/:id/read
export const markOneNotificationRead = createAsyncThunk(
  "notification/markOneNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/employer/notifications/${id}/read`);
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

// 10. Delete One Notification (token)
// DELETE /api/employer/notifications/:id
export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/employer/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
    totalNotifications: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 5. fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.notifications)
          ? payload.notifications
          : Array.isArray(payload)
          ? payload
          : [];

        state.notifications = list;
        state.totalNotifications =
          payload?.totalNotifications ?? payload?.total ?? payload?.count ?? list.length;
        state.totalPages = payload?.totalPages ?? 1;
        state.currentPage = payload?.currentPage ?? payload?.page ?? 1;

        if (payload?.unreadCount !== undefined) {
          state.unreadCount = payload.unreadCount;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 6. fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // 7. markAllNotificationsRead
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.actionLoading = false;
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // 8. clearAllNotifications
      .addCase(clearAllNotifications.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.actionLoading = false;
        state.notifications = [];
        state.totalNotifications = 0;
        state.unreadCount = 0;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // 9. markOneNotificationRead
      .addCase(markOneNotificationRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.notifications = state.notifications.map((n) => {
          if (n._id === id || n.id === id) {
            return { ...n, isRead: true, read: true };
          }
          return n;
        });
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markOneNotificationRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 10. deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const target = state.notifications.find((n) => n._id === id || n.id === id);
        if (target && !target.isRead && !target.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n._id !== id && n.id !== id
        );
        state.totalNotifications = Math.max(0, state.totalNotifications - 1);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearNotificationError } = notificationSlice.actions;

export default notificationSlice.reducer;
