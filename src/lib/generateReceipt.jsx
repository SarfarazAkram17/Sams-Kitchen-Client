import jsPDF from "jspdf";
import logo from "../assets/images/logo.png";

export const generateReceipt = (order) => {
  const doc = new jsPDF();
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Logo setup - keeping original dimensions
  const fixedLogoHeight = 20;
  const logoAspectRatio = 3 / 2;
  const logoHeight = fixedLogoHeight;
  const logoWidth = logoHeight * logoAspectRatio;
  const gap = 5;

  // Title setup
  const title = "Sam's Kitchen";
  const fontSize = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(57, 43, 18);

  // Center logo and title together
  const titleWidth = doc.getTextWidth(title);
  const textHeight = fontSize * 0.3528;
  const totalWidth = logoWidth + gap + titleWidth;
  const startX = (pageWidth - totalWidth) / 2;
  const centerY = margin + logoHeight / 2;
  const textY = centerY + textHeight / 2 - 1;

  doc.addImage(logo, "PNG", startX, margin, logoWidth, logoHeight);
  doc.text(title, startX + logoWidth + gap, textY);

  // Dashed separator line
  doc.setLineDash([2, 2], 0);
  doc.line(
    margin,
    margin + logoHeight + 10,
    pageWidth - margin,
    margin + logoHeight + 10
  );
  doc.setLineDash([]);

  // Order ID and Date row
  let currentY = margin + logoHeight + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0);

  const orderDate = new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  doc.text(`Order ID: ${order._id}`, margin, currentY);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, currentY, {
    align: "right",
  });

  // Customer Details Section
  currentY += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Customer Details", margin, currentY);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60);

  doc.text(
    `Name: ${order.customer.firstName} ${order.customer.lastName}`,
    margin,
    currentY
  );
  currentY += 6;
  doc.text(`Email: ${order.customer.email}`, margin, currentY);
  currentY += 6;
  doc.text(`Phone: ${order.customer.phone}`, margin, currentY);
  currentY += 6;

  const address = order.customer.address || {};
  const addressParts = [
    address.street,
    address.thana,
    address.district,
    address.region,
  ].filter(Boolean);
  const addressStr = addressParts.join(", ");
  doc.text(`Address: ${addressStr}`, margin, currentY, {
    maxWidth: pageWidth - 2 * margin,
  });

  // Order Items Section
  currentY += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Order Items", margin, currentY);
  currentY += 8;

  // Items with images
  order.items.forEach((item) => {
    if (currentY + 30 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    const rowHeight = 22;
    const imgHeight = 20;
    const imgWidth = 25;

    // Item image
    if (item.image) {
      try {
        // For Cloudinary images, convert unsupported formats (AVIF, WEBP) to JPG
        let imageUrl = item.image;

        // Check if it's a Cloudinary URL and convert format if needed
        if (imageUrl.includes("cloudinary")) {
          // Replace unsupported formats with jpg for PDF compatibility
          imageUrl = imageUrl
            .replace(/\.avif(\?|$)/i, ".jpg$1")
            .replace(/\.webp(\?|$)/i, ".jpg$1")
            .replace(/\.svg(\?|$)/i, ".png$1")
            .replace(/\.heic(\?|$)/i, ".jpg$1")
            .replace(/\.heif(\?|$)/i, ".jpg$1")
            .replace(/\.tiff?(\?|$)/i, ".jpg$1")
            .replace(/\.bmp(\?|$)/i, ".jpg$1");

          // Also handle Cloudinary transformation URLs (f_auto, f_avif, etc.)
          imageUrl = imageUrl
            .replace(/f_avif/gi, "f_jpg")
            .replace(/f_webp/gi, "f_jpg")
            .replace(/f_auto/gi, "f_jpg");
        }

        // Detect image format
        let imgFormat = "JPEG";
        if (
          imageUrl.includes("data:image/png") ||
          imageUrl.toLowerCase().includes(".png")
        ) {
          imgFormat = "PNG";
        } else if (
          imageUrl.includes("data:image/gif") ||
          imageUrl.toLowerCase().includes(".gif")
        ) {
          imgFormat = "GIF";
        }

        doc.addImage(
          imageUrl,
          imgFormat,
          margin,
          currentY,
          imgWidth,
          imgHeight
        );
      } catch (e) {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY, imgWidth, imgHeight, "F");
      }
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentY, imgWidth, imgHeight, "F");
    }

    // Item name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(item.name, margin + imgWidth + 5, currentY + 6);

    // Price and quantity info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);

    const unitPrice =
      item.discount > 0
        ? (item.price - (item.price * item.discount) / 100).toFixed(2)
        : Number(item.price).toFixed(2);

    doc.text(
      `${unitPrice} TK × ${item.quantity}`,
      margin + imgWidth + 5,
      currentY + 13
    );

    // Subtotal on right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(34, 85, 51);
    doc.text(
      `${item.subtotal.toFixed(2)} TK`,
      pageWidth - margin,
      currentY + 10,
      {
        align: "right",
      }
    );

    currentY += rowHeight + 5;
  });

  // Summary Section
  currentY += 5;
  doc.setDrawColor(200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  const labelX = margin;
  const valueX = pageWidth - margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  // Subtotal
  doc.text("Subtotal:", labelX, currentY);
  doc.text(`${Number(order.subtotal).toFixed(2)} TK`, valueX, currentY, {
    align: "right",
  });
  currentY += 8;

  // Delivery Charge
  doc.text("Delivery Charge:", labelX, currentY);
  if (Number(order.deliveryCharge) === 0) {
    doc.setTextColor(0, 128, 0);
    doc.text("Free", valueX, currentY, { align: "right" });
    doc.setTextColor(0);
  } else {
    doc.text(
      `${Number(order.deliveryCharge).toFixed(2)} TK`,
      valueX,
      currentY,
      {
        align: "right",
      }
    );
  }
  currentY += 8;

  // Discount
  doc.setTextColor(255, 87, 34);
  doc.text("Discount:", labelX, currentY);
  doc.text(`- ${Number(order.discount).toFixed(2)} TK`, valueX, currentY, {
    align: "right",
  });
  doc.setTextColor(0);
  currentY += 10;

  // Separator line
  doc.setDrawColor(180);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Total Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 128, 0);
  doc.text("Total Amount:", labelX, currentY);
  doc.text(`${Number(order.total).toFixed(2)} TK`, valueX, currentY, {
    align: "right",
  });

  // Footer
  currentY += 15;
  doc.setDrawColor(150);
  doc.setLineDash([2, 2], 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setLineDash([]);

  currentY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text(
    "Thank you for ordering with Sam's Kitchen",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  doc.save(`receipt_${order._id}.pdf`);
};