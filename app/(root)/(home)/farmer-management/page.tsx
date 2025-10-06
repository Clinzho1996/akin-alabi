import HeaderBox from "@/components/HeaderBox";
import FarmerTable from "@/config/farmer-columns";

function FarmerManagement() {
	return (
		<div className="min-h-screen flex flex-col">
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2 gap-4">
				<FarmerTable />
			</div>
		</div>
	);
}

export default FarmerManagement;
