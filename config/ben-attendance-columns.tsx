"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BeneficiaryAttendanceDataTable } from "./ben-attendance-table";

// This type is used to define the shape of our data.
export type AttendanceRecord = {
	id: string;
	user_id: string;
	event_id: string;
	beneficiary_id: string;
	benefit_id: string;
	time_in: string;
	time_out: string | null;
	created_at: string | null;
	updated_at: string | null;
	event: {
		id: string;
		name: string;
		start_date: string;
		start_time: string;
		end_date: string;
		end_time: string;
		location: string;
		is_active: boolean;
		created_at: string;
		updated_at: string;
	};
	benefit: {
		id: string;
		name: string;
		type: string;
		is_active: boolean;
		created_at: string;
		updated_at: string;
	};
};

interface ApiResponse {
	status: string;
	message: string;
	data: AttendanceRecord[];
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const BeneficiaryAttendanceTable = () => {
	const params = useParams();
	const beneficiaryId = params.id as string;

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<AttendanceRecord[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 1,
	});

	const fetchAttendanceRecords = async (page = 1, limit = 50) => {
		try {
			setIsLoading(true);
			const session = await getSession();

			const accessToken = session?.accessToken;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`${BASE_URL}/beneficiary/attendance/history/${beneficiaryId}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				setTableData(response.data.data);

				// If your API returns pagination data, update it here
				// setPagination(response.data.pagination);

				console.log("Attendance Data:", response.data.data);
			}
		} catch (error) {
			console.error("Error fetching attendance data:", error);
			toast.error("Failed to fetch attendance records.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (beneficiaryId) {
			fetchAttendanceRecords(1, 50);
		}
	}, [beneficiaryId]);

	const formatDateTime = (dateTimeString: string) => {
		if (!dateTimeString) return "N/A";

		const date = new Date(dateTimeString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatTime = (dateTimeString: string) => {
		if (!dateTimeString) return "N/A";

		const date = new Date(dateTimeString);
		return date.toLocaleString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const getStatus = (timeOut: string | null) => {
		return timeOut ? "completed" : "active";
	};

	const getStatusColor = (status: string) => {
		return status === "completed" ? "green" : "blue";
	};

	const loadMoreRecords = () => {
		if (pagination.page < pagination.pages) {
			fetchAttendanceRecords(pagination.page + 1, pagination.limit);
		}
	};

	const columns: ColumnDef<AttendanceRecord>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="check"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="check"
				/>
			),
		},
		{
			accessorKey: "id",
			header: "Attendance ID",
			cell: ({ row }) => {
				const attendanceId = row.getValue<string>("id") || "N/A";
				return <span className="text-xs text-primary-6">{attendanceId}</span>;
			},
		},
		{
			accessorKey: "event.name",
			header: "Event Name",
			cell: ({ row }) => {
				const eventName = row.original.event.name || "N/A";
				return <span className="text-xs text-primary-6">{eventName}</span>;
			},
		},
		{
			accessorKey: "event.location",
			header: "Location",
			cell: ({ row }) => {
				const location = row.original.event.location || "N/A";
				return <span className="text-xs text-primary-6">{location}</span>;
			},
		},
		{
			accessorKey: "benefit.name",
			header: "Benefit Received",
			cell: ({ row }) => {
				const benefitName = row.original.benefit.name || "N/A";
				return (
					<span className="text-xs text-primary-6 capitalize">
						{benefitName}
					</span>
				);
			},
		},
		{
			accessorKey: "time_in",
			header: "Time In",
			cell: ({ row }) => {
				const timeIn = row.original.time_in;
				return <span className="text-xs text-black">{formatTime(timeIn)}</span>;
			},
		},
		{
			accessorKey: "time_out",
			header: "Time Out",
			cell: ({ row }) => {
				const timeOut = row.original.time_out;
				return (
					<span className="text-xs text-black">
						{timeOut ? formatTime(timeOut) : "Still Active"}
					</span>
				);
			},
		},
		{
			accessorKey: "time_out",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-start items-start"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const timeOut = row.original.time_out;
				const status = getStatus(timeOut);
				return (
					<div className={`status ${getStatusColor(status)}`}>{status}</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date",
			cell: ({ row }) => {
				const createdAt = row.original.created_at || row.original.time_in;
				return (
					<span className="text-xs text-primary-6">
						{formatDateTime(createdAt)}
					</span>
				);
			},
		},
	];

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<BeneficiaryAttendanceDataTable columns={columns} data={tableData} />
					{tableData.length === 0 && !isLoading && (
						<div className="text-center p-8 text-gray-500">
							No attendance records found for this beneficiary.
						</div>
					)}
					{pagination.page < pagination.pages && (
						<div className="mt-4 flex justify-center">
							<Button
								onClick={loadMoreRecords}
								className="bg-primary-1 text-white"
								disabled={isLoading}>
								{isLoading
									? "Loading..."
									: `Load More (${tableData.length} of ${pagination.total})`}
							</Button>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default BeneficiaryAttendanceTable;
