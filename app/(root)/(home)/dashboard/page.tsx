"use client";

import HeaderBox from "@/components/HeaderBox";
import StatCard from "@/components/StatCard";
import SpendOverview from "@/components/TrafficSources";
import TransactionTracker from "@/components/TransactionTracker";
import { Skeleton } from "@/components/ui/skeleton";
import EndUserTable from "@/config/end-user-columns";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface DashboardData {
	total_staff: number;
	total_beneficiaries: number;
	beneficiaries_with_facial_bio: number;
	beneficiaries_without_facial_bio: number;
	total_events: number;
	active_beneficiaries: number;
	inactive_beneficiaries: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Dashboard() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [dataLoaded, setDataLoaded] = useState(false);

	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			setDataLoaded(false);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get(`${BASE_URL}/analytics`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setDashboardData(response.data.data);
			} else {
				toast.error("Failed to fetch dashboard data.");
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			toast.error("Failed to fetch dashboard data. Please try again.");
		} finally {
			setIsLoading(false);
			setDataLoaded(true);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	// Main loading state
	if (isLoading) {
		return (
			<div className="w-full overflow-x-hidden">
				<HeaderBox />
				<p className="text-sm text-[#6C7278] font-normal mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
					An overview of the Akin Alabi Foundation, highlighting its
					beneficiaries, devices used, reports, and user engagement.
				</p>
				<div className="bg-[#fff] flex flex-col px-4 py-2 gap-2 w-full max-w-[100vw]">
					{/* Skeleton for KPI Section */}
					<div className="border-[1px] border-[#E2E4E9] rounded-lg w-full bg-white overflow-hidden p-3 flex flex-row w-full gap-3">
						<div className="flex flex-row justify-start gap-2 items-center">
							<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
							<Skeleton className="h-4 w-48 bg-gray-300" />
						</div>

						{/* Three rows of skeleton cards */}
						<div className="flex flex-row justify-start gap-2 items-center">
							<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
							<Skeleton className="h-4 w-48 bg-gray-300" />
						</div>
						<div className="flex flex-row justify-start gap-2 items-center">
							<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
							<Skeleton className="h-4 w-48 bg-gray-300" />
						</div>
						<div className="flex flex-row justify-start gap-2 items-center">
							<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
							<Skeleton className="h-4 w-48 bg-gray-300" />
						</div>
						<div className="flex flex-row justify-start gap-2 items-center">
							<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
							<Skeleton className="h-4 w-48 bg-gray-300" />
						</div>
					</div>

					{/* Skeleton for charts section */}
					<div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
						<div className="rounded-lg bg-white w-full sm:w-[50%] overflow-hidden">
							<div className="p-3 bg-white rounded-lg border border-[#E2E4E9]">
								<div className="flex flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
									<div className="flex flex-row justify-start gap-2 items-center">
										<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
										<Skeleton className="h-4 w-32 bg-gray-300" />
									</div>
									<Skeleton className="h-8 w-32 bg-gray-300 rounded" />
								</div>
								<div className="py-3 h-48 flex items-center justify-center">
									<Skeleton className="h-full w-full bg-gray-300 rounded" />
								</div>
							</div>
						</div>
						<div className="rounded-lg bg-white w-full sm:w-[50%] overflow-hidden">
							<div className="p-3 bg-white rounded-lg border border-[#E2E4E9]">
								<div className="flex flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
									<div className="flex flex-row justify-start gap-2 items-center">
										<Skeleton className="h-5 w-5 bg-gray-300 rounded" />
										<Skeleton className="h-4 w-32 bg-gray-300" />
									</div>
									<Skeleton className="h-8 w-32 bg-gray-300 rounded" />
								</div>
								<div className="py-3 h-48 flex items-center justify-center">
									<Skeleton className="h-full w-full bg-gray-300 rounded" />
								</div>
							</div>
						</div>
					</div>

					{/* Skeleton for table section */}
					<div className="w-full overflow-x-auto">
						<div className="bg-white rounded-lg border border-[#E2E4E9]">
							<div className="p-3 border-b border-gray-200">
								<Skeleton className="h-6 w-40 bg-gray-300" />
							</div>
							<div className="p-4 space-y-3">
								{Array.from({ length: 5 }).map((_, index) => (
									<div key={index} className="flex gap-4">
										<Skeleton className="h-4 flex-1 bg-gray-300" />
										<Skeleton className="h-4 flex-1 bg-gray-300" />
										<Skeleton className="h-4 flex-1 bg-gray-300" />
										<Skeleton className="h-4 flex-1 bg-gray-300" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (!dataLoaded || !dashboardData) {
		return (
			<div className="w-full overflow-x-hidden">
				<HeaderBox />
				<p className="text-sm text-[#6C7278] font-normal mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
					An overview of the Akin Alabi Foundation, highlighting its
					beneficiaries, devices used, reports, and user engagement.
				</p>
				<div className="bg-[#fff] flex flex-col px-4 py-2 gap-2 w-full max-w-[100vw]">
					<div className="text-center p-8">Failed to load dashboard data</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-hidden">
			<HeaderBox />
			<p className="text-sm text-[#6C7278] font-normal mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
				An overview of the Akin Alabi Foundation, highlighting its
				beneficiaries, devices used, reports, and user engagement.
			</p>
			<div className="bg-[#fff] flex flex-col px-4 py-2 gap-2 w-full max-w-[100vw]">
				{/* Account balance and budget overview */}
				<div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
					<div className="border-[1px] border-[#E2E4E9] rounded-lg w-full bg-white overflow-hidden p-3 flex flex-col gap-3">
						<div className="flex flex-row justify-start gap-2 items-center">
							<Image src="/images/info.png" alt="info" width={20} height={20} />
							<p className="text-sm font-medium text-black">
								Key Performance Indicators (KPIs)
							</p>
						</div>

						<div className="flex flex-wrap justify-start items-center w-full gap-3">
							<StatCard
								title="Total Staff"
								value={dashboardData.total_staff}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]" // subtracting gap
							/>

							<StatCard
								title="Total Beneficiaries"
								value={dashboardData.total_beneficiaries}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>

							<StatCard
								title="With Facial Bio"
								value={dashboardData.beneficiaries_with_facial_bio}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>

							<StatCard
								title="Without Facial Bio"
								value={dashboardData.beneficiaries_without_facial_bio}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>

							<StatCard
								title="Total Events"
								value={dashboardData.total_events}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>

							<StatCard
								title="Active Beneficiaries"
								value={dashboardData.active_beneficiaries}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>

							<StatCard
								title="Inactive Beneficiaries"
								value={dashboardData.inactive_beneficiaries}
								percentage="0%"
								positive={true}
								className="w-[calc(25%-0.75rem)]"
							/>
						</div>
					</div>
				</div>

				{/* Spend overview and expense tracking */}
				<div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
					<div className="rounded-lg bg-white w-full sm:w-[50%] overflow-hidden">
						<TransactionTracker />
					</div>
					<div className="rounded-lg bg-white w-full sm:w-[50%] overflow-hidden">
						<SpendOverview />
					</div>
				</div>

				{/* Recent transactions and activity feed */}
				<div className="w-full overflow-x-auto">
					<EndUserTable />
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
