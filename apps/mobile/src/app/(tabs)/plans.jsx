import RealDataScreen from "../../components/RealDataScreen";

export default function PlansScreen() {
  return (
    <RealDataScreen
      title="Plans"
      subtitle="Plan your next meetup"
      endpoint="/plans"
      emptyTitle="No plans yet"
      emptyMessage="Meetup plans will appear here when they are available."
      titleFields={["title", "name", "activity", "id"]}
      detailFields={["description", "planned_date", "location", "status", "created_at"]}
    />
  );
}
