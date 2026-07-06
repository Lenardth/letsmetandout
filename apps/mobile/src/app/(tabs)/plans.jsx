import RealDataScreen from "../../components/RealDataScreen";

export default function PlansScreen() {
  return (
    <RealDataScreen
      title="Plans"
      subtitle="Meetup plans from the backend"
      endpoint="/plans"
      emptyTitle="No plans yet"
      emptyMessage="Create meetup plans in the backend and they will appear here."
      titleFields={["title", "name", "activity", "id"]}
      detailFields={["description", "planned_date", "location", "status", "created_at"]}
    />
  );
}
