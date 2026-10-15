import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUploader } from "../components/FileUploader";

describe("FileUploader", () => {
  it("renders upload area and accepts file selection", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();

    render(<FileUploader onFileSelect={onFileSelect} maxSizeMB={5} />);

    expect(screen.getByText(/Drag & drop your resume file here/i)).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["resume content"], "resume.pdf", { type: "application/pdf" });

    await user.upload(input, file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
