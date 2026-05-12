"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@stellar/design-system";

import "./styles.scss";

type PlaygroundTab = "prototypes" | "templates" | "design-system";

interface PlaygroundItem {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  externalUrl: string;
}

const INITIAL_PROTOTYPES: PlaygroundItem[] = [
  {
    id: "1",
    name: "Stellar Skills",
    description: "AI-native developer skill system for Stellar ecosystem",
    timestamp: "2026-05-11",
    externalUrl:
      "https://stellar-playground-two.vercel.app/?url=stellarskills-theta.vercel.app%252F",
  },
];

/**
 * Validates if a string is a valid URL
 */
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Returns today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Generates a unique ID for new items
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function Playground() {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("prototypes");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Item state for each tab
  const [prototypes, setPrototypes] =
    useState<PlaygroundItem[]>(INITIAL_PROTOTYPES);
  const [templates, setTemplates] = useState<PlaygroundItem[]>([]);
  const [designSystem, setDesignSystem] = useState<PlaygroundItem[]>([]);

  // Form state
  const [formUrl, setFormUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  const prototypesCount = prototypes.length;
  const templatesCount = templates.length;
  const designSystemCount = designSystem.length;

  const getActiveItems = useCallback((): PlaygroundItem[] => {
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

  const getTabLabel = (): string => {
    switch (activeTab) {
      case "prototypes":
        return "prototype";
      case "templates":
        return "template";
      case "design-system":
        return "design system item";
    }
  };

  const resetForm = () => {
    setFormUrl("");
    setFormTitle("");
    setFormDescription("");
    setFormError("");
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate URL
    if (!formUrl.trim()) {
      setFormError("URL is required");
      return;
    }

    if (!isValidUrl(formUrl.trim())) {
      setFormError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    // Validate title
    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }

    const newItem: PlaygroundItem = {
      id: generateId(),
      name: formTitle.trim(),
      description: formDescription.trim(),
      timestamp: getTodayDate(),
      externalUrl: formUrl.trim(),
    };

    // Add to the appropriate list based on active tab
    switch (activeTab) {
      case "prototypes":
        setPrototypes((prev) => [...prev, newItem]);
        break;
      case "templates":
        setTemplates((prev) => [...prev, newItem]);
        break;
      case "design-system":
        setDesignSystem((prev) => [...prev, newItem]);
        break;
    }

    closeModal();
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, closeModal]);

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
            <button className="Playground__new-button" onClick={openModal}>
              <Icon.Plus />
              New
            </button>
          </div>
        </div>

        {activeItems.length > 0 ? (
          <section className="Playground__section">
            <h2 className="Playground__section-title">MINKYEONG</h2>
            <div className="Playground__list">
              {activeItems.map((item) => (
                <a
                  key={item.id}
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="Playground__card"
                >
                  <div className="Playground__card-content">
                    <div className="Playground__card-name">{item.name}</div>
                    <div className="Playground__card-description">
                      {item.description}
                    </div>
                  </div>
                  <div className="Playground__card-meta">
                    <span className="Playground__card-timestamp">
                      {item.timestamp}
                    </span>
                    <span className="Playground__card-open">
                      <Icon.LinkExternal01 />
                    </span>
                    <button
                      className="Playground__card-delete"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Icon.Trash01 />
                    </button>
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
          <div className="Playground__modal" ref={modalRef}>
            <div className="Playground__modal-header">
              <h2 className="Playground__modal-title">
                Add new {getTabLabel()}
              </h2>
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
                  htmlFor="playground-url"
                  className="Playground__form-label"
                >
                  URL <span className="Playground__form-required">*</span>
                </label>
                <input
                  id="playground-url"
                  type="text"
                  className="Playground__form-input"
                  placeholder="https://my-prototype.vercel.app"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="Playground__form-field">
                <label
                  htmlFor="playground-title"
                  className="Playground__form-label"
                >
                  Title <span className="Playground__form-required">*</span>
                </label>
                <input
                  id="playground-title"
                  type="text"
                  className="Playground__form-input"
                  placeholder="My Prototype"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="Playground__form-field">
                <label
                  htmlFor="playground-description"
                  className="Playground__form-label"
                >
                  Description
                </label>
                <input
                  id="playground-description"
                  type="text"
                  className="Playground__form-input"
                  placeholder="Short description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {formError && (
                <div className="Playground__form-error">{formError}</div>
              )}

              <div className="Playground__modal-actions">
                <button
                  type="button"
                  className="Playground__modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="Playground__modal-submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
