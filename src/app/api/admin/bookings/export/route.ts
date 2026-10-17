import { handle } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { exportBookings, parseBookingFilters } from "@/lib/data/bookings";
import { vehicleLabel } from "@/lib/constants";
import { formatTime, toISTDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Stop spreadsheet apps from treating customer text as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV download of bookings (respects the current filters). */
export const GET = handle(async (request: Request) => {
  await requireApiUser("bookings.export");
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const rows = await exportBookings(parseBookingFilters(params));
  const header = [
    "Reference", "Booked on", "Status", "Customer", "Mobile", "Vehicle type", "Company", "Model",
    "Registration", "Service", "Preferred date", "Preferred time", "Problem description", "Admin notes", "Sample",
  ];
  const lines = rows.map((b) =>
    [
      b.reference, toISTDate(b.createdAt), b.status, b.customerName, b.mobile, vehicleLabel(b.vehicleType),
      b.vehicleMake, b.vehicleModel, b.registrationNumber, b.serviceName, b.preferredDate,
      formatTime(b.preferredTime), b.problemDescription, b.adminNotes, b.isSample ? "yes" : "",
    ].map(cell).join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${toISTDate(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
