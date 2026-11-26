"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminConsultation = {
  id: string;
  reason: string;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled";
  student: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type SortKey = "student" | "status";
type SortDirection = "asc" | "desc";

export function AdminConsultationsDashboard({
  consultations,
  fetchError,
}: {
  consultations: AdminConsultation[];
  fetchError: string | null;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("student");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedConsultations = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const aValue = sortKey === "student"
        ? `${a.student?.first_name || ""} ${a.student?.last_name || ""}`.trim()
        : a.status;
      const bValue = sortKey === "student"
        ? `${b.student?.first_name || ""} ${b.student?.last_name || ""}`.trim()
        : b.status;

      const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [consultations, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="size-4" aria-hidden="true" />;
    return sortDirection === "asc"
      ? <ArrowUp className="size-4" aria-hidden="true" />
      : <ArrowDown className="size-4" aria-hidden="true" />;
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const statusClassName = (status: AdminConsultation["status"]) => {
    if (status === "completed") return "bg-green-50 text-green-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-blue-50 text-blue-700";
  };

  return (
    <main className="w-full min-h-[calc(100svh-10rem)] text-slate-950">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Admin view</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Student consultations</h1>
          <p className="mt-2 text-slate-600">Read-only overview of all consultation requests.</p>
        </div>

        {fetchError && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {fetchError}
          </div>
        )}

        {sortedConsultations.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No consultations found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="h-12 px-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("student")}
                      className="inline-flex items-center gap-2 font-semibold text-slate-700"
                      aria-label="Sort by student"
                    >
                      Student {sortIcon("student")}
                    </button>
                  </TableHead>
                  <TableHead className="h-12 px-5 font-semibold text-slate-700">Consultation reason</TableHead>
                  <TableHead className="h-12 px-5 font-semibold text-slate-700">Consultation time</TableHead>
                  <TableHead className="h-12 px-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex items-center gap-2 font-semibold text-slate-700"
                      aria-label="Sort by status"
                    >
                      Status {sortIcon("status")}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedConsultations.map((consultation) => (
                  <TableRow key={consultation.id} className="border-slate-100 bg-white hover:bg-slate-50/70">
                    <TableCell className="px-5 py-3 font-medium text-slate-900">
                      {[consultation.student?.first_name, consultation.student?.last_name]
                        .filter(Boolean)
                        .join(" ") || "Unknown student"}
                    </TableCell>
                    <TableCell className="max-w-md px-5 py-3 whitespace-normal leading-6 text-slate-700">
                      {consultation.reason}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-slate-700">
                      {formatDate(consultation.scheduled_at)}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClassName(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </main>
  );
}
