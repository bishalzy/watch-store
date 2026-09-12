import Input from "./Input";
import { act, render, screen } from "@testing-library/react";
import { setupUIStoreTest } from "../../../utils/test/setupTestStore";
import userEvent from "@testing-library/user-event";

describe("Input component", () => {
  beforeEach(() => {
    // Reset loading state to false before each test
    act(() => {
      setupUIStoreTest({ isLoading: false });
    });
  });

  it("renders input correctly", () => {
    render(<Input id="email" placeholder="Email" data-testid="email" />);
    expect(screen.getByTestId("email")).toBeInTheDocument();
  });

  it("applies error styles when error is present", () => {
    const errorMsg = "Empty username field";
    render(<Input id="username" error={errorMsg} data-testid="username" />);

    const input = screen.getByTestId("username") as HTMLInputElement;
    expect(input).toHaveClass("formElementErrorStyling");
  });

  it("toggles password visibility", async () => {
    render(<Input id="password" type="password" data-testid="password" />);
    const passwordInput = screen.getByTestId("password") as HTMLInputElement;
    const toggleBtn = screen.getByTestId("togglePasswordVisibility");

    expect(passwordInput.type).toBe("password");

    const user = userEvent.setup();
    await user.click(toggleBtn);

    expect(passwordInput.type).toBe("text");
  });

  it("renders input enabled when not loading", () => {
    render(<Input id="test" data-testid="test-input" />);

    const input = screen.getByTestId(/test-input/i);
    expect(input).toBeEnabled();
  });

  it("disables input when loading", () => {
    act(() => {
      setupUIStoreTest({ isLoading: true }); // Set loading true before render
    });

    render(<Input id="test" data-testid="test-input" />);

    const input = screen.getByTestId(/test-input/i);
    expect(input).toBeDisabled();
  });
});
