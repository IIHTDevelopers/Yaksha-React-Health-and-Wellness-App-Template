import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Workouts from "../components/Workouts";

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url.includes("workouts")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              id: 1,
              patientId: "1",
              date: "2024-02-26",
              exercises: [
                {
                  exerciseName: "Running",
                  duration: "30 minutes",
                  intensity: "Medium",
                },
                {
                  exerciseName: "Cycling",
                  duration: "45 minutes",
                  intensity: "High",
                },
              ],
            },
          ]),
      });
    }
    return Promise.reject(new Error("not found"));
  });
});

afterEach(() => {
  global.fetch.mockClear();
  delete global.fetch;
});

describe("boundary", () => {
  test("WorkoutsComponent boundary renders without crashing", async () => {
    render(<Workouts />);
    await waitFor(() =>
      expect(screen.getByText("Workout Logs")).toBeInTheDocument()
    );
  });

  test("WorkoutsComponent boundary fetches and displays workout logs", async () => {
    render(<Workouts />);
    await waitFor(() =>
      expect(screen.getByText(/Patient ID: 1/)).toBeInTheDocument()
    );
    expect(screen.getByText(/Running/)).toBeInTheDocument();
    expect(screen.getByText(/Cycling/)).toBeInTheDocument();
  });

  test("WorkoutsComponent boundary form renders for adding a new workout log", async () => {
    render(<Workouts />);
    await waitFor(() => {
      expect(screen.getByLabelText("Patient ID:")).toBeInTheDocument();
      expect(screen.getByLabelText("Date:")).toBeInTheDocument();
      expect(screen.getByLabelText("Exercise Name:")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Duration (e.g., 30 minutes):")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Intensity (e.g., High, Medium, Low):")
      ).toBeInTheDocument();
    });
  });

  test("WorkoutsComponent boundary submits a new workout log", async () => {
    render(<Workouts />);
    // Assuming the user fills out the form as per the previous test.
    fireEvent.change(screen.getByLabelText("Patient ID:"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Date:"), {
      target: { value: "2024-02-27" },
    });
    fireEvent.change(screen.getByLabelText("Exercise Name:"), {
      target: { value: "Swimming" },
    });
    fireEvent.change(screen.getByLabelText("Duration (e.g., 30 minutes):"), {
      target: { value: "60 minutes" },
    });
    fireEvent.change(
      screen.getByLabelText("Intensity (e.g., High, Medium, Low):"),
      { target: { value: "Low" } }
    );
    fireEvent.click(screen.getByText("Submit Workout Log"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2)); // This assumes the fetch to post a new log is called.
  });
});
