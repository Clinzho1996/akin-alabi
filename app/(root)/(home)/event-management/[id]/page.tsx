"use client";

import Attendance from "@/components/events/Attendance";
import Overview from "@/components/events/Overview";
import HeaderBox from "@/components/HeaderBox";
import Loader from "@/components/Loader";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconArrowBack, IconCaretRightFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface EventAnalytics {
	total_present: number;
	total_absent: number;
	total_late: number;
}

interface EventData {
	id: string;
	name: string;
	start_date: string;
	end_date: string;
	location: string;
}

interface AnalyticsResponse {
	status: string;
	message: string;
	data: EventAnalytics;
}

interface EventResponse {
	status: string;
	message: string;
	data: EventData;
}

function EventDetails() {
	const { id } = useParams();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
	const [eventData, setEventData] = useState<EventData | null>(null);

	const fetchEventDetails = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const accessToken = session.accessToken;

			// Fetch event analytics
			const analyticsResponse = await axios.get<AnalyticsResponse>(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/event/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			// Fetch event basic data
			const eventResponse = await axios.get<EventResponse>(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (analyticsResponse.data.status === "success") {
				setAnalytics(analyticsResponse.data.data);
			}

			if (eventResponse.data.status === "success") {
				setEventData(eventResponse.data.data);
			}
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error fetching event details:",
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
		if (id) {
			fetchEventDetails();
		}
	}, [fetchEventDetails, id]);

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
					Detailed view for {eventData?.name || "Event"}
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
							title="Total Present"
							value={analytics?.total_present ?? 0}
							percentage="0%" // You can calculate percentage if you have previous data
							positive={true} // Set based on your business logic
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Absent"
							value={analytics?.total_absent ?? 0}
							percentage="0%" // You can calculate percentage if you have previous data
							positive={false} // Absent is typically negative
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Late"
							value={analytics?.total_late ?? 0}
							percentage="0%" // You can calculate percentage if you have previous data
							positive={false} // Late is typically negative
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Check-ins"
							value={
								(analytics?.total_present ?? 0) + (analytics?.total_late ?? 0)
							}
							percentage="0%" // You can calculate percentage if you have previous data
							positive={true}
							className="w-full sm:w-[25%]"
						/>
					</div>
				</div>
			</div>

			<div className="border-[1px] border-[#E2E4E9] px-4 py-2 mx-auto rounded-lg w-full sm:w-[97.5%] bg-white overflow-hidden p-3 flex flex-col gap-3">
				<Tabs defaultValue="overview" className="w-full">
					<TabsList>
						<TabsTrigger
							value="overview"
							className="data-[state=active]:border-b-2 data-[state=active]:text-dark-1 text-[#6C7278] data-[state=active]:border-[#2FE0A8] data-[state=active]:shadow-none data-[state=active]:rounded-none">
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="attendance"
							className="data-[state=active]:border-b-2 data-[state=active]:text-dark-1 text-[#6C7278] data-[state=active]:border-[#2FE0A8] data-[state=active]:shadow-none data-[state=active]:rounded-none">
							Attendance Records
						</TabsTrigger>
					</TabsList>
					<TabsContent value="overview">
						<Overview />
					</TabsContent>
					<TabsContent value="attendance">
						<Attendance />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default EventDetails;
