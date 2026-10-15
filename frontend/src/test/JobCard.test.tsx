import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import type { Job } from "../types";

const mockJob: Job = {
  id: 1,
  title: "Python Developer",
  company: "Demo Corp",
  location: "Remote",
  work_mode: "Remote",
  experience_level: "Mid Level",
  description: "Build APIs with FastAPI.",
  required_skills: ["Python", "FastAPI"],
  preferred_skills: ["Docker"],
  salary_range: "$100k - $120k",
  source: "Demo Opportunity",
  source_url: null,
  is_demo: true,
  created_at: new Date().toISOString(),
};

describe("JobCard", () => {
  it("renders job details and match score", () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} matchScore={82} matchLabel="Strong Match" />
      </MemoryRouter>
    );

    expect(screen.getByText("Python Developer")).toBeInTheDocument();
    expect(screen.getByText(/Demo Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/82%/i)).toBeInTheDocument();
    expect(screen.getByText(/Remote/i)).toBeInTheDocument();
  });
});
