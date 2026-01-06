import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface DetailAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: any;
}

const DetailAuditModal: React.FC<DetailAuditModalProps> = ({
  isOpen,
  onClose,
  auditLog,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-linear-to-br from-gray-100 via-gray-200 to-gray-100 text-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-700"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-400 transition"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Title */}
          <h2 className="text-3xl font-bold mb-6 text-center text-text tracking-tight">
            Detail Audit
          </h2>

          {/* Audit Details */}
          <div className="space-y-4">
            <DetailRow label="Audit Id" value={auditLog.id} />
            <DetailRow label="Nama admin" value={auditLog.user.userName} />
            <DetailRow
              label="Tipe"
              value={
                <span
                  className={`font-bold ${
                    auditLog.type === "Stock In"
                      ? "text-green-600"
                      : auditLog.type === "Stock Out"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {auditLog.type}
                </span>
              }
            />
            <DetailRow
              label="Nama Barang"
              value={
                <span className="font-semibold text-black">
                  {auditLog.barang.namaBarang}
                </span>
              }
            />
            <DetailRow
              label="Deskripsi"
              value={
                <span className="font-medium text-blue-400">
                  {auditLog.deskripsi ?? auditLog.keterangan}
                </span>
              }
            />
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              className="px-5 py-2 bg-primary   text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Helper component for detail rows
  function DetailRow({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <span className="text-gray-400 font-medium">{label}:</span>
        <span className="ml-4 text-right text-text">{value}</span>
      </div>
    );
  }
};

export default DetailAuditModal;
