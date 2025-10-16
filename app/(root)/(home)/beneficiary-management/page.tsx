"use client";

import HeaderBox from "@/components/HeaderBox";
import Loader from "@/components/Loader";
import StatCard from "@/components/StatCard";
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
function BeneficiaryManagement() {
	const [isLoading, setIsLoading] = useState(true);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);

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

	if (isLoading) {
		return <Loader />;
	}

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
			<div className="mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
				<h2 className="text-black font-medium">Beneficiary Management</h2>
				<p className="text-sm text-[#6C7278] font-normal ">
					Search, review, and manage beneficiaries accounts, statuses, and plan
					enrollments.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full px-4 py-2  max-w-[100vw]">
				<div className="border-[1px] border-[#E2E4E9] rounded-lg w-full bg-white overflow-hidden p-3 flex flex-col gap-3">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image src="/images/info.png" alt="info" width={20} height={20} />
						<p className="text-sm font-medium text-black">
							Key Performance Metrics (KPMs)
						</p>
					</div>

					<div className="flex flex-row justify-start items-center w-full gap-3">
						<StatCard
							title="Total Beneficiaries"
							value={dashboardData.total_beneficiaries}
							percentage="0"
							positive={true}
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Beneficiaries With Facial Bio"
							value={dashboardData.beneficiaries_with_facial_bio}
							percentage="0"
							positive={true}
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Beneficiaries Without Facial Bio"
							value={dashboardData.beneficiaries_without_facial_bio}
							percentage="0"
							positive={true}
							className="w-full sm:w-[25%]"
						/>
					</div>
				</div>
			</div>
			<div className="bg-white flex flex-col px-4 py-2 gap-2 w-full max-w-[100vw]">
				<EndUserTable />
			</div>
		</div>
	);
}

export default BeneficiaryManagement;
