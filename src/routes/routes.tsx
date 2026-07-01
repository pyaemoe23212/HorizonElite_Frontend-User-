import { createBrowserRouter } from "react-router";
import AddOns from "../Pages/AddOns";
import FlightResults from "../Pages/FlightResults";
import Layout from "../Layout";
import Home from "../Pages/Home";
import PassengerInformation from "../Pages/PassengerInformation";
import Payment from "../Pages/Payment";
import Profile from "../Pages/Profile";
import Signin from "../Pages/Signin";
import Signup from "../Pages/Signup";
import AdditionalServices from "../Pages/AdditionalServices";
import ManageBooking from "../Pages/ManageBooking";
import FlightStatus from "../Pages/FlightStatus";
import CheckIn from "../Pages/CheckIn";
import DownloadETicket from "../Pages/DownloadETicket";
import DownloadBoardingPass from "../Pages/DownloadBoardingPass";
import BookingConfirmed from "../Pages/BookingConfirmed";
import CaseManagement from "../Pages/CaseManagement";
import PersonalizedServices from "../Pages/PersonalizedServices";
import AuthLayout from "../components/AuthLayout";

const router = createBrowserRouter([
  {
    // Root wrapper — provides AuthContext to ALL routes
    Component: AuthLayout,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            index: true,
            Component: Home
          }
        ]
      },
      {
        path: "/signin",
        Component: Signin
      },
      {
        path: "/signup",
        Component: Signup
      },
      {
        path: "/profile",
        Component: Profile
      },
      {
        path: "/flight-results",
        Component: FlightResults
      },
      {
        path: "/passenger-information",
        Component: PassengerInformation
      },
      {
        path: "/add-ons",
        Component: AddOns
      },
      {
        path: "/payment",
        Component: Payment
      },
      {
        path: "/booking-confirmed",
        Component: BookingConfirmed
      },
      {
        path: "/additional-services",
        Component: AdditionalServices
      },
      {
        path: "/case-management",
        Component: CaseManagement
      },
      {
        path: "/personalized-services",
        Component: PersonalizedServices
      },
      {
        path: "/manage-booking",
        Component: ManageBooking
      },
      {
        path: "/flight-status",
        Component: FlightStatus
      },
      {
        path: "/check-in",
        Component: CheckIn
      },
      {
        path: "/download-e-ticket",
        Component: DownloadETicket
      },
      {
        path: "/download-boarding-pass",
        Component: DownloadBoardingPass
      },
    ]
  },
]);

export default router;
