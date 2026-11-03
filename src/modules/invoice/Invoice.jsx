import React, { useRef } from "react";
import { CheckCircle } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const Invoice = () => {
  const savedPlan = sessionStorage.getItem("selectedPlan");
  const plan = savedPlan ? JSON.parse(savedPlan) : {};

  const planName = plan.durationLabel || "Plan";
  const tag = plan.planTag || "Selected Plan";
  const amount = Number(plan.discountedTotal || 0);
  const originalTotal = Number(plan.originalTotal || 0);
  const discountAmount = originalTotal - amount;

  const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
  const invoiceRef = useRef(null);

  const paymentDate = new Date();

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const imgHeight = (img.height * pageWidth) / img.width;
        let position = 0;

        pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imgHeight);

        if (imgHeight > pageHeight) {
          while (position + pageHeight < imgHeight) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imgHeight);
          }
        }

        pdf.save(`invoice-${invoiceNumber}.pdf`);
      };
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  return (
    <div className="flex rounded-2xl shadow-lg border border-gray-300 overflow-y-auto scrollbar-hide">
      <div className="flex-1 p-4">
        <div className="flex justify-between gap-4">
          <h2 className="text-[18px] font-medium mb-4">Invoice</h2>

          <button
            type="button"
            onClick={handleDownload}
            className="bg-[#7E00B4] text-white px-4 py-1 mb-4 rounded-[6px] text-xs"
          >
            Download
          </button>
        </div>

        <div
          ref={invoiceRef}
          className="bg-white rounded-xl shadow-lg p-4 border border-[#7E00B4]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-medium">
              Invoice {invoiceNumber}
            </h3>
            <span className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full">
              ● Paid
            </span>
          </div>

          <div className="bg-green-100 text-black p-2 rounded-md flex items-center gap-2 mb-6">
            <CheckCircle size={18} className="text-green-500" />
            Invoice Paid On{" "}
            {paymentDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-700 mb-6">
            <div>
              <p className="text-gray-400">Payment Date & Time</p>
              <p>
                {paymentDate.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p className="text-gray-400 mt-4">To</p>
              <p className="font-medium">
                TALENTRISE TECHNOKRATE PRIVATE LIMITED
              </p>
              <p>
                Plot no 1, Diwan Layout, Manewada, Parwati Nagar, Nagpur,
                Maharashtra, 440027
              </p>

              <p className="text-gray-400 mt-4">Plan Details</p>
              <p>
                {planName} - {tag}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-400">Transaction Id</p>
              <p className="font-medium">PYM{invoiceNumber}HJF</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-3 px-4">Sr.No.</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4">
                    {planName} - {tag}
                  </td>
                  <td className="py-3 px-4">GPay</td>
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4 text-right">₹{amount}/-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Total Amount</span>
              <span className="text-purple-600 font-semibold text-lg">
                ₹{amount}/-
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between mt-2 text-gray-600">
                <span>Discount</span>
                <span>-₹{discountAmount}/-</span>
              </div>
            )}

            <div className="text-gray-600 border-b border-t mt-2 pt-2 pb-2">
              <p className="font-medium">Amount in Words:</p>
              <p className="text-[12px]">Amount received successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;