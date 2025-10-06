import HeaderBox from "@/components/HeaderBox";
import ProjectDetailsTable from "@/config/project-details-columns";

function ProjectDetails() {
	return (
		<div className="min-h-screen flex flex-col">
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2 gap-4">
				<ProjectDetailsTable />
			</div>
		</div>
	);
}

export default ProjectDetails;
