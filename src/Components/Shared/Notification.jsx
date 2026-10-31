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
import { FiCheck, FiInbox } from "react-icons/fi";

const Notification = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["notifications", userEmail],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await axiosInstance.get(
          `/notifications?email=${encodeURIComponent(userEmail)}&page=${pageParam}&limit=7`,
        );
        return res.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        allPages.length * 7 < lastPage.total ? allPages.length + 1 : undefined,
      enabled: !!userEmail,
      refetchInterval: 30000,
    });

  useEffect(() => {
    if (!userEmail) return undefined;
    const streamUrl = new URL(
      import.meta.env.DEV
        ? "/api/notifications/stream"
        : "/notifications/stream",
      import.meta.env.DEV
        ? window.location.origin
        : import.meta.env.VITE_Api_Url,
    );
    streamUrl.searchParams.set("email", userEmail);
    const stream = new EventSource(streamUrl.toString(), {
      withCredentials: true,
    });
    const refreshNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userEmail] });
      queryClient.invalidateQueries({ queryKey: ["riderOffers", userEmail] });
    };
    stream.onmessage = refreshNotifications;
    return () => stream.close();
  }, [queryClient, userEmail]);

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosSecure.patch(
        `/notifications/readAll?email=${encodeURIComponent(userEmail)}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userEmail] });
    },
  });

  const notifications =
    data?.pages?.flatMap((page) => page.notifications || []) || [];
  const unreadCount = notifications.filter((item) =>
    item.type === "direct" || item.type === "broadcast" ? !item.isRead : false,
  ).length;

  const handleShowNotifications = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) {
      refetch();
      if (unreadCount > 0) markAllAsReadMutation.mutate();
    }
  };

  useEffect(() => {
    if (!showNotifications) return undefined;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  if (!userEmail) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full text-primary-content cursor-pointer transition hover:bg-primary-content/10 focus-visible:outline-primary-content"
        onClick={handleShowNotifications}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={showNotifications}
      >
        <span className="indicator">
          <FaRegBell size={19} />
          {unreadCount > 0 && (
            <span className="indicator-item min-w-5 rounded-full bg-secondary px-1 text-center text-[10px] font-bold leading-5 text-secondary-content">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </button>

      {showNotifications && (
        <section
          className="absolute right-0 top-full z-[100] mt-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
            <div>
              <h2 className="font-bold">Kitchen notes</h2>
              <p className="text-xs text-base-content/55">
                Updates for your account
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {unreadCount} new
            </span>
          </div>
          <div className="max-h-[min(60vh,24rem)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading notifications">
                <div className="h-14 animate-pulse rounded-xl bg-base-200" />
                <div className="h-14 animate-pulse rounded-xl bg-base-200" />
              </div>
            ) : isError ? (
              <div className="p-5 text-center">
                <p className="text-sm text-base-content/65">
                  Updates could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="btn btn-sm btn-ghost mt-2 text-primary"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`border-b border-base-300/70 px-4 py-3 last:border-0 ${notification.isRead ? "" : "bg-primary/[0.06]"}`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full ${notification.isRead ? "bg-base-200 text-base-content/55" : "bg-primary/15 text-primary"}`}
                    >
                      {notification.isRead ? (
                        <FiCheck size={14} />
                      ) : (
                        <FaRegBell size={12} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-5">
                        {notification.message}
                      </p>
                      <time className="mt-1 block text-[11px] text-base-content/50">
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-5 py-9 text-center">
                <FiInbox className="mx-auto mb-2 text-2xl text-base-content/35" />
                <p className="text-sm font-semibold">Nothing new yet</p>
                <p className="mt-1 text-xs text-base-content/55">
                  We’ll keep your order updates here.
                </p>
              </div>
            )}
          </div>
          {hasNextPage && (
            <button
              type="button"
              className="w-full border-t border-base-300 py-3 text-xs font-bold text-primary hover:bg-base-200"
              onClick={() => fetchNextPage()}
            >
              Load earlier updates
            </button>
          )}
        </section>
      )}
    </div>
  );
};

export default Notification;
