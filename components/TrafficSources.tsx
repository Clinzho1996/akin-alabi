"use client";

import { IconCircleFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type ApiResponse = {
	status: boolean;
	message: string;
	data: {
		total_logins: number;
		platforms: {
			web: { count: number; percentage: number };
			android: { count: number; percentage: number };
			ios: { count: number; percentage: number };
			unknown: { count: number; percentage: number };
		};
	};
};

function TrafficSources() {
	const [selectedRange] = useState<"today" | "week" | "month" | "all">("all");
	const [trafficData, setTrafficData] = useState<
		{ platform: string; value: number; color: string }[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchTrafficData = async (period: string) => {
		setIsLoading(true);
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.medbankr.ai/api/v1/administrator/dashboard/traffic?period=${period}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			const platforms = response.data.data.platforms;
			const formattedData = [
				{
					platform: "IOS",
					value: platforms.ios.count,
					color: "#DCB085",
				},
				{
					platform: "Android",
					value: platforms.android.count,
					color: "#008027",
				},
				{
					platform: "Web",
					value: platforms.web.count,
					color: "#277EFF",
				},
			];

			setTrafficData(formattedData);
		} catch (error) {
			console.error("Error fetching traffic data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTrafficData(selectedRange);
	}, [selectedRange]);

	const maxValue = Math.max(...trafficData.map((item) => item.value), 1);

	const renderProgressBar = (
		value: number,
		color: string,
		platform: string
	) => {
		const percentage = (value / maxValue) * 100;

		return (
			<div className="mt-2">
				{/* Progress Bar Container */}
				<div className="w-full h-8 bg-gray-200 overflow-hidden">
					{/* Progress Fill */}
					<div
						className="h-full transition-all bg-gradient-to-r from- duration-500 ease-out"
						style={{
							width: `${percentage}%`,
							backgroundColor: color,
						}}
					/>
				</div>

				{/* Platform label and value */}
				<div className="flex justify-between items-center mt-2">
					<p className="text-sm text-gray-600">{platform}</p>
					<p className="text-sm font-semibold text-gray-900">
						{value.toLocaleString()}
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="p-5 bg-white rounded-xl border border-gray-200 w-full">
			{/* Header */}
			<div className="flex justify-between items-center mb-5">
				<div className="flex items-center gap-2">
					<Image src="/images/info.png" alt="icon" width={18} height={18} />
					<h2 className="text-sm font-medium text-gray-800">
						Enrollment Funnel
					</h2>
				</div>

				<div className="flex flex-row justify-between items-center gap-5">
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#DCB085" />
						<p className="text-sm text-gray-600">Captured</p>
					</div>
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#008027" />
						<p className="text-sm text-gray-600">Verified</p>
					</div>
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#277EFF" />
						<p className="text-sm text-gray-600">Pending</p>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="space-y-6">
				{isLoading ? (
					<p className="text-sm text-gray-500">Loading traffic data...</p>
				) : (
					trafficData.map(({ platform, value, color }, idx) => (
						<div key={idx} className="mt-4">
							{/* Platform header */}
							<div className="flex justify-between items-center mb-2">
								<p className="text-sm text-gray-800">
									Total user from {platform}
								</p>
							</div>

							{renderProgressBar(value, color, platform)}

							{/* Divider */}
							{idx < trafficData.length - 1 && (
								<hr className="my-4 border-gray-200" />
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default TrafficSources;
