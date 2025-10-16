"use client";

import Attendance from "@/components/beneficiary/Attendance";
import Benefits from "@/components/beneficiary/Benefits";
import Overview from "@/components/beneficiary/Overview";
import HeaderBox from "@/components/HeaderBox";
import Loader from "@/components/Loader";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	IconArrowBack,
	IconCaretRightFilled,
	IconGift,
	IconIdBadge,
	IconRefresh,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type UserStats = {
	logins: {
		total: number;
		percentChange: number;
	};
	files: {
		total: number;
		percentChange: number;
	};
	medications: {
		total: number;
		percentChange: number;
	};
	chats: {
		total: number | null;
		percentChange: number;
	};
	user: {
		first_name?: string;
		last_name?: string;
		full_name?: string;
	};
};

function BeneficiaryDetails() {
	const { id } = useParams();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [stats, setStats] = useState<UserStats | null>(null);

	const fetchUserDetails = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const accessToken = session?.accessToken;

			const response = await axios.get(
				`https://api.medbankr.ai/api/v1/administrator/user/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status) {
				const data = response.data.data;
				setStats({
					logins: {
						total: data.logins.total,
						percentChange: data.logins.percentChange,
					},
					files: {
						total: data.files.total,
						percentChange: data.files.percentChange,
					},
					medications: {
						total: data.medications.total,
						percentChange: data.medications.percentChange,
					},
					chats: {
						total: data.chats.total,
						percentChange: data.chats.percentChange,
					},
					user: {
						first_name: data.user.data.user.full_name?.split(" ")[0] || "",
						last_name: data.user.data.user.full_name?.split(" ")[1] || "",
						full_name: data.user.data.user.full_name,
					},
				});
			}
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error fetching user details:",
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
		fetchUserDetails();
	}, [fetchUserDetails]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			<HeaderBox />
			<div className="flex flex-row justify-start items-center gap-2 mb-4 p-3 bg-[#F4F6F8] border-b border-[#6C72781A] m-0">
				<Link
					href="/event-management"
					className="flex flex-row text-[#6B7280] justify-start text-sm items-center gap-2">
					<IconArrowBack /> Back to previous page
				</Link>
				<IconCaretRightFilled size={18} />
				<p className="text-sm text-[#161616] font-normal ">
					Detailed profile view for {stats?.user.full_name}
				</p>
			</div>
			<div className="flex flex-col sm:flex-row justify-between items-start px-4 py-2 gap-2 w-full max-w-[100vw]">
				<div className="border-[1px] border-[#E2E4E9] rounded-lg w-full bg-white overflow-hidden p-3 flex flex-col gap-3">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image src="/images/info.png" alt="info" width={20} height={20} />
						<p className="text-sm font-medium text-black">
							Attendance Overview
						</p>
					</div>

					<div className="flex flex-row justify-start items-center w-full gap-3">
						<StatCard
							title="Total Check-ins"
							value={stats?.logins.total ?? 0}
							percentage={`${stats?.logins.percentChange ?? 0}%`}
							positive={(stats?.logins.percentChange ?? 0) >= 0}
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Present"
							value={stats?.files.total ?? 0}
							percentage={`${stats?.files.percentChange ?? 0}%`}
							positive={(stats?.files.percentChange ?? 0) >= 0}
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Absent"
							value={stats?.chats.total ?? 0}
							percentage={`${stats?.chats.percentChange ?? 0}%`}
							positive={(stats?.chats.percentChange ?? 0) >= 0}
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Late"
							value={stats?.medications.total ?? 0}
							percentage={`${stats?.medications.percentChange ?? 0}%`}
							positive={(stats?.medications.percentChange ?? 0) >= 0}
							className="w-full sm:w-[25%]"
						/>
					</div>
				</div>
			</div>

			<div className="border-[1px] border-[#E2E4E9] px-4 py-2 mx-auto rounded-lg w-full sm:w-[97.5%] bg-white overflow-hidden p-3 flex flex-col gap-3">
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger
							value="overview"
							className="data-[state=active]:border-b-2 data-[state=active]:text-dark-1 text-[#6C7278] data-[state=active]:border-[#2FE0A8] data-[state=active]:shadow-none data-[state=active]:rounded-none w-full">
							<IconIdBadge /> Profile Overview
						</TabsTrigger>
						<TabsTrigger
							value="attendance"
							className="data-[state=active]:border-b-2 data-[state=active]:text-dark-1 text-[#6C7278] data-[state=active]:border-[#2FE0A8] data-[state=active]:shadow-none data-[state=active]:rounded-none w-full">
							<IconRefresh /> Attendance History
						</TabsTrigger>
						<TabsTrigger
							value="benefits"
							className="data-[state=active]:border-b-2 data-[state=active]:text-dark-1 text-[#6C7278] data-[state=active]:border-[#2FE0A8] data-[state=active]:shadow-none data-[state=active]:rounded-none w-full">
							<IconGift /> Benefits
						</TabsTrigger>
					</TabsList>
					<TabsContent value="overview">
						<Overview />
					</TabsContent>
					<TabsContent value="attendance">
						<Attendance />
					</TabsContent>
					<TabsContent value="benefits">
						<Benefits />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default BeneficiaryDetails;
