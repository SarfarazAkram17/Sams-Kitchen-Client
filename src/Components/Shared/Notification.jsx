import { lazy, Suspense, useState, useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAxios from "../../Hooks/useAxios";
import useAuth from "../../Hooks/useAuth";
import { FaRegBell } from "react-icons/fa6";
import { NotificationItemSkeleton } from "../Skeletons/CardSkeletons";

// The list (and its code) is fetched the first time the panel opens.
const loadNotificationList = () => import("./NotificationList");
const NotificationList = lazy(loadNotificationList);

const Notification = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [idleReady, setIdleReady] = useState(false);
  const dropdownRef = useRef(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } =
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
      // Wait until the browser is idle (or the panel is opened) instead of
      // competing with the first paint.
      enabled: !!userEmail && (idleReady || showNotifications),
      refetchInterval: 30000,
    });

  useEffect(() => {
    if (!userEmail) return undefined;
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1500));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(() => setIdleReady(true), { timeout: 4000 });
    return () => cancel(handle);
  }, [userEmail]);

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
        onMouseEnter={loadNotificationList}
        onFocus={loadNotificationList}
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
          className="fixed inset-x-3 top-[3.75rem] z-[100] flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 sm:max-h-[min(80dvh,34rem)]"
          aria-label="Notifications"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
            <div>
              <h2 className="font-bold">Kitchen notes</h2>
              <p className="text-xs text-base-content/55">
                Updates for your account
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {unreadCount} new
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <Suspense
              fallback={
                <div role="status" aria-label="Loading notifications">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <NotificationItemSkeleton key={index} />
                  ))}
                </div>
              }
            >
              <NotificationList
                notifications={notifications}
                isLoading={isLoading || (!data && !isError)}
                isError={isError}
                refetch={refetch}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
            </Suspense>
          </div>
        </section>
      )}
    </div>
  );
};

export default Notification;