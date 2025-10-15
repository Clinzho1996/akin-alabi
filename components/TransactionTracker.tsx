"use client";

import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconRectangleFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Skeleton } from "./ui/skeleton";

interface AttendanceData {
	month: string;
	total_attendance: number;
}

interface ApiResponse {
	status: string;
	message: string;
	year: string;
	data: AttendanceData[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function TransactionTracker() {
	const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedYear, setSelectedYear] = useState<string>(
		new Date().getFullYear().toString()
	);

	const fetchAttendanceData = async (year: string) => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`${BASE_URL}/analytics/attendance/graph?year=${year}`, // Updated endpoint
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				console.log("Attendance Data:", response.data.data);
				setAttendanceData(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching attendance data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAttendanceData(selectedYear);
	}, [selectedYear]);

	const chartConfig = {
		attendance: {
			label: "Attendance",
			color: "hsl(var(--chart-1))",
		},
	} satisfies ChartConfig;

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	// Generate year options (current year and previous years)
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) =>
		(currentYear - i).toString()
	);

	// Prepare chart data - ensure all months are included in correct order
	const monthOrder = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const chartData = monthOrder.map((month) => {
		const existingData = attendanceData.find((item) => item.month === month);
		return {
			month,
			attendance: existingData ? existingData.total_attendance : 0,
		};
	});

	return (
		<div className="p-3 bg-white rounded-lg border border-[#E2E4E9]">
			<div className="flex flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
				<div className="flex flex-row justify-start gap-2 items-center">
					<Image src="/images/info.png" alt="info" width={20} height={20} />
					<p className="text-sm font-normal text-black">Attendance Trend</p>
				</div>
				<div className="flex flex-row justify-end gap-3 items-center">
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Select Year" />
						</SelectTrigger>
						<SelectContent className="bg-white">
							<SelectGroup className="bg-white">
								{yearOptions.map((year) => (
									<SelectItem key={year} value={year}>
										{year}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center space-x-4 w-full mt-4">
					<Skeleton className="h-12 bg-slate-300 w-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 bg-slate-300 w-[250px]" />
						<Skeleton className="h-4 bg-slate-300 w-[200px]" />
					</div>
				</div>
			) : (
				<div className="py-3 h-fit">
					<ChartContainer config={chartConfig}>
						<LineChart
							height={200}
							data={chartData}
							margin={{ top: 10, left: 12, right: 12, bottom: 10 }}>
							<CartesianGrid vertical={false} horizontal={true} />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={1}
								tickFormatter={(value) => value.slice(0, 3)} // Show abbreviated month names
							/>
							<ChartTooltip
								cursor={{ stroke: "#ccc", strokeWidth: 1 }}
								content={({ payload, label }) => {
									if (!payload || payload.length === 0) return null;

									const attendance = payload.find(
										(p) => p.dataKey === "attendance"
									)?.value;

									return (
										<div className="custom-tooltip p-3 bg-white border-[1px] shadow-lg border-[#E4E4E7] rounded-lg w-[200px]">
											<p className="text-center font-bold font-inter">
												{label} {selectedYear}
											</p>
											<div className="flex flex-col mt-3 gap-2">
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-1">
														<IconRectangleFilled size={10} color="#5F60E7" />
														<p className="text-xs text-gray-600">Attendance</p>
													</div>
													<p className="text-sm font-bold">
														{formatNumber(Number(attendance) || 0)}
													</p>
												</div>
											</div>
										</div>
									);
								}}
							/>
							<Line
								dataKey="attendance"
								type="monotone"
								stroke="#5F60E7"
								strokeWidth={2}
								dot={{ r: 3 }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ChartContainer>
				</div>
			)}
		</div>
	);
}

export default TransactionTracker;
