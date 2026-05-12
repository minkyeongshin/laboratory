"use client";

import { Icon } from "@stellar/design-system";

import "./styles.scss";

const MOCK_PROTOTYPES = [
  {
    id: "1",
    name: "Stellar Skills",
    description: "AI-native developer skill system for Stellar ecosystem",
    timestamp: "2026-05-11",
    externalUrl: "https://stellar-playground-two.vercel.app/?url=stellarskills-theta.vercel.app%252F",
  },
];

export default function Playground() {
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
            <button className="Playground__tab Playground__tab--active">
              Prototypes
              <span className="Playground__badge">0</span>
            </button>
            <button className="Playground__tab">
              Templates
              <span className="Playground__badge">0</span>
            </button>
            <button className="Playground__tab">
              Design System
              <span className="Playground__badge">0</span>
            </button>
          </div>

          <div className="Playground__actions">
            <div className="Playground__search">
              <input
                type="text"
                placeholder="Search..."
              />
            </div>
            <button className="Playground__new-button">
              <Icon.Plus />
              New
            </button>
          </div>
        </div>

        <section className="Playground__section">
          <h2 className="Playground__section-title">MINKYEONG</h2>
          <div className="Playground__list">
            {MOCK_PROTOTYPES.map((prototype) => (
              <a
                key={prototype.id}
                href={prototype.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="Playground__card"
              >
                <div className="Playground__card-content">
                  <div className="Playground__card-name">{prototype.name}</div>
                  <div className="Playground__card-description">
                    {prototype.description}
                  </div>
                </div>
                <div className="Playground__card-meta">
                  <span className="Playground__card-timestamp">
                    {prototype.timestamp}
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
      </div>
    </div>
  );
}
