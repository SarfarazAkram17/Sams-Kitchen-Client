import { Pagination } from "antd";

// Pagination used across the app: always on the right, themed through .app-pagination.
const AppPagination = ({ className = "mt-10", ...props }) => (
  <nav aria-label="Pagination" className={`app-pagination flex w-full justify-end ${className}`}>
    <Pagination showSizeChanger={false} showLessItems {...props} />
  </nav>
);

export default AppPagination;
