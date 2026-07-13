import React, { useState } from "react";
import { CircleHelp, Download, Luggage as Suitcase, Mail, Plane } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { bookingApi, type ManageBookingDetails } from "../Services/api";

const onlineServices = [
  {
    title: "Seat Selection",
    description: "Choose your preferred seat or upgrade to extra legroom in our premium cabins.",
    icon: Suitcase,
  },
  {
    title: "Meal Preferences",
    description: "Pre-order gourmet meals or manage dietary requirements for your flight.",
    icon: Mail,
  },
  {
    title: "Instant Upgrades",
    description: "Check availability for First and Business Class upgrades with your Elite miles.",
    icon: Plane,
  },
  {
    title: "Change Flight",
    description: "Easily modify your travel dates or destinations with flexible Elite terms.",
    icon: CircleHelp,
  },
];

const mapManagedBookingToRouteState = (details: ManageBookingDetails) => {
  const primaryPassenger = details.passengers[0];
  const bookingRecord = details.booking as ManageBookingDetails["booking"] & { booking?: { selected_flight_id?: string } };
  const outboundFlight = {
    airline_name: details.flight.airline_name,
    flight_number: details.flight.flight_number,
    origin_airport_code: details.flight.origin,
    destination_airport_code: details.flight.destination,
    departure_airport: details.flight.origin,
    arrival_airport: details.flight.destination,
    departure_datetime: details.flight.departure,
    arrival_datetime: details.flight.arrival,
    cabin_class: details.booking.cabin_class,
    selected_fare_price: details.booking.total_payment_amount,
    currency_code: details.booking.currency_code,
  };

  const passengers = details.passengers.map((passenger) => ({
    passenger_id: passenger.passenger_id,
    pi_first_name: passenger.first_name,
    pi_last_name: passenger.last_name,
    pi_passenger_type_code: passenger.type,
    pi_contact_email: passenger.email,
    pi_contact_phone: passenger.phone,
  }));

  return {
    booking: details.booking,
    booking_id: details.booking.booking_id,
    bookingId: details.booking.booking_id,
    pnrReference: details.booking.pnr_reference,
    selectedFlight: outboundFlight,
    outboundFlight,
    selectedFlightId: bookingRecord.selected_flight_id || bookingRecord.booking?.selected_flight_id,
    flightSearchId: undefined,
    tripType: details.booking.trip_type || "ONE_WAY",
    currency_code: details.booking.currency_code,
    totalPaymentAmount: details.booking.total_payment_amount,
    passengers,
    passengerIds: passengers.map((passenger) => passenger.passenger_id),
    managedBooking: true,
    primaryPassenger,
    existingAddons: details.addons || [],
  };
};

function ManageBooking(): React.JSX.Element {
  const navigate = useNavigate();
  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [bookingDetails, setBookingDetails] = useState<ManageBookingDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const routeState = bookingDetails ? mapManagedBookingToRouteState(bookingDetails) : null;

  const handleFindBooking = async () => {
    if (!pnr.trim() || !lastName.trim()) {
      setErrorMessage("Please enter both PNR and passenger last name.");
      return;
    }

    try {
      setIsSearching(true);
      setErrorMessage("");
      const response = await bookingApi.getManageBooking(pnr.trim().toUpperCase(), lastName.trim());
      setBookingDetails(response.data);
    } catch (error) {
      setBookingDetails(null);
      setErrorMessage(error instanceof Error ? error.message : "Booking not found.");
    } finally {
      setIsSearching(false);
    }
  };

  const goToAddOns = () => {
    if (!routeState) return;
    navigate("/add-ons", { state: routeState });
  };

  const goToETicket = () => {
    if (!routeState) return;
    navigate("/download-e-ticket", { state: routeState });
  };

  const goToBoardingPass = () => {
    if (!routeState) return;
    navigate("/download-boarding-pass", { state: routeState });
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/additional-services"
          className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-[#073b70]"
        >
          Back
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <section>
            <h1 className="text-5xl font-black text-[#073b70]">Manage My Booking</h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Retrieve your itinerary to select add-ons, download your e-ticket,
              or review your travel information.
            </p>

            <div className="mt-10 rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
              {errorMessage && (
                <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#073b70]">
                    Booking Reference (PNR)
                  </label>
                  <input
                    type="text"
                    value={pnr}
                    onChange={(event) => setPnr(event.target.value.toUpperCase())}
                    placeholder="E.g. HZN7XL"
                    className="h-12 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Found on your ticket or confirmation email.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#073b70]">
                    Passenger Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Enter your last name"
                    className="h-12 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
                  />
                </div>
              </div>

              <hr className="my-8" />

              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={handleFindBooking}
                  disabled={isSearching}
                  className="rounded bg-[#073b70] px-8 py-3 font-bold text-white transition hover:bg-[#052f59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSearching ? "Finding Booking..." : "Find My Booking"}
                </button>

                <button type="button" className="text-[#073b70] hover:underline">
                  Where can I find my PNR?
                </button>
              </div>

              {bookingDetails && routeState && (
                <>
                  <hr className="my-8" />

                  <div className="rounded border border-green-200 bg-green-50 p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-green-700">Booking Found</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Info label="PNR" value={bookingDetails.booking.pnr_reference} />
                      <Info label="Status" value={bookingDetails.booking.booking_status} />
                      <Info label="Passenger" value={`${bookingDetails.passengers[0]?.first_name || ""} ${bookingDetails.passengers[0]?.last_name || ""}`.trim() || "Passenger"} />
                      <Info label="Route" value={`${bookingDetails.flight.origin || "--"} to ${bookingDetails.flight.destination || "--"}`} />
                      <Info label="Flight" value={bookingDetails.flight.flight_number || "Not available"} />
                      <Info label="Payment" value={`${bookingDetails.booking.currency_code || ""} ${bookingDetails.booking.total_payment_amount || ""}`.trim()} />
                      <Info label="Add-ons" value={`${bookingDetails.addons?.length || 0} paid service(s)`} />
                    </div>
                  </div>

                  <hr className="my-8" />

                  <p className="mb-5 text-slate-500">
                    Continue with add-ons or download your travel documents.
                  </p>

                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={goToAddOns}
                      className="rounded border border-[#073b70] px-4 py-3 font-semibold text-[#073b70] hover:bg-slate-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Suitcase size={18} />
                        Manage Add-ons
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={goToETicket}
                      className="rounded border border-[#073b70] px-4 py-3 font-semibold text-[#073b70] hover:bg-slate-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Download size={18} />
                        Download E-ticket
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={goToBoardingPass}
                      className="rounded border border-[#073b70] px-4 py-3 font-semibold text-[#073b70] hover:bg-slate-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Download size={18} />
                        Boarding Pass
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          <aside>
            <h2 className="mb-6 text-3xl font-black text-[#073b70]">Online Services</h2>

            <div className="space-y-4">
              {onlineServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="flex gap-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-[#073b70]">
                      <Icon size={24} strokeWidth={2.2} />
                    </div>

                    <div>
                      <h3 className="font-bold uppercase text-[#073b70]">{service.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-lg bg-[#073b70] p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Elite Benefit</p>
              <h3 className="mt-2 text-3xl font-black">Priority Assistance</h3>
              <p className="mt-4 text-slate-200">
                Need help with your booking? Our dedicated Elite concierge is available 24/7 to assist you.
              </p>
              <Link to="/case-management" className="mt-8 flex w-full items-center justify-center rounded border border-white py-3 font-bold hover:bg-white hover:text-[#073b70]">
                Contact Concierge
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-[#073b70]">{value || "Not available"}</p>
    </div>
  );
}

export default ManageBooking;
