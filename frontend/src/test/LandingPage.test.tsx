import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";

describe("LandingPage", () => {
  it("renders hero heading and CTA buttons", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your resume/i);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your skills/i);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your next opportunity/i);
    expect(screen.getAllByRole("button", { name: /Analyze My Resume/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Explore Jobs/i }).length).toBeGreaterThan(0);
  });
});
