import { IconTrash } from "@tabler/icons-react";
import { Button } from "../ui/button";

function Overview() {
	return (
		<div className="border rounded-lg p-2">
			<div className="border bg-[#F6F8FA] p-2 rounded-lg">
				<div>
					<div className="flex flex-row justify-between items-center p-3">
						<p>Basic Information</p>
						<div className="flex flex-row justify-end items-center gap-2">
							<Button className="border bg-white">
								<IconTrash />
							</Button>
							<Button className="border bg-secondary-1 text-white">
								Edit Event
							</Button>
						</div>
					</div>

					<div className="bg-white p-6 shadow-lg rounded-lg mt-1">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Event Name</p>
									<p className="text-sm text-dark-1">Education grant Q4</p>
								</div>

								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Location</p>
									<p className="text-sm text-dark-1">Atunrase, Gbagada Lagos</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Benefits (optional)</p>
									<p className="text-sm text-dark-1">NGN 50,000</p>
								</div>

								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Start Date</p>
									<p className="text-sm text-dark-1">2025 - 09 -12</p>
								</div>

								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">eND Date</p>
									<p className="text-sm text-dark-1">2025 - 09 -12</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Overview;
