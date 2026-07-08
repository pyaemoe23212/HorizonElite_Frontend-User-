import React, { useEffect } from "react";
import { BadgeCheck, CircleHelp, Download, Luggage as Suitcase, Plane, Printer } from "lucide-react";
import { Link, useLocation } from "react-router";

const services = [
    {
        title: "Manage Booking",
        description:
            "Update passenger details, change seats, or adjust flight dates with ease.",
        action: "/manage-booking",
        icon: CircleHelp,
    },
    {
        title: "Check Flight Status",
        description:
            "Real-time arrival and departure information for all global Horizon Elite routes.",
        action: "/flight-status",
        icon: Plane,
    },
    {
        title: "Online Check-in",
        description:
            "Skip the queues and secure your preferred cabin placement 48 hours in advance.",
        action: "/check-in",
        icon: BadgeCheck,
    },
    {
        title: "Download e-Ticket",
        description:
            "Retrieve and download your electronic ticket for offline access.",
        action: "/download-e-ticket",
        icon: Download,
    },
    {
        title: "Boarding Pass",
        description:
            "Generate your digital boarding pass or send directly to your mobile wallet.",
        action: "/download-boarding-pass",
        icon: Download,
    },
    {
        title: "Case Management",
        description:
            "Track feedback, baggage claims, loyalty requests, and service concerns.",
        action: "/case-management",
        icon: Suitcase,
    },
];

function AdditionalServices(): React.JSX.Element {
    const { hash, search, state } = useLocation();
    const isBookingFlow = new URLSearchParams(search).get("flow") === "booking";
    const routeState = (state ?? {}) as Record<string, unknown>;

    useEffect(() => {
        if (!hash) return;
        const target = document.getElementById(hash.replace("#", ""));
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [hash]);

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-14 text-slate-800">
            <section className="mx-auto max-w-7xl">
                <h1 className="text-5xl font-black text-[#073b70]">
                    Additional Services
                </h1>

                <p className="mt-4 max-w-3xl text-lg text-slate-600">
                    {isBookingFlow
                        ? "Choose a service to personalize your trip, customize reminders, and complete your booking preferences."
                        : "Browse the services available for Horizon Elite travelers. Start from your confirmed booking to customize and purchase service options."}
                </p>

                <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
                    {/* Service Cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {services.map((service) => {
                            const Icon = service.icon;
                            const cardClass = "rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg";
                            const content = (
                                <>
                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-[#073b70]">
                                        <Icon size={26} strokeWidth={2.2} />
                                    </div>

                                    <h2 className="mt-5 text-2xl font-black text-[#073b70]">
                                        {service.title}
                                    </h2>

                                    <p className="mt-3 text-slate-600">
                                        {service.description}
                                    </p>

                                    <p className={`mt-6 text-xs font-black uppercase tracking-widest ${isBookingFlow ? "text-cyan-700" : "text-slate-400"}`}>
                                        {isBookingFlow ? "Customize Service" : "Available Service"}
                                    </p>
                                </>
                            );

                            return (
                                <Link
                                    key={service.title}
                                    to={service.action}
                                    state={{ ...routeState, selectedService: service.title }}
                                    className={cardClass}
                                >
                                    {content}
                                </Link>
                            )
                        })}
                    </div>


                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
                            <div className="bg-[#073b70] px-6 py-4 text-white">
                                <h2 className="text-lg font-black uppercase">
                                    Trip Summary
                                </h2>
                            </div>

                            <div className="space-y-4 p-6">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-3xl font-black text-[#073b70]">BKK</p>
                                        <p className="text-slate-500">Bangkok</p>
                                    </div>

                                    <div className="self-center text-slate-400">
                                        <span className="inline-flex items-center gap-2"><Plane size={16} /> Non-stop</span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-3xl font-black text-[#073b70]">SIN</p>
                                        <p className="text-slate-500">Singapore</p>
                                    </div>
                                </div>

                                <hr />

                                <Info label="Flight" value="HE-402" />
                                <Info label="Cabin" value="Business Elite" />
                                <Info label="Booking Ref" value="HE7429BL" />
                                <Info label="Passenger" value="Jonathan Doe" />

                                <hr />

                                <Info label="Base Fare" value="$4,250.00" />
                                <Info label="Taxes" value="$420.00" />

                                <div className="flex justify-between pt-3 text-xl font-black text-[#073b70]">
                                    <span>Total Paid</span>
                                    <span>$4,670.00</span>
                                </div>

                                <Link to="/booking-confirmed" state={routeState} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded bg-[#073b70] font-black text-white">
                                    <Printer size={18} />
                                    Print Itinerary
                                </Link>
                                <Link to="/personalized-services" state={routeState} className="mt-5 inline-block font-black text-cyan-700 hover:underline">
                                    Personalized Services →
                                </Link>
                            </div>
                        </section>

                        <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black text-[#073b70]">
                                Need Assistance?
                            </h2>

                            <p className="mt-3 text-slate-600">
                                Our Elite Concierge is available 24/7 for Business and First
                                Class travelers.
                            </p>

                            <Link to="/case-management" className="mt-5 inline-block font-black text-cyan-700 hover:underline">
                                Live Chat →
                            </Link>
                        </section>
                    </aside>
                </div>
            </section>
        </main>
    );
}

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className="font-bold text-[#073b70]">{value}</span>
        </div>
    );
}

export default AdditionalServices;
