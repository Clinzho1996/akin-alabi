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

interface GraphData {
	month: string;
	year: number;
	users: number;
	providers: number;
	total: number;
}

interface ApiResponse {
	status: boolean;
	message: string;
	data: {
		period: string;
		total_users: number;
		total_providers: number;
		graph_data: GraphData[];
	};
}

function TransactionTracker() {
	const [chartData, setChartData] = useState<GraphData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedYear, setSelectedYear] = useState<string>(
		new Date().getFullYear().toString()
	);

	const fetchTransactionData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.medbankr.ai/api/v1/administrator/dashboard/graph?months=12`, // Updated endpoint
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			if (response.data.status === true) {
				const { graph_data, total_users, total_providers, period } =
					response.data.data;

				// Filter data by selected year if needed, or use all data
				const filteredData = selectedYear
					? graph_data.filter((item) => item.year.toString() === selectedYear)
					: graph_data;

				console.log("User Growth Data:", filteredData);
				setChartData(filteredData);
			}
		} catch (error) {
			console.error("Error fetching user growth data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactionData();
	}, [selectedYear]);

	const chartConfig = {
		Users: {
			label: "Users",
			color: "hsl(var(--chart-1))",
		},
		Providers: {
			label: "Providers",
			color: "hsl(var(--chart-2))",
		},
		Total: {
			label: "Total",
			color: "hsl(var(--chart-3))",
		},
	} satisfies ChartConfig;

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	// Get unique years from graph data for the dropdown
	const availableYears = Array.from(
		new Set(chartData.map((item) => item.year))
	).sort((a, b) => b - a);

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
								<SelectItem value="all">All Time</SelectItem>
								{availableYears.map((year) => (
									<SelectItem key={year} value={year.toString()}>
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
							/>
							<ChartTooltip
								cursor={{ stroke: "#ccc", strokeWidth: 1 }}
								content={({ payload, label }) => {
									if (!payload || payload.length === 0) return null;

									const users = payload.find(
										(p) => p.dataKey === "users"
									)?.value;
									const providers = payload.find(
										(p) => p.dataKey === "providers"
									)?.value;
									const total = payload.find(
										(p) => p.dataKey === "total"
									)?.value;

									// Find the year from the payload
									const year =
										payload[0]?.payload?.year || new Date().getFullYear();

									return (
										<div className="custom-tooltip p-3 bg-white border-[1px] shadow-lg border-[#E4E4E7] rounded-lg w-[280px]">
											<p className="text-center font-bold font-inter">
												{label} {year}
											</p>
											<div className="flex flex-col mt-3 gap-2">
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-1">
														<IconRectangleFilled size={10} color="#5F60E7" />
														<p className="text-xs text-gray-600">Users</p>
													</div>
													<p className="text-sm font-bold">
														{formatNumber(Number(users) || 0)}
													</p>
												</div>
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-1">
														<IconRectangleFilled size={10} color="#CC27DD" />
														<p className="text-xs text-gray-600">Providers</p>
													</div>
													<p className="text-sm font-bold">
														{formatNumber(Number(providers) || 0)}
													</p>
												</div>
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-1">
														<IconRectangleFilled size={10} color="#10B981" />
														<p className="text-xs text-gray-600">Total</p>
													</div>
													<p className="text-sm font-bold">
														{formatNumber(Number(total) || 0)}
													</p>
												</div>
											</div>
										</div>
									);
								}}
							/>
							<Line
								dataKey="users"
								type="monotone"
								stroke="#5F60E7"
								strokeWidth={2}
								dot={{ r: 3 }}
							/>
							<Line
								dataKey="providers"
								type="monotone"
								stroke="#CC27DD"
								strokeWidth={2}
								dot={{ r: 3 }}
							/>
							<Line
								dataKey="total"
								type="monotone"
								stroke="#10B981"
								strokeWidth={2}
								dot={{ r: 3 }}
								strokeDasharray="3 3"
							/>
						</LineChart>
					</ChartContainer>
				</div>
			)}
		</div>
	);
}

export default TransactionTracker;
