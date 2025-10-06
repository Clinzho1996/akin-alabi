import HeaderBox from "@/components/HeaderBox";
import ProjectTable from "@/config/project-columns";

function ProjectManagement() {
	return (
		<div>
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2 gap-4">
				<ProjectTable />
			</div>
		</div>
	);
}

export default ProjectManagement;
