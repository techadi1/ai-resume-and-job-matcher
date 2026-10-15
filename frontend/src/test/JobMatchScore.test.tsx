import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobMatchScore } from "../components/JobMatchScore";

describe("JobMatchScore", () => {
  it("displays excellent match for high scores", () => {
    render(<JobMatchScore score={90} />);
    expect(screen.getByText(/90%/)).toBeInTheDocument();
    expect(screen.getByText(/Excellent Match/i)).toBeInTheDocument();
  });

  it("displays low match for low scores", () => {
    render(<JobMatchScore score={25} />);
    expect(screen.getByText(/25%/)).toBeInTheDocument();
    expect(screen.getByText(/Low Match/i)).toBeInTheDocument();
  });
});
