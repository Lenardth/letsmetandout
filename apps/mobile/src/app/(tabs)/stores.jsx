import RealDataScreen from "../../components/RealDataScreen";

export default function StoresScreen() {
  return (
    <RealDataScreen
      title="Stores"
      subtitle="Partner stores from the backend"
      endpoint="/stores"
      emptyTitle="No stores yet"
      emptyMessage="Add store records to the backend and they will be shown here."
      titleFields={["name", "title", "business_name", "id"]}
      detailFields={["category", "location", "address", "phone", "status"]}
    />
  );
}
