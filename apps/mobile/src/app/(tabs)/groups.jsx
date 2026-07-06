import RealDataScreen from "../../components/RealDataScreen";

export default function GroupsScreen() {
  return (
    <RealDataScreen
      title="Groups"
      subtitle="Groups stored in the backend"
      endpoint="/groups"
      emptyTitle="No groups yet"
      emptyMessage="When groups are created in the database, they will be listed here."
      titleFields={["name", "title", "activity", "id"]}
      detailFields={["activity", "category", "location", "status", "created_at"]}
    />
  );
}
