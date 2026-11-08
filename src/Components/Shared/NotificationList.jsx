import { useEffect, useRef } from "react";
import { FaRegBell } from "react-icons/fa6";
import { FiCheck, FiInbox } from "react-icons/fi";
import { NotificationItemSkeleton } from "../Skeletons/CardSkeletons";

// The notification list. Loaded on demand (see Notification.jsx) and it loads
// older updates by itself as you scroll to the end.
const NotificationList = ({
  notifications,
  isLoading,
  isError,
  refetch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, notifications.length]);

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading notifications">
        {[0, 1, 2, 3, 4].map((index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-base-content/65">Updates could not be loaded.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-sm btn-ghost mt-2 text-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="px-5 py-9 text-center">
        <FiInbox className="mx-auto mb-2 text-2xl text-base-content/35" />
        <p className="text-sm font-semibold">Nothing new yet</p>
        <p className="mt-1 text-xs text-base-content/55">We’ll keep your order updates here.</p>
      </div>
    );
  }

  return (
    <>
      {notifications.map((notification) => (
        <article
          key={notification._id}
          className={`border-b border-base-300/70 px-4 py-3 last:border-0 ${notification.isRead ? "" : "bg-primary/[0.06]"}`}
        >
          <div className="flex gap-3">
            <span
              className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full ${
                notification.isRead ? "bg-base-200 text-base-content/55" : "bg-primary/15 text-primary"
              }`}
            >
              {notification.isRead ? <FiCheck size={14} /> : <FaRegBell size={12} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm leading-5">{notification.message}</p>
              <time className="mt-1 block text-[11px] text-base-content/50">
                {new Date(notification.createdAt).toLocaleString()}
              </time>
            </div>
          </div>
        </article>
      ))}
      {isFetchingNextPage && (
        <div role="status" aria-label="Loading earlier updates">
          <NotificationItemSkeleton />
          <NotificationItemSkeleton />
        </div>
      )}
      {hasNextPage && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
    </>
  );
};

export default NotificationList;
