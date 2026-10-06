import RealDataScreen from "../../components/RealDataScreen";

export default function GroupsScreen() {
  return (
    <RealDataScreen
      title="Groups"
      subtitle="Find your community"
      endpoint="/groups"
      emptyTitle="No groups yet"
      emptyMessage="Community groups will appear here when they are available."
      titleFields={["name", "title", "activity", "id"]}
      detailFields={["activity", "category", "location", "status", "created_at"]}
    />
  );
}
