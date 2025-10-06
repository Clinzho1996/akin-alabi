"use client";

import HeaderBox from "@/components/HeaderBox";
import { useSession } from "next-auth/react";
import Image from "next/image";

function Settings() {
	const { data: session } = useSession();

	console.log("session", session);

	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};
	return (
		<div>
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2">
				<div
					className="bg-white flex flex-row border-[1px] border-[#E2E4E9] justify-between items-center p-3"
					style={{
						borderTopLeftRadius: "0.5rem",
						borderTopRightRadius: "0.5rem",
					}}>
					<div>
						<div className="flex flex-row justify-start items-center gap-2">
							<Image
								src="/images/staffm.png"
								alt="staff management"
								height={20}
								width={20}
							/>
							<p className="text-sm text-dark-1 font-medium font-inter">
								Settings
							</p>
						</div>

						<p className="text-xs text-primary-6 mt-3">
							Here is an overview of all the project
						</p>
					</div>
				</div>
				<div className="bg-[#F6F8F9] p-4 border-x-[1px] border-[#E2E4E9]">
					<h2 className="text-sm text-dark-1 font-medium font-inter">
						Account Settings
					</h2>
					<p className="text-xs text-dark-2">
						Configure and manage your account information, update your name,
						email, phone number, and other personal details.
					</p>
				</div>
				<div className="bg-white px-4 border-[1px] border-[#E2E4E9] rounded-b-lg py-10">
					<div className="flex flex-row justify-start items-start gap-20 w-full">
						<div className="w-full lg:w-[65%] pr-20">
							{session?.user && (
								<div className="md:flex flex-col p-2 rounded-md justify-start gap-2 items-start mx-2 px-2 w-full">
									<div className="flex justify-start border-[1px] border-dark-3 rounded-full overflow-hidden">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="profile"
												className="object-cover w-full h-full lg:w-[74px] lg:h-[74px] rounded-full"
												width={50}
												height={50}
											/>
										) : (
											<div className="flex items-center justify-center w-full h-full">
												<h2 className="text-white font-bold text-lg">
													{getNameInitials({ name: session?.user?.name || "" })}
												</h2>
											</div>
										)}
									</div>
									<div className="flex flex-col justify-start items-start gap-3 w-full">
										<p className="text-dark-2 font-normal font-inter text-sm">
											Full Name
										</p>
										<h3 className="text-dark-1 text-sm font-normal font-inter border-[1px]  border-[#9F9E9E40] p-2 rounded-lg w-full">
											{session.user.name}
										</h3>
									</div>
								</div>
							)}
						</div>
					</div>
					<hr className="my-10" />
					<div className="flex flex-row justify-start items-start gap-20 w-full">
						<div className="w-full lg:w-[65%] pr-20">
							{session?.user && (
								<div className="md:flex flex-col p-2 rounded-md justify-start gap-2 items-start mx-2 px-2 w-full">
									<div className="flex flex-col justify-start items-start gap-3 w-full">
										<p className="text-dark-2 font-normal font-inter text-sm">
											Email
										</p>
										<h3 className="text-dark-1 text-sm font-normal font-inter border-[1px]  border-[#9F9E9E40] p-2 rounded-lg w-full">
											{session.user.email}
										</h3>
									</div>
								</div>
							)}
						</div>
					</div>
					<hr className="my-10" />
					<div className="flex flex-row justify-start items-start gap-20 w-full">
						<div className="w-full lg:w-[65%] pr-20">
							{session?.user && (
								<div className="md:flex flex-col p-2 rounded-md justify-start gap-2 items-start mx-2 px-2 w-full">
									<div className="flex flex-col justify-start items-start gap-3 w-full">
										<p className="text-dark-2 font-normal font-inter text-sm">
											Phone Number
										</p>
										<h3 className="text-dark-1 text-sm font-normal font-inter border-[1px]  border-[#9F9E9E40] p-2 rounded-lg w-full">
											+234810 0000 000
										</h3>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Settings;
