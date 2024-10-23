import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MealPlans from "../components/MealPlans";

beforeEach(() => {
  global.fetch = jest.fn((url) =>
    Promise.resolve({
      json: () => {
        if (url.includes("mealPlans")) {
          return Promise.resolve([
            {
              id: 1,
              patientId: 1,
              date: "2024-02-26",
              meals: [
                { mealType: "Breakfast", description: "Oatmeal with fruits" },
                { mealType: "Lunch", description: "Chicken salad" },
              ],
              totalCalories: 600,
            },
          ]);
        }
        return Promise.resolve([]);
      },
    })
  );
});

afterEach(() => {
  global.fetch.mockClear();
});

describe("boundary", () => {
  test("MealPlansComponent boundary renders without crashing", () => {
    render(<MealPlans />);
  });

  test("MealPlansComponent boundary displays heading", async () => {
    render(<MealPlans />);
    expect(await screen.findByText("Meal Plans")).toBeInTheDocument();
  });

  test("MealPlansComponent boundary fetches and displays meal plans", async () => {
    render(<MealPlans />);
    expect(await screen.findByText(/Patient ID: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Oatmeal with fruits/)).toBeInTheDocument();
  });

  test("MealPlansComponent boundary form renders for adding a new meal plan", async () => {
    render(<MealPlans />);
    await waitFor(() =>
      expect(screen.getByLabelText("Patient ID:")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Date:")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Meal Type:")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Description:")).toBeInTheDocument()
    );
  });

  test("MealPlansComponent boundary submits a new meal plan", async () => {
    render(<MealPlans />);
    fireEvent.change(screen.getByLabelText("Patient ID:"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Date:"), {
      target: { value: "2024-02-27" },
    });
    fireEvent.change(screen.getByLabelText("Meal Type:"), {
      target: { value: "Dinner" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "Grilled Salmon" },
    });

    fireEvent.click(screen.getByText("Submit Meal Plan"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2)); // Assuming 1 call for initial fetch, 1 for post
  });
});
