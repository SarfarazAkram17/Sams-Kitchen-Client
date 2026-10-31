import { useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Loading from "../../../Components/Loading/Loading";
import { Pagination } from "antd";

const searchOptions = [
  { value: "name", label: "Search by Name" },
  { value: "email", label: "Search by Email" },
];

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "customer", label: "Customer" },
  { value: "rider", label: "Rider" },
  { value: "admin", label: "Admin" },
];

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();

  const [searchType, setSearchType] = useState(searchOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(roleOptions[0]);

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", searchType.value, searchTerm, roleFilter.value, page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users`, {
        params: {
          email: userEmail,
          page,
          limit: 10,
          searchType: searchType.value,
          search: searchTerm,
          role: roleFilter.value,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const total = data?.total || 0;

  return (
    <div className="px-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-primary">
        Manage Users
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <Select
          aria-label="Choose user search field"
          options={searchOptions}
          value={searchType}
          onChange={(selected) => {
            setSearchType(selected);
            setPage(1);
          }}
          className="w-full md:w-1/3"
          classNamePrefix="select"
        />
        <label className="input input-bordered w-full md:w-1/3 flex items-center gap-2">
          <input
            type="search"
            required
            placeholder={`Search by ${searchType.value}`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="grow"
          />
        </label>
        <Select
          aria-label="Filter users by role"
          options={roleOptions}
          value={roleFilter}
          onChange={(selected) => {
            setRoleFilter(selected);
            setPage(1);
          }}
          className="w-full md:w-1/3"
          classNamePrefix="select"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center" role="alert">
          <p className="font-semibold">Users could not be loaded.</p>
          <button type="button" onClick={() => refetch()} className="btn btn-sm btn-primary mt-4">Try again</button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-center mt-10 text-base-content/80 text-lg font-medium">
          No users found.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto border border-base-content/5 rounded-lg">
            <table className="table table-sm text-center w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>#</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Method</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td className="flex justify-center">
                      <img
                        className="h-11 object-cover w-11 rounded-full"
                        src={user.photo}
                        alt={user.name}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.providerId
                        ? user.providerId === "google.com" ? "Google" : 'Facebook'
                        : "Email/Password"}
                    </td>
                    <td className="capitalize">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 w-full">
            <Pagination
              current={page}
              align="center"
              total={total}
              pageSize={10}
              showSizeChanger={false}
              onChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
