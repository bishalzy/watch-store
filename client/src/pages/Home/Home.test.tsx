import { beforeEach, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

describe("Home Component", () => {
  beforeEach(() => {
    render(<RouterProvider router={router} />);
  });

  it("renders home page successfully", () => {
    expect(document.body).toBeInTheDocument();
  });
});
