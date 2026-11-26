"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";

type Consultation = { id: string; reason: string; scheduled_at: string; status: "scheduled" | "completed" | "cancelled" };

export function StudentConsultationDashboard({ firstName, lastName, initialConsultations, fetchError }: { firstName: string; lastName: string; initialConsultations: Consultation[]; fetchError: string | null }) {
  const [consultations, setConsultations] = useState(initialConsultations);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleDateOpen, setScheduleDateOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleDateOpen, setRescheduleDateOpen] = useState(false);
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [originalRescheduleDate, setOriginalRescheduleDate] = useState<Date | undefined>(undefined);
  const [originalRescheduleTime, setOriginalRescheduleTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState(fetchError);
  const [isWorking, setIsWorking] = useState(false);

  const sortedConsultations = useMemo(
    () => [...consultations].sort((a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    ),
    [consultations]
  );

  const openConsultation = (consultation: Consultation) => {
    setSelected(consultation);
    setDetailsOpen(true);
    setNotice(null);
    setError(null);
  };

  const beginReschedule = () => {
    if (!selected) return;
    const date = new Date(selected.scheduled_at);
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setOriginalRescheduleDate(date);
    setOriginalRescheduleTime(time);
    setRescheduleDate(date);
    setRescheduleTime(time);
    setDetailsOpen(false);
    setRescheduleOpen(true);
  };

  const openCancelConfirmation = () => {
    setDetailsOpen(false);
    setConfirmCancelOpen(true);
  };

  const reschedule = async () => {
    if (!selected || !rescheduleDate || !rescheduleTime) return;
    setIsWorking(true); setError(null);
    try {
      const newDateTime = new Date(rescheduleDate);
      const [hours, minutes] = rescheduleTime.split(":").map(Number);
      newDateTime.setHours(hours, minutes, 0, 0);

      const response = await fetch(`/api/consultations/${selected.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_at: newDateTime.toISOString() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Unable to reschedule consultation.");
      const updated = result.data as Consultation;
      setConsultations((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice("Consultation rescheduled successfully.");
      setRescheduleOpen(false); setSelected(updated);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to reschedule consultation.");
    } finally { setIsWorking(false); }
  };

  const cancelConsultation = async () => {
    if (!selected) return;

    const cancelledId = selected.id;
    setIsWorking(true);
    setError(null);

    // Keep the tile visible and update it to the cancelled state immediately.
    setConsultations((current) =>
      current.map((item) =>
        item.id === cancelledId ? { ...item, status: "cancelled" } : item
      )
    );
    setConfirmCancelOpen(false);
    setDetailsOpen(false);
    setSelected(null);

    try {
      const response = await fetch(`/api/consultations/${cancelledId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Unable to cancel consultation.");
      }

      setNotice("Consultation cancelled successfully.");
    } catch (caughtError) {
      // Restore the consultation if the server update fails.
      setConsultations((current) =>
        current.map((item) =>
          item.id === cancelledId ? { ...item, status: "scheduled" } : item
        )
      );
      setError(caughtError instanceof Error ? caughtError.message : "Unable to cancel consultation.");
    } finally {
      setIsWorking(false);
    }
  };

  const completeConsultation = async () => {
    if (!selected) return;

    const completedId = selected.id;
    setIsWorking(true);
    setError(null);

    setConsultations((current) =>
      current.map((item) =>
        item.id === completedId ? { ...item, status: "completed" } : item
      )
    );
    setDetailsOpen(false);
    setSelected(null);

    try {
      const response = await fetch(`/api/consultations/${completedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Unable to complete consultation.");
      }

      const updated = result.data as Consultation;
      setConsultations((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );
      setNotice("Consultation completed successfully.");
    } catch (caughtError) {
      setConsultations((current) =>
        current.map((item) =>
          item.id === completedId ? { ...item, status: "scheduled" } : item
        )
      );
      setError(caughtError instanceof Error ? caughtError.message : "Unable to complete consultation.");
    } finally {
      setIsWorking(false);
    }
  };

  const createConsultation = async () => {
    if (!reason.trim() || !scheduleDate || !scheduleTime) return;
    setIsWorking(true);
    setError(null);

    try {
      const newDateTime = new Date(scheduleDate);
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      newDateTime.setHours(hours, minutes, 0, 0);

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
          scheduled_at: newDateTime.toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Unable to book consultation.");
      }

      const created = result.data as Consultation;
      setConsultations((current) => [...current, created]);
      setNotice("Consultation booked successfully.");
      setReason("");
      setScheduleDate(undefined);
      setScheduleTime("09:00");
      setBookOpen(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to book consultation.");
    } finally {
      setIsWorking(false);
    }
  };

  const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  const openBookingDialog = () => {
    setScheduleDate(undefined);
    setScheduleTime("09:00");
    setReason("");
    setBookOpen(true);
  };

  const isRescheduleUnchanged = Boolean(
    originalRescheduleDate &&
    rescheduleDate &&
    originalRescheduleDate.toDateString() === rescheduleDate.toDateString() &&
    originalRescheduleTime === rescheduleTime
  );

  return (
    <main className="w-full min-h-[calc(100svh-10rem)] bg-white px-1 py-2 text-slate-950">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">My account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Hey, {[firstName, lastName].filter(Boolean).join(" ")}</h1>
          <p className="mt-2 text-slate-600">Manage your upcoming consultations.</p>
        </div>

        {notice && <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700" role="status">{notice}</div>}
        {error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Consultations</h2>
          <Button onClick={openBookingDialog} className="h-11 whitespace-nowrap bg-blue-600 px-6 text-white hover:bg-blue-700">Book New Consultation</Button>
        </div>

        {sortedConsultations.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No upcoming consultations</p>
            <p className="mt-1 text-sm text-slate-500">Your scheduled consultations will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedConsultations.map((consultation) => (
              <button
                key={consultation.id}
                type="button"
                disabled={consultation.status === "cancelled" || consultation.status === "completed"}
                onClick={() => consultation.status === "scheduled" && openConsultation(consultation)}
                className={
                  consultation.status === "cancelled"
                    ? "cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 p-5 text-left opacity-70"
                    : consultation.status === "completed"
                      ? "cursor-not-allowed rounded-xl border border-slate-200 bg-white p-5 text-left"
                      : "rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                }
              >
                <span
                  className={
                    consultation.status === "cancelled"
                      ? "mb-3 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold capitalize text-red-700"
                      : consultation.status === "completed"
                        ? "mb-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold capitalize text-green-700"
                        : "mb-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700"
                  }
                >
                  {consultation.status}
                </span>
                <h3 className="line-clamp-2 font-semibold text-slate-900">{consultation.reason}</h3>
                <p className="mt-3 text-sm text-slate-500">{formatDate(consultation.scheduled_at)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) setSelected(null);
      }}>
        <DialogContent className="border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-slate-950">Consultation details</DialogTitle>
                <DialogDescription className="text-slate-500">{formatDate(selected.scheduled_at)}</DialogDescription>
              </DialogHeader>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">{selected.reason}</p>
              <DialogFooter className="flex w-full flex-row flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  className="h-11 shrink-0 whitespace-nowrap bg-blue-600 px-5 text-white hover:bg-blue-700 disabled:bg-slate-300"
                  disabled={isWorking || selected.status !== "scheduled"}
                  onClick={completeConsultation}
                >
                  {isWorking ? "Completing..." : "Complete consultation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-700 active:translate-y-0"
                  onClick={beginReschedule}
                >
                  Reschedule Consultation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 whitespace-nowrap border-red-200 bg-white px-4 text-red-600 hover:bg-red-50 hover:text-red-700 active:translate-y-0"
                  onClick={openCancelConfirmation}
                >
                  Cancel Consultation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-950">Reschedule consultation</DialogTitle>
            <DialogDescription className="text-slate-500">Choose a new date and time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-700">New date</Label>
              <Popover open={rescheduleDateOpen} onOpenChange={setRescheduleDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-start rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-normal text-slate-700 outline-none"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {rescheduleDate
                      ? rescheduleDate.toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "Select a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[18rem] p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(date) => {
                      setRescheduleDate(date);
                      setRescheduleDateOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700">New time</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger className="h-10 w-full border-slate-300 bg-white text-slate-950">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {Array.from({ length: 25 }, (_, index) => {
                    const hour = 8 + Math.floor(index / 2);
                    const minute = index % 2 === 0 ? "00" : "30";
                    const value = `${String(hour).padStart(2, "0")}:${minute}`;
                    return <SelectItem key={value} value={value}>{value}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" className="h-10 bg-blue-600 text-white hover:bg-blue-700" disabled={isWorking || !rescheduleDate || !rescheduleTime || isRescheduleUnchanged} onClick={reschedule}>{isWorking ? "Saving..." : "Save new time"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-950">Cancel consultation?</DialogTitle>
            <DialogDescription className="text-slate-500">
              This action cannot be undone. The consultation will be removed from your schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 active:translate-y-0"
              disabled={isWorking}
              onClick={cancelConsultation}
            >
              {isWorking ? "Cancelling..." : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-950">Book a new consultation</DialogTitle>
            <DialogDescription className="text-slate-500">Choose a reason, date, and time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-slate-700">Reason for consultation</Label>
              <Textarea
                id="reason"
                value={reason}
                placeholder="Describe what you need help with"
                onChange={(event) => setReason(event.target.value)}
                className="min-h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700">Date</Label>
              <Popover open={scheduleDateOpen} onOpenChange={setScheduleDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-start rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-normal text-slate-700 outline-none"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {scheduleDate
                      ? scheduleDate.toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "Select a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[18rem] p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={(date) => {
                      setScheduleDate(date);
                      setScheduleDateOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700">Time</Label>
              <Select value={scheduleTime} onValueChange={setScheduleTime}>
                <SelectTrigger className="h-10 w-full border-slate-300 bg-white text-slate-950">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {Array.from({ length: 25 }, (_, index) => {
                    const hour = 8 + Math.floor(index / 2);
                    const minute = index % 2 === 0 ? "00" : "30";
                    const value = `${String(hour).padStart(2, "0")}:${minute}`;
                    return <SelectItem key={value} value={value}>{value}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" className="h-10 bg-blue-600 text-white hover:bg-blue-700" disabled={isWorking || !reason.trim() || !scheduleDate || !scheduleTime} onClick={createConsultation}>{isWorking ? "Booking..." : "Book consultation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
