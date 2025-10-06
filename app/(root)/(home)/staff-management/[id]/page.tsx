"use client";

import Loader from "@/components/Loader";
import { IconArrowBack, IconSettings, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type Staff = {
	id: string;
	name: string;
	first_name: string;
	last_name: string;
	date: string;
	role: string;
	staff: string;
	staff_code: string;
	status?: string;
	email: string;
	created_at: string;
	is_active: boolean;
};

interface ApiResponse {
	data: Staff; // Adjust to match your API structure
}

function StaffDetails() {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [userData, setUserData] = useState<Staff | null>(null);
	const { data: session } = useSession();
	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	const fetchStaff = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.wowdev.com.ng/api/v1/user/${id}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("data", response?.data?.data);
			setUserData(response?.data?.data);
			setIsLoading(false);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error fetching post:",
					error.response?.data || error.message
				);
			} else {
				console.log("Unexpected error:", error);
			}
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchStaff();
	}, [fetchStaff]);

	const formatDate = (rawDate?: string | Date) => {
		if (!rawDate) return "Unknown"; // Handle undefined case
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<section className="bg-[#F6F8F9] h-screen">
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/staff-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Staff Information
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage staff data, including contact information, roles,
							and performance records.
						</p>
					</div>
				</div>
				<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
					<Link href="/settings">
						<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
							<IconSettings size={18} />
						</div>
					</Link>
					{session?.user && (
						<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
							<div className="flex justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
								{session.user.image ? (
									<Image
										src={session.user.image}
										alt="profile"
										className="object-cover w-full h-full lg:w-[35px] lg:h-[35px]"
										width={30}
										height={30}
									/>
								) : (
									<div className="flex items-center justify-center w-full h-full bg-dark-3">
										<h2 className="text-white font-bold text-lg">
											{getNameInitials({ name: session?.user?.name || "" })}
										</h2>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="p-5 bg-white border-[1px] border-[#E2E4E9] m-4 rounded-lg">
				<div className="flex flex-row justify-start items-start gap-20 ">
					<div>
						<Image src="/images/avat.png" width={50} height={50} alt="avatar" />
						<div className="py-4 border-b-[1px] border-[#E2E4E9]">
							<p className="text-[16px] text-dark-1 font-medium font-inter mt-2">
								{userData?.first_name} {userData?.last_name}
							</p>
							<p className="text-sm text-[#6B7280B7] font-inter">
								Last signed in 3h ago
							</p>
						</div>
						<div className="py-4 w-full  border-b-[1px] border-[#E2E4E9]">
							<h2 className="text-sm text-[#6B7280B7] font-inter">Status</h2>
							<p
								className={`status-inner mt-4 ${
									userData?.is_active ? "green" : "red"
								}`}>
								{userData?.is_active ? "Active" : "Inactive"}
							</p>
						</div>
						<div className="py-4">
							<div className="flex flex-row justify-start gap-1 items-center">
								<IconTrash color="red" size={16} />
								<p className="text-sm text-red">Delete</p>
							</div>
							<p className="text-sm text-[#6B7280B7] font-inter mt-2">
								Date joined{" "}
								<span className="text-dark-1">
									{formatDate(userData?.created_at)}
								</span>
							</p>
						</div>
					</div>
					<div className="bg-[#F6F8FA] border-[1px] border-[#E2E4E9] w-[500px] rounded-lg">
						<div className="p-3 w-full">
							<h2 className="text-sm text-[#6B7280B7] font-inter">
								Basic Information
							</h2>
							<p className="text-sm text-dark-1 font-inter mt-2">
								Manage user profile
							</p>
						</div>
						<hr />

						<div className="bg-white p-3 rounded-lg mt-2 mx-1 mb-1 shadow-md flex flex-col gap-2">
							<div className="p-2 border-b-[1px] border-[#E2E4E9]">
								<h2 className="text-sm text-[#6B7280B7] font-inter">
									Full Name
								</h2>
								<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
									{userData?.first_name} {userData?.last_name}
								</p>
							</div>
							<div className="p-2 border-b-[1px] border-[#E2E4E9]">
								<h2 className="text-sm text-[#6B7280B7] font-inter">
									Email Address
								</h2>
								<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
									{userData?.email}
								</p>
							</div>
							<div className="p-2 border-b-[1px] border-[#E2E4E9]">
								<h2 className="text-sm text-[#6B7280B7] font-inter">Role</h2>
								<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
									{userData?.role}
								</p>
							</div>
							<div className="p-2 border-b-[1px] border-[#E2E4E9]">
								<h2 className="text-sm text-[#6B7280B7] font-inter">
									Staff Code
								</h2>
								<p className="text-sm text-dark-1 font-inter mt-2 uppercase">
									{userData?.staff_code}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default StaffDetails;
