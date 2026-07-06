import RealDataScreen from "../../components/RealDataScreen";

export default function DiscoverScreen() {
  return (
    <RealDataScreen
      title="Discover"
      subtitle="People from the SafeMeet database"
      endpoint="/discover/users"
      emptyTitle="No people to discover yet"
      emptyMessage="Create real users through signup or your backend admin flow and they will appear here."
      titleFields={["name", "firstName", "email", "id"]}
      detailFields={["bio", "location", "interests", "verificationLevel", "createdAt"]}
    />
  );
}
