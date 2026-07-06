import RealDataScreen from "../../components/RealDataScreen";

export default function BookingsScreen() {
  return (
    <RealDataScreen
      title="Bookings"
      subtitle="Bookings recorded in the backend"
      endpoint="/bookings"
      emptyTitle="No bookings yet"
      emptyMessage="Confirmed bookings will appear here once the backend has booking records."
      titleFields={["title", "name", "booking_reference", "id"]}
      detailFields={["status", "booking_date", "location", "created_at"]}
    />
  );
}
