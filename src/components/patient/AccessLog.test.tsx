/**
 * MediPass — AccessLog Component Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessLog, type AccessLogEntry } from "@/components/patient/AccessLog";

function entry(overrides: Partial<AccessLogEntry> = {}): AccessLogEntry {
  return {
    id: "log-1",
    doctorId: "doc-1",
    hospitalName: "Mount Elizabeth",
    fieldsAccessed: ["blood_type", "allergies"],
    timestamp: "2026-06-07T12:00:00.000Z",
    ...overrides,
  };
}

describe("AccessLog", () => {
  it("shows an empty state when there are no events", () => {
    render(<AccessLog entries={[]} />);
    expect(screen.getByText(/no access events yet/i)).toBeInTheDocument();
  });

  it("renders disclosed fields with human labels", () => {
    render(<AccessLog entries={[entry()]} />);

    expect(screen.getByText("Blood Type")).toBeInTheDocument();
    expect(screen.getByText("Allergies")).toBeInTheDocument();
    expect(screen.getByText("Mount Elizabeth")).toBeInTheDocument();
  });

  it("falls back to 'Unknown' when no hospital is recorded", () => {
    render(<AccessLog entries={[entry({ hospitalName: null })]} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
