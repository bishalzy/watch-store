import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage Component", () => {
  it("renders the error message without prefix by default", () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders the error message with dash prefix if isInputFieldError is true", () => {
    render(<ErrorMessage message="Invalid input" isInputFieldError />);
    expect(screen.getByTestId("error")).toHaveTextContent("- Invalid input");
  });

  it("applies custom className", () => {
    render(<ErrorMessage message="Class test" className="custom-class" />);
    const errorElement = screen.getByText("Class test");
    expect(errorElement).toHaveClass("custom-class");
  });
});
