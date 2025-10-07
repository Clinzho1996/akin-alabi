import { IconTrash, IconUserPause } from "@tabler/icons-react";
import Image from "next/image";
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
							<Button className="border bg-white">
								<IconUserPause /> Suspend Beneficiary
							</Button>
						</div>
					</div>

					<div className="bg-white p-6 shadow-lg rounded-lg mt-1">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">First Name</p>
									<p className="text-sm text-dark-1">Dev</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Last Name</p>
									<p className="text-sm text-dark-1">Clinton</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Middle Name</p>
									<p className="text-sm text-dark-1">CJay</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5  items-start w-full">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[32%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Date of Birth</p>
									<p className="text-sm text-dark-1">12/12/2022</p>
								</div>

								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[32%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Gender</p>
									<p className="text-sm text-dark-1">Male</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Contact Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Phone Number</p>
									<p className="text-sm text-dark-1">+2348012345678</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Email</p>
									<p className="text-sm text-dark-1">devc@gmail.com</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Address</p>
									<p className="text-sm text-dark-1">15 Ademola Street</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">City</p>
									<p className="text-sm text-dark-1">Lagos</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">State</p>
									<p className="text-sm text-dark-1">Lagos State</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Local Government</p>
									<p className="text-sm text-dark-1">Alimosho</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Geographic Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">State of Origin</p>
									<p className="text-sm text-dark-1">+Kano State</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">LGA of Origin</p>
									<p className="text-sm text-dark-1">Kano Municipal</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Nationality</p>
									<p className="text-sm text-dark-1">Nigerian</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Identification Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">ID Type</p>
									<p className="text-sm text-dark-1">
										National Identity Number (NIN)
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">ID Number</p>
									<p className="text-sm text-dark-1">123456789</p>
								</div>
							</div>

							<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[49%] border p-3 rounded-lg">
								<p className="text-xs text-[#6B7280]">Uploaded ID</p>
								<div className="flex flex-row justify-start items-center gap-2 ">
									<Image
										src="/images/avatar.png"
										alt="Uploaded ID"
										width={20}
										height={20}
										className="rounded-sm"
									/>
									<p className="text-sm">National ID.png</p>
									<p className=" text-green-600 text-sm">Preview</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Employment Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Occupation</p>
									<p className="text-sm text-dark-1">Patty Trader</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Employment Status</p>
									<p className="text-sm text-dark-1">Self-Employed</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Education Level</p>
									<p className="text-sm text-dark-1">Secondary School</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Association</p>
									<p className="text-sm text-dark-1">Ifesowapo Association</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Biometrics </p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Face Capture</p>
									<p className="text-sm text-dark-1">Completed</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Fingerprints</p>
									<p className="text-sm text-dark-1">Pending</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5  items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Liveness</p>
									<p className="text-sm text-dark-1">Passed</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Operator ID</p>
									<p className="text-sm text-dark-1">
										Staff ID: Tunde Onakoya{" "}
									</p>
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
