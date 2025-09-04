import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Loading from "../../../Components/Loading/Loading";
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import { Pagination } from "antd";

const PendingRiders = () => {
  const { userEmail } = useAuth();
  const [selectedRider, setSelectedRider] = useState(null);
  const axiosSecure = useAxiosSecure();
  const [page, setPage] = useState(1);

  const { isPending, data, refetch } = useQuery({
    queryKey: ["pending-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/riders/pending`, {
        params: {
          email: userEmail,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  const riders = data?.pendingRiders || [];
  const total = data?.total || 0;

  if (isPending) {
    return <Loading></Loading>;
  }

  const handleApprove = async (id, email) => {
    const confirm = await Swal.fire({
      title: `Approve Application?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.patch(`/riders/${id}/status?email=${userEmail}`, {
        status: "active",
        email,
      });

      refetch();

      Swal.fire("Success", `Rider approved successfully`, "success");
    } catch (err) {
      Swal.fire(err.message, "Could not update rider status", "error");
    }
  };

  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: `Reject Application?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.delete(`/riders/${id}?email=${userEmail}`);

      refetch();

      Swal.fire("Success", `Rider rejected successfully`, "success");
    } catch (err) {
      Swal.fire(err.message, "Could not reject user", "error");
    }
  };

  return (
    <div className="px-4">
      {riders.length === 0 ? (
        <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
          There is no Pending Rider Applications
        </h1>
      ) : (
        <>
          {" "}
          <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
            Pending Rider Applications
          </h1>
          <div className="overflow-x-auto rounded-box border-2 border-base-content/5 bg-base-200">
            <table className="table table-sm text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Thana</th>
                  <th>Contact</th>
                  <th>Applied At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((application, i) => (
                  <tr key={application._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>{application.name}</td>
                    <td
                      className="truncate max-w-[100px]"
                      title={application.email}
                    >
                      {application.email}
                    </td>
                    <td>{application.region}</td>
                    <td>{application.district}</td>
                    <td>{application.thana}</td>
                    <td>{application.phone}</td>
                    <td
                      className="truncate max-w-[100px]"
                      title={new Date(application.appliedAt).toLocaleString()}
                    >
                      {new Date(application.appliedAt).toLocaleString()}
                    </td>
                    <td className="flex gap-1 justify-center">
                      <button
                        onClick={() => setSelectedRider(application)}
                        className="btn btn-xs btn-info"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() =>
                          handleApprove(application._id, application.email)
                        }
                        className="btn btn-xs btn-success"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleReject(application._id)}
                        className="btn btn-xs btn-error"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
            {/* Ant Design Pagination */}
            <div className="flex justify-center mt-10">
              <Pagination
                current={page}
                align="center"
                total={total}
                pageSize={10}
                showSizeChanger={false}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
        </>
      )}

      {/* Modal for viewing rider details */}
      {selectedRider && (
        <dialog id="riderDetailsModal" className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-2xl mb-5">Rider requester Details</h3>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedRider.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedRider.email}
              </p>
              <p>
                <strong>Contact:</strong> {selectedRider.phone}
              </p>
              <p>
                <strong>Age:</strong> {selectedRider.age}
              </p>
              <p>
                <strong>Region:</strong> {selectedRider.region}
              </p>
              <p>
                <strong>District:</strong> {selectedRider.district}
              </p>
              <p>
                <strong>Thana:</strong> {selectedRider.thana}
              </p>
              <p>
                <strong>Applied At:</strong>{" "}
                {new Date(selectedRider.appliedAt).toLocaleString()}
              </p>
            </div>

            <div className="modal-action mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedRider(null)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default PendingRiders;
