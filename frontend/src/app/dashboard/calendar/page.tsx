"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Filter, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const renderHeader = () => {
        return (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Study Calendar 📅
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Your academic schedule at a glance.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevMonth}
                        className="rounded-xl hover:bg-slate-50"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="px-4 font-black text-lg text-slate-800 uppercase tracking-tighter w-[150px] text-center">
                        {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextMonth}
                        className="rounded-xl hover:bg-slate-50"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, "d");
                const cloneDay = day;

                // Demo events
                const events = [
                    { date: new Date(2024, 2, 15), title: "Mid Term", color: "bg-rose-500" },
                    { date: new Date(2024, 2, 22), title: "Project D.", color: "bg-amber-500" },
                ].filter(e => isSameDay(e.date, day));

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "relative aspect-square md:aspect-[4/3] border-[0.5px] border-slate-50 p-2 lg:p-4 group transition-all duration-200 cursor-pointer overflow-hidden flex flex-col items-start gap-1",
                            !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-300 pointer-events-none" : "hover:bg-indigo-50/10 text-slate-900",
                            isSameDay(day, selectedDate) ? "bg-indigo-50/30 text-indigo-700 ring-2 ring-indigo-600 ring-inset" : ""
                        )}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <span className={cn(
                            "text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full mb-1",
                            isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-lg" : ""
                        )}>
                            {formattedDate}
                        </span>

                        <div className="space-y-1 w-full flex-1">
                            {events.map((e, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 p-1 rounded-md overflow-hidden bg-white/50 backdrop-blur shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className={cn("w-1 h-3 rounded-full shrink-0", e.color)} />
                                    <span className="text-[10px] font-bold text-slate-700 truncate">{e.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">{rows}</div>;
    };

    return (
        <div className="space-y-8 pb-12">
            {renderHeader()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    {renderDays()}
                    {renderCells()}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-2">
                            <CardTitle className="text-xl font-bold">Schedule for {format(selectedDate, "MMM d")}</CardTitle>
                            <CardDescription>Plan your day effectively.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {[
                                { title: "Morning Review", time: "09:00", type: "Study", icon: BookOpen },
                                { title: "Group Discussion", time: "14:30", type: "Collab", icon: Filter },
                            ].map((event, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                                        <event.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 text-sm">{event.title}</h5>
                                        <p className="text-xs font-medium text-slate-500">{event.type} • {event.time}</p>
                                    </div>
                                    <button className="p-1 rounded-full text-slate-400 hover:text-slate-900">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full mt-4 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl h-12">
                                <Plus className="mr-2 h-4 w-4" /> Add Event
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles size={20} className="text-indigo-400" /> AI Scheduler
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                "Looks like you have a busy week coming up! I've cleared Tuesday afternoon for your 'Power Study' session."
                            </p>
                            <Button className="w-full mt-6 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-50 h-10 shadow-lg">
                                Optimize Week
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BookOpen({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
