import RealDataScreen from "../../components/RealDataScreen";

export default function DiscoverScreen() {
  return (
    <RealDataScreen
      title="Discover"
      subtitle="Meet people on SafeMeet"
      endpoint="/discover/users"
      emptyTitle="No people to discover yet"
      emptyMessage="Other members will appear here once they create their profiles."
      titleFields={["name", "firstName", "email", "id"]}
      detailFields={["bio", "location", "interests", "verificationLevel", "createdAt"]}
    />
  );
}
