"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@stellar/design-system";

import "./styles.scss";

type PlaygroundTab = "prototypes" | "templates" | "design-system";

interface PlaygroundPrototype {
  id: string;
  name: string;
  description: string;
  date: string;
  type: "local" | "external";
  href: string;
}

const isDev = process.env.NODE_ENV === "development";

// Pages available to copy when creating a new prototype
// Items without a category appear ungrouped at the top of the dropdown
const EXISTING_PAGES: Array<{ key: string; label: string; category?: string }> = [
  // Ungrouped (appears first)
  { key: "introduction", label: "Introduction" },
  // XDR
  { key: "xdr-to-json", label: "XDR to JSON", category: "XDR" },
  { key: "xdr-json-to", label: "JSON to XDR", category: "XDR" },
  { key: "xdr-diff", label: "Diff XDRs", category: "XDR" },
  // Account
  { key: "account-create-keypair", label: "Create account keypair", category: "Account" },
  { key: "account-fund", label: "Fund account", category: "Account" },
  { key: "account-muxed-create", label: "Create muxed account", category: "Account" },
  { key: "account-muxed-parse", label: "Parse muxed account", category: "Account" },
  // Transactions
  { key: "transaction-dashboard", label: "Transaction dashboard", category: "Transactions" },
  { key: "transaction-build", label: "Build transaction", category: "Transactions" },
  { key: "transaction-sign", label: "Sign transaction", category: "Transactions" },
  { key: "transaction-fee-bump", label: "Fee bump", category: "Transactions" },
  // Smart Contracts
  { key: "contract-explorer", label: "Contract explorer", category: "Smart Contracts" },
  { key: "contract-list", label: "Smart contract list", category: "Smart Contracts" },
  { key: "contract-deploy", label: "Upload and deploy contract", category: "Smart Contracts" },
];

export default function Playground() {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("prototypes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prototype data from API
  const [prototypes, setPrototypes] = useState<PlaygroundPrototype[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Templates and design system (static for now)
  const [templates] = useState<PlaygroundPrototype[]>([]);
  const [designSystem] = useState<PlaygroundPrototype[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formStartFrom, setFormStartFrom] = useState<"blank" | "existing">(
    "blank",
  );
  const [formExistingPage, setFormExistingPage] = useState("");
  const [formIncludeSidebar, setFormIncludeSidebar] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<PlaygroundPrototype | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch prototypes from API
  const fetchPrototypes = useCallback(async () => {
    try {
      const response = await fetch("/api/playground/prototypes");
      if (response.ok) {
        const data = await response.json();
        setPrototypes(data);
      }
    } catch {
      // Silently fail — show empty list
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrototypes();
  }, [fetchPrototypes]);

  const prototypesCount = prototypes.length;
  const templatesCount = templates.length;
  const designSystemCount = designSystem.length;

  const getActiveItems = useCallback((): PlaygroundPrototype[] => {
    switch (activeTab) {
      case "prototypes":
        return prototypes;
      case "templates":
        return templates;
      case "design-system":
        return designSystem;
    }
  }, [activeTab, prototypes, templates, designSystem]);

  const getEmptyStateMessage = (): string => {
    switch (activeTab) {
      case "prototypes":
        return "No prototypes yet";
      case "templates":
        return "No templates yet";
      case "design-system":
        return "No design system items yet";
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormError("");
    setFormStartFrom("blank");
    setFormExistingPage("");
    setFormIncludeSidebar(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    resetForm();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  // Delete handlers
  const openDeleteModal = (e: React.MouseEvent, prototype: PlaygroundPrototype) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(prototype);
    setDeleteError("");
  };

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setIsDeleting(false);
    setDeleteError("");
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError("");

    // Use different API endpoint based on prototype type
    const endpoint =
      deleteTarget.type === "external"
        ? "/api/playground/delete-external-prototype"
        : "/api/playground/delete-prototype";

    const body =
      deleteTarget.type === "external"
        ? { id: deleteTarget.id }
        : { slug: deleteTarget.id };

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete prototype");
        setIsDeleting(false);
        return;
      }

      // Success — close modal and refresh list
      closeDeleteModal();
      fetchPrototypes();
    } catch {
      setDeleteError("Failed to delete prototype. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate name
    if (!formName.trim()) {
      setFormError("Name is required");
      return;
    }

    // Validate existing page selection
    if (formStartFrom === "existing" && !formExistingPage) {
      setFormError("Please select a page to copy");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/playground/create-prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
          startFrom:
            formStartFrom === "existing"
              ? { type: "existing", sourceKey: formExistingPage }
              : { type: "blank", includeSidebar: formIncludeSidebar },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Failed to create prototype");
        setIsSubmitting(false);
        return;
      }

      // Success — open new prototype in new tab
      closeModal();
      window.open(`/playground/prototypes/${data.slug}`, "_blank");
    } catch {
      setFormError("Failed to create prototype. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) {
          closeModal();
        }
        if (deleteTarget) {
          closeDeleteModal();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, closeModal, deleteTarget, closeDeleteModal]);

  // Handle click outside modal to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const activeItems = getActiveItems();

  return (
    <div className="Playground">
      <div className="Playground__container">
        <header className="Playground__header">
          <h1 className="Playground__title">Lab Design Playground</h1>
          <p className="Playground__subtitle">
            Prototypes, templates, and design system
          </p>
        </header>

        <div className="Playground__toolbar">
          <div className="Playground__tabs">
            <button
              className={`Playground__tab ${activeTab === "prototypes" ? "Playground__tab--active" : ""}`}
              onClick={() => setActiveTab("prototypes")}
            >
              Prototypes
              <span className="Playground__badge">{prototypesCount}</span>
            </button>
            <button
              className={`Playground__tab ${activeTab === "templates" ? "Playground__tab--active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              Templates
              <span className="Playground__badge">{templatesCount}</span>
            </button>
            <button
              className={`Playground__tab ${activeTab === "design-system" ? "Playground__tab--active" : ""}`}
              onClick={() => setActiveTab("design-system")}
            >
              Design System
              <span className="Playground__badge">{designSystemCount}</span>
            </button>
          </div>

          <div className="Playground__actions">
            <div className="Playground__search">
              <input type="text" placeholder="Search..." />
            </div>
            {isDev && activeTab === "prototypes" && (
              <button className="Playground__new-button" onClick={openModal}>
                <Icon.Plus />
                New
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="Playground__empty">
            <p className="Playground__empty-message">Loading...</p>
          </div>
        ) : activeItems.length > 0 ? (
          <section className="Playground__section">
            <h2 className="Playground__section-title">MINKYEONG</h2>
            <div className="Playground__list">
              {activeItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="Playground__card"
                >
                  <div className="Playground__card-content">
                    <div className="Playground__card-name">
                      {item.name}
                      {item.type === "external" && (
                        <span className="Playground__card-badge">External</span>
                      )}
                    </div>
                    <div className="Playground__card-description">
                      {item.description}
                    </div>
                  </div>
                  <div className="Playground__card-meta">
                    <span className="Playground__card-timestamp">
                      {item.date}
                    </span>
                    {isDev && (
                      <button
                        className="Playground__card-delete"
                        onClick={(e) => openDeleteModal(e, item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Icon.Trash01 />
                      </button>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className="Playground__empty">
            <p className="Playground__empty-message">{getEmptyStateMessage()}</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="Playground__modal-overlay" onClick={handleOverlayClick}>
          <div className="Playground__modal">
            <div className="Playground__modal-header">
              <h2 className="Playground__modal-title">Create new prototype</h2>
              <button
                className="Playground__modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <Icon.XClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="Playground__modal-form">
              <div className="Playground__form-field">
                <label
                  htmlFor="prototype-name"
                  className="Playground__form-label"
                >
                  Name <span className="Playground__form-required">*</span>
                </label>
                <input
                  id="prototype-name"
                  type="text"
                  className="Playground__form-input"
                  placeholder="My Prototype"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="Playground__form-field">
                <label
                  htmlFor="prototype-description"
                  className="Playground__form-label"
                >
                  Description
                </label>
                <input
                  id="prototype-description"
                  type="text"
                  className="Playground__form-input"
                  placeholder="Short description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="Playground__form-field">
                <label className="Playground__form-label">Start from</label>
                <div className="Playground__form-radio-group">
                  <label className="Playground__form-radio">
                    <input
                      type="radio"
                      name="startFrom"
                      value="blank"
                      checked={formStartFrom === "blank"}
                      onChange={() => {
                        setFormStartFrom("blank");
                        setFormExistingPage("");
                      }}
                      disabled={isSubmitting}
                    />
                    <span>Blank page</span>
                  </label>
                  {formStartFrom === "blank" && (
                    <label className="Playground__form-checkbox Playground__form-checkbox--indented">
                      <input
                        type="checkbox"
                        checked={formIncludeSidebar}
                        onChange={(e) => setFormIncludeSidebar(e.target.checked)}
                        disabled={isSubmitting}
                      />
                      <span>Include sidebar</span>
                    </label>
                  )}
                  <label className="Playground__form-radio">
                    <input
                      type="radio"
                      name="startFrom"
                      value="existing"
                      checked={formStartFrom === "existing"}
                      onChange={() => setFormStartFrom("existing")}
                      disabled={isSubmitting}
                    />
                    <span>Existing Lab page</span>
                  </label>
                </div>

                {formStartFrom === "existing" && (
                  <select
                    className="Playground__form-select"
                    value={formExistingPage}
                    onChange={(e) => setFormExistingPage(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select a page...</option>
                    {/* Ungrouped items first */}
                    {EXISTING_PAGES.filter((p) => !p.category).map((page) => (
                      <option key={page.key} value={page.key}>
                        {page.label}
                      </option>
                    ))}
                    {/* Grouped items */}
                    {["XDR", "Account", "Transactions", "Smart Contracts"].map(
                      (category) => (
                        <optgroup key={category} label={category}>
                          {EXISTING_PAGES.filter(
                            (p) => p.category === category,
                          ).map((page) => (
                            <option key={page.key} value={page.key}>
                              {page.label}
                            </option>
                          ))}
                        </optgroup>
                      ),
                    )}
                  </select>
                )}
              </div>

              {formError && (
                <div className="Playground__form-error">{formError}</div>
              )}

              <div className="Playground__modal-actions">
                <button
                  type="button"
                  className="Playground__modal-cancel"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="Playground__modal-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="Playground__modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="Playground__modal Playground__modal--delete">
            <div className="Playground__modal-header">
              <h2 className="Playground__modal-title">Delete prototype</h2>
              <button
                className="Playground__modal-close"
                onClick={closeDeleteModal}
                aria-label="Close modal"
              >
                <Icon.XClose />
              </button>
            </div>

            <div className="Playground__modal-body">
              <p>
                Delete &ldquo;{deleteTarget.name}&rdquo; prototype? This cannot
                be undone.
              </p>

              {deleteError && (
                <div className="Playground__form-error">{deleteError}</div>
              )}
            </div>

            <div className="Playground__modal-actions">
              <button
                type="button"
                className="Playground__modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="Playground__modal-submit Playground__modal-submit--danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
