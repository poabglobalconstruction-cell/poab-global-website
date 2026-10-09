"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType: "Project" | "Property";
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  itemName,
  itemType,
  isDeleting,
  errorMessage,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  const [confirmInput, setConfirmInput] = useState("");

  // Reset confirmation input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
    }
  }, [isOpen]);

  // Lock body scroll while modal is active and restore on unmount/close
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim() === "DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed && !isDeleting) {
      onConfirm();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-poab-navy/80 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="relative w-full max-w-md bg-white border border-red-200 shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1 text-poab-charcoal/50 hover:text-poab-navy disabled:opacity-40 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-red-100 text-red-700 rounded-none flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-modal-title" className="font-heading text-lg font-bold text-poab-navy">
              {title}
            </h3>
            <span className="text-xs text-red-700 font-semibold uppercase tracking-wider block mt-0.5">
              Permanent Action • Cannot Be Undone
            </span>
          </div>
        </div>

        {/* Warning Explanatory Content */}
        <div className="space-y-3 text-xs text-poab-charcoal leading-relaxed font-light">
          <p>
            You are about to permanently delete the {itemType.toLowerCase()}:
          </p>
          <div className="p-3 bg-poab-stone-light border border-poab-grey-border font-medium text-poab-navy break-words">
            {itemName}
          </div>
          {itemType === "Project" ? (
            <p>
              This action will permanently delete this project, all associated construction progress updates, and uploaded photographs from the website.
            </p>
          ) : (
            <p>
              This action will permanently delete this property listing and all uploaded photographs from the website. Any customer enquiry records are safely preserved in your administrative archives.
            </p>
          )}
          <div className="p-3 bg-amber-50 border-l-2 border-amber-500 text-amber-900 text-[11px]">
            <strong>Need to keep historical records?</strong> Use <strong>Archive</strong> instead to remove it from public view while preserving business history.
          </div>
        </div>

        {/* Error message if deletion failed */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 break-words">
            {errorMessage}
          </div>
        )}

        {/* Accidental-Deletion Challenge Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-poab-grey-border">
          <div>
            <label
              htmlFor="delete-confirm-input"
              className="block text-xs font-semibold text-poab-navy mb-1.5"
            >
              To confirm, type <span className="font-mono text-red-700 font-bold">DELETE</span> below:
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className="w-full px-3.5 py-2.5 bg-white border border-poab-grey-border text-poab-navy text-sm font-mono tracking-wider focus:outline-none focus:border-red-600 disabled:bg-poab-stone-light"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={!isConfirmed || isDeleting}
              isLoading={isDeleting}
              className="w-full sm:w-auto text-xs uppercase tracking-wider bg-red-700 hover:bg-red-800 text-white font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span>Delete Permanently</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
