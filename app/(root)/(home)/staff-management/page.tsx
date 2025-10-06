import HeaderBox from "@/components/HeaderBox";
import Table from "@/config/columns";

function StaffManagement() {
	return (
		<div className="min-h-screen flex flex-col">
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2 gap-4">
				<Table />
			</div>
		</div>
	);
}

export default StaffManagement;
