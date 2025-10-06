import HeaderBox from "@/components/HeaderBox";
import LogTable from "@/config/log-columns";

function LogActivity() {
	return (
		<div className="min-h-screen flex flex-col"> 
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2 gap-4">
				<LogTable />
			</div>
		</div>
	);
}

export default LogActivity;
