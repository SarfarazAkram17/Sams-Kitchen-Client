import { useState, useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";

const Notification = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null); // 🔹 Ref for dropdown container

  // 🔹 Fetch Notifications (Infinite Query)
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["notifications", userEmail],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosSecure.get(
        `/notifications?email=${userEmail}&page=${pageParam}&limit=7`
      );
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length * 7 < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!userEmail,
    refetchInterval: 1000,
  });

  // 🔹 Mark all as read (direct → isRead, broadcast → readBy array update)
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosSecure.patch(`/notifications/readAll?email=${userEmail}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", userEmail]);
    },
  });

  // 🔹 Unread count
  const unreadCount =
    data?.pages?.reduce(
      (acc, page) =>
        acc +
        page.notifications.filter(
          (n) =>
            (n.type === "direct" && !n.isRead) ||
            (n.type === "broadcast" && !n.isRead)
        ).length,
      0
    ) || 0;

  const handleShowNotifications = () => {
    const toggle = !showNotifications;
    setShowNotifications(toggle);

    // 📌 When opening → mark as read
    if (toggle && unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Icon */}
      <div
        className="indicator cursor-pointer"
        onClick={handleShowNotifications}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6.5 w-6.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="text-xs bg-[#C5102C] text-white flex justify-center items-center rounded-full h-4.5 w-4.5 indicator-item">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 🔔 Dropdown */}
      {showNotifications && (
        <div className="absolute top-10 hide-scrollbar -right-20 bg-white border shadow-md rounded-md w-44 sm:w-56 md:w-64 lg:w-72 h-44 sm:h-56 md:h-64 lg:h-72 overflow-y-auto z-50">
          {isLoading ? (
            <p className="p-3 text-sm animate-pulse">Loading...</p>
          ) : data?.pages?.length ? (
            data.pages.map((page, i) => (
              <div key={i}>
                {page.notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 space-y-2 text-sm ${
                      n.isRead ? "bg-white" : "bg-gray-50 font-semibold"
                    } hover:bg-gray-100`}
                  >
                    <p>🔔 {n.message}</p>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="p-3 text-gray-500 h-full flex justify-center items-center">
              No notifications
            </p>
          )}

          {/* Load more */}
          {hasNextPage && (
            <button
              className="w-full text-xs py-1 bg-gray-100 hover:bg-gray-200"
              onClick={() => fetchNextPage()}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
