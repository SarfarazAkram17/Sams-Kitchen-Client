import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import Loading from "../../../Components/Loading/Loading";
import { Link } from "react-router";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Pagination } from "antd";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../assets/images/logo.png";

const MyOrders = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { width, height } = useWindowSize();

  const [page, setPage] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myOrders", page],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders", {
        params: { email: userEmail, page, limit: 10 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  useEffect(() => {
    const paidCount = orders.filter((o) => o.payment_status === "paid").length;
    if (paidCount >= 5) {
      setShowConfetti(true);
      setShowCongrats(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setShowCongrats(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orders]);

  const handleCancel = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be cancelled.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep it",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.patch(`/orders/${id}?email=${userEmail}`, {
          status: "cancelled",
        });
        Swal.fire("Cancelled", "Order has been cancelled.", "success");
        refetch();
      } catch (error) {
        Swal.fire("Failed to cancel order.", error.message, "error");
      }
    }
  };

const generateReceipt = (order) => {
  const doc = new jsPDF();
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  const fixedLogoHeight = 20;
  const logoAspectRatio = 3 / 2;
  const logoHeight = fixedLogoHeight;
  const logoWidth = logoHeight * logoAspectRatio;
  const gap = 5;

  const title = "Sam's Kitchen";
  const fontSize = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(57, 43, 18);

  const titleWidth = doc.getTextWidth(title);
  const textHeight = fontSize * 0.3528;
  const totalWidth = logoWidth + gap + titleWidth;
  const startX = (pageWidth - totalWidth) / 2;
  const centerY = margin + logoHeight / 2;
  const textY = centerY + textHeight / 2 - 1;

  doc.addImage(logo, "PNG", startX, margin, logoWidth, logoHeight);
  doc.text(title, startX + logoWidth + gap, textY);

  // Divider
  doc.setLineDash([2, 2], 0);
  doc.line(margin, margin + logoHeight + 10, pageWidth - margin, margin + logoHeight + 10);
  doc.setLineDash([]);

  let currentY = margin + logoHeight + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  // Customer Info
  doc.text(`Customer Name: ${order.customer.firstName} ${order.customer.lastName}`, margin, currentY);
  currentY += 10;
  doc.text(`Customer Email: ${order.customer.email}`, margin, currentY);
  currentY += 10;
  doc.text(`Phone: ${order.customer.phone}`, margin, currentY);
  currentY += 10;

  const address = order.customer.address || {};
  const addressParts = [address.street, address.thana, address.district, address.region].filter(Boolean);
  const addressStr = addressParts.join(", ");
  doc.text(`Address: ${addressStr}`, margin, currentY, { maxWidth: pageWidth - 2 * margin });
  currentY += 15;

  // Order Summary Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text("Order Summary", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // Table
  const tableColumn = ["Item", "Qty × Price", "Subtotal"];
  const tableRows = [];

  order.items.forEach((item) => {
    const unitPrice =
      item.discount > 0
        ? (item.price - (item.price * item.discount) / 100).toFixed(2)
        : Number(item.price).toFixed(2);
    const quantity = item.quantity;
    const subtotal = item.subtotal.toFixed(2);

    tableRows.push([item.name, `${quantity} × ${unitPrice} TK`, `${subtotal} TK`]);
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    styles: { halign: "center", fontSize: 11, cellPadding: 2, valign: "middle" },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  const labelX = margin;
  const valueX = pageWidth - margin;

  // Subtotal
  doc.text(`Subtotal:`, labelX, currentY);
  doc.text(`${Number(order.subtotal).toFixed(2)} TK`, valueX, currentY, { align: "right" });
  currentY += 8;

  // Delivery Charge (conditionally green if free)
  doc.text(`Delivery Charge:`, labelX, currentY);
  const deliveryCharge = Number(order.deliveryCharge);
  if (deliveryCharge === 0) {
    doc.setTextColor(0, 128, 0); // green
    doc.text("Free", valueX, currentY, { align: "right" });
    doc.setTextColor(0); // reset
  } else {
    doc.text(`${deliveryCharge.toFixed(2)} TK`, valueX, currentY, { align: "right" });
  }
  currentY += 8;

  // Discount
  doc.setTextColor(255, 87, 34);
  doc.text(`Discount:`, labelX, currentY);
  doc.text(`- ${Number(order.discount).toFixed(2)} TK`, valueX, currentY, { align: "right" });
  doc.setTextColor(0);
  currentY += 10;

  // Line before total
  doc.setDrawColor(180);
  doc.setLineDash([]);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 128, 0);
  doc.text(`Total Amount:`, labelX, currentY);
  doc.text(`${Number(order.total).toFixed(2)} TK`, valueX, currentY, { align: "right" });

  // Dashed thank you line
  currentY += 15;
  doc.setDrawColor(150);
  doc.setLineDash([2, 2], 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setLineDash([]);

  // Thank You Message
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text("Thank you for ordering with Sam's Kitchen", pageWidth / 2, currentY, {
    align: "center",
  });

  // Save
  doc.save(`receipt_${order._id}.pdf`);
};




  return (
    <div className="p-4">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
        />
      )}
      {showCongrats && (
        <div className="fixed top-1/4 left-1/2 space-y-5 -translate-x-1/2 bg-white border border-primary shadow-lg rounded-xl px-6 py-4 z-50 text-center animate-bounce">
          <h2 className="text-3xl font-bold text-green-600">
            🎉 Congratulations! 🎉
          </h2>
          <p className="text-gray-700 lg">
            You’ve completed 5 or more paid orders!
          </p>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-6">
        My Orders
      </h2>

      {isLoading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-10">
          No orders yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto border border-base-content/10 rounded-lg">
            <table className="table w-full text-center table-xs">
              <thead>
                <tr className="bg-base-200 text-sm">
                  <th>#</th>
                  <th>Order time</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id.$oid || o._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>{new Date(o.placedAt).toLocaleString()}</td>
                    <td className="text-green-600 font-semibold">
                      ৳ {Number(o.total).toLocaleString("en-BD")}
                    </td>
                    <td className="capitalize">
                      {o.status === "pending" && (
                        <span className="text-purple-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "not_assigned" && (
                        <span className="text-blue-500 font-semibold">
                          not assigned to rider
                        </span>
                      )}
                      {o.status === "assigned" && (
                        <span className="text-yellow-600 font-semibold">
                          assigned to rider
                        </span>
                      )}
                      {o.status === "picked" && (
                        <span className="text-orange-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "delivered" && (
                        <span className="text-green-600 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "cancelled" && (
                        <span className="text-red-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {o.payment_status === "not_paid" ? (
                        o.status === "cancelled" ? (
                          " - "
                        ) : (
                          <span className="text-orange-500 font-medium">
                            Not Paid
                          </span>
                        )
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="flex items-center justify-center gap-1">
                      {o.status === "pending" && (
                        <>
                          <Link
                            to={`/dashboard/payment/${o._id.$oid || o._id}`}
                          >
                            <button className="btn btn-xs btn-primary text-white">
                              Pay
                            </button>
                          </Link>
                          <button
                            className="btn btn-xs btn-error text-white"
                            onClick={() => handleCancel(o._id.$oid || o._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {o.status === "cancelled" && "- -"}
                      {o.status !== "cancelled" && o.status !== "pending" && (
                        <button
                          onClick={() => generateReceipt(o)}
                          className="text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                          Download receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  );
};

export default MyOrders;
