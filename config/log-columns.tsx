"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	RowSelectionState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { format, isValid, parseISO } from "date-fns";
import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { LogDataTable } from "./log-table";

// This type is used to define the shape of our data.
export type Logs = {
	id: string;
	user_id: string;
	model: string;
	desc: string;
	action: string;
	created_at: string;
	updated_at: string;
	user: {
		id: string;
		first_name: string;
		last_name: string;
		staff_code: string;
		email: string;
		phone: string | null;
		role: string;
		is_active: boolean;
		last_logged_in: string | null;
		created_at: string;
		updated_at: string;
	};
};

interface ApiResponse {
	status: string;
	data: Logs[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LogTable = () => {
	const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [tableData, setTableData] = useState<Logs[]>([]);

	const openRestoreModal = (row: any) => {
		setSelectedRow(row.original);
		setRestoreModalOpen(true);
	};

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeRestoreModal = () => {
		setRestoreModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const columns: ColumnDef<Logs>[] = [
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
			accessorKey: "user",
			header: "Staff",
			cell: ({ row }) => {
				const user = row.original.user;
				const fullName = `${user?.first_name} ${user?.last_name}`;
				const staffCode = user?.staff_code;

				return (
					<div className="flex flex-col">
						<span className="text-xs font-medium text-black capitalize">
							{fullName}
						</span>
						<span className="text-xs text-gray-500">{staffCode}</span>
						<span className="text-xs text-gray-400 capitalize">
							{user?.role}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date & Time",
			cell: ({ row }) => {
				const date = parseISO(row.original.created_at);
				return (
					<div className="flex flex-col">
						<span className="text-xs text-primary-6">
							{isValid(date) ? format(date, "do MMM. yyyy") : "Invalid Date"}
						</span>
						<span className="text-xs text-gray-500">
							{isValid(date) ? format(date, "h:mm a") : ""}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "model",
			header: "Module",
			cell: ({ row }) => {
				return (
					<span className="text-xs text-primary-6 capitalize">
						{row.original.model}
					</span>
				);
			},
		},
		{
			accessorKey: "action",
			header: "Action",
			cell: ({ row }) => {
				const action = row.original.action;
				const actionColor =
					action === "created"
						? "text-green-600"
						: action === "updated"
						? "text-blue-600"
						: action === "deleted"
						? "text-red-600"
						: "text-primary-6";

				return (
					<span className={`text-xs capitalize ${actionColor}`}>{action}</span>
				);
			},
		},
		{
			accessorKey: "desc",
			header: "Description",
			cell: ({ row }) => {
				const description = row.original.desc;
				const maxLength = 60;
				const [isExpanded, setIsExpanded] = useState(false);

				// Function to truncate text
				const truncateText = (text: string, length: number) => {
					return text.length > length
						? text.substring(0, length) + "..."
						: text;
				};

				// Parse changes if it's an update action
				let changes = null;
				if (
					row.original.action === "updated" &&
					description.includes("Changes:")
				) {
					const changesPart = description.split("Changes:")[1];
					changes = changesPart.split(",").map((change) => change.trim());
				}

				return (
					<div className="flex flex-col">
						<span className="text-xs text-primary-6">
							{isExpanded
								? description.split("Changes:")[0]
								: truncateText(description.split("Changes:")[0], maxLength)}
						</span>
						{changes && (
							<div className="mt-1">
								{changes.map((change, index) => (
									<div key={index} className="text-xs text-gray-500">
										• {isExpanded ? change : truncateText(change, maxLength)}
									</div>
								))}
							</div>
						)}
						{description.length > maxLength && (
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="text-xs text-blue-500 mt-1 text-left">
								{isExpanded ? "Show less" : "Read more"}
							</button>
						)}
					</div>
				);
			},
		},
	];

	const fetchLogs = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(`${BASE_URL}/log`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setTableData(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching log data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, []);

	return (
		<>
			<LogDataTable columns={columns} data={tableData} />
		</>
	);
};

export default LogTable;
