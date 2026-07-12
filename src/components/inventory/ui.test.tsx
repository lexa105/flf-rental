import { render, screen } from "@testing-library/react";
import { Pill } from "./ui";

describe("Pill", () => {
  it("renders the human-readable label for a known status", () => {
    render(<Pill status="available" />);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders a status dot alongside the label", () => {
    render(<Pill status="checked-out" />);
    expect(screen.getByText("Checked out")).toBeInTheDocument();
  });
});
