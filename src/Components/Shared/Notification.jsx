import { useState, useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAxios from "../../Hooks/useAxios";
import useAuth from "../../Hooks/useAuth";
import { FaRegBell } from "react-icons/fa6";

const Notification = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null); // 🔹 Ref for dropdown container

  // 🔹 Fetch Notifications (Infinite Query)
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["notifications", userEmail],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(
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
    retry: 3,
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
        <FaRegBell size={23} className={`text-white transition-all duration-300 ${showNotifications ? 'rotate-[20deg]' : ''}`} />
        {unreadCount > 0 && (
          <span className="text-xs bg-[#C5102C] text-white flex justify-center items-center rounded-full h-4.5 w-4.5 indicator-item">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 🔔 Dropdown */}
      {showNotifications && (
        <div className="absolute top-12 hide-scrollbar -right-10 sm:-right-14 bg-white border shadow-md rounded-md w-44 sm:w-56 md:w-64 lg:w-72 max-h-44 sm:max-h-56 md:max-h-64 lg:max-h-72 overflow-y-auto z-50">
          {isLoading ? (
            <p className="p-3 text-sm animate-pulse text-center">Loading...</p>
          ) : data?.pages?.length && data?.pages?.[0].notifications.length ? (
            data.pages.map((page, i) => (
              <div key={i}>
                {page.notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 space-y-2 text-sm font-semibold ${
                      n.isRead ? "bg-white" : "bg-gray-50"
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
