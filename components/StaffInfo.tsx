"use client";

import { IconCircleFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface ApiResponse {
	data?: {
		total_staff?: number;
		total_active_staff?: number;
		total_inactive_staff?: number;
	};
}

function StaffInfo() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<ApiResponse["data"] | null>(null);

	const fetchTransactionData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			console.log("session", session);

			const accessToken = session?.backendData?.token; // ✅ TypeScript now recognizes this
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.wowdev.com.ng/api/v1/analytics/staff-stats",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			// Access the nested `data` property
			setData(response.data.data);

			console.log("Analytics Data:", response.data);
		} catch (error) {
			console.error("Error fetching analytics data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactionData();
	}, []);

	return (
		<div className="py-2 px-3 bg-white rounded-lg border border-[#E2E4E9]">
			{isLoading ? (
				<div className="flex flex-row justify-between items-center">
					<div className="flex items-center space-x-4 ">
						<Skeleton className="h-12 w-12 rounded-full bg-gray-500" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-[250px] bg-gray-500" />
							<Skeleton className="h-4 w-[200px] bg-gray-500" />
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<Skeleton className="h-12 w-12 rounded-full bg-gray-500" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-[250px] bg-gray-500" />
							<Skeleton className="h-4 w-[200px] bg-gray-500" />
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<Skeleton className="h-12 w-12 rounded-full bg-gray-500" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-[250px] bg-gray-500" />
							<Skeleton className="h-4 w-[200px] bg-gray-500" />
						</div>
					</div>
				</div>
			) : (
				<div>
					<div className="flex flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
						<div className="flex flex-row justify-start gap-2 items-center">
							<Image src="/images/info.png" alt="info" width={20} height={20} />
							<p className="text-sm font-bold text-black">Staff Info</p>
						</div>
						<div className="flex flex-row justify-end gap-3 items-center">
							<div className="flex flex-row justify-start gap-1 items-center">
								<IconCircleFilled size={10} color="#6E3FF3" />
								<p className="text-sm font-normal text-[#6B7280] text-[12px]">
									Total
								</p>
							</div>
							<div className="flex flex-row justify-start gap-1 items-center">
								<IconCircleFilled size={10} color="#09A609" />
								<p className="text-sm font-normal text-[#6B7280] text-[12px]">
									Active
								</p>
							</div>
							<div className="flex flex-row justify-start gap-1 items-center">
								<IconCircleFilled size={10} color="#FF5000" />
								<p className="text-sm font-normal text-[#6B7280] text-[12px]">
									Inactive
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-row flex-wrap justify-start gap-[25px] lg:gap-[130px] items-center py-3">
						<div className="flex flex-row justify-start gap-2 items-center ">
							<Image
								src="/images/total.png"
								alt="total"
								width={40}
								height={40}
							/>
							<div className="flex flex-col gap-0">
								<p className="text-primary-6 uppercase text-[11px] font-inter">
									total staff
								</p>
								<p className="text-[#0A0D14] font-inter">{data?.total_staff}</p>
							</div>
						</div>
						<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
							<p className="text-transparent">|</p>
						</div>
						<div className="flex flex-row justify-start gap-2 items-center ">
							<Image
								src="/images/active.png"
								alt="active"
								width={40}
								height={40}
							/>
							<div className="flex flex-col gap-0">
								<p className="text-primary-6 uppercase text-[11px] font-inter">
									active staff
								</p>
								<p className="text-[#0A0D14] font-inter">
									{data?.total_active_staff}
								</p>
							</div>
						</div>
						<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
							<p className="text-transparent">|</p>
						</div>
						<div className="flex flex-row justify-start gap-2 items-center">
							<Image
								src="/images/inactive.png"
								alt="inactive"
								width={40}
								height={40}
							/>
							<div className="flex flex-col gap-0">
								<p className="text-primary-6 uppercase text-[11px] font-inter">
									inactive staff
								</p>
								<p className="text-[#0A0D14] font-inter">
									{data?.total_inactive_staff}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default StaffInfo;
