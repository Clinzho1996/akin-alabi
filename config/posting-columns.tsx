"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import axios from "axios";
import { format, isValid, parseISO } from "date-fns";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PostingDataTable } from "./posting-table";

export type Posting = {
	id: string;
	user_id: string;
	device_id: string;
	state_id: string;
	district_id: string;
	pod_id: string;
	sites: { id: string; name: string }[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
	state: { id: string; name: string };
	district: { id: string; name: string };
	pod: { id: string; name: string };
	user: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		picture: string;
		staff_code: string;
		role: string;
		is_active: boolean;
		last_logged_in: string;
		created_at: string;
		updated_at: string;
	};
	device: {
		id: string;
		serial_number: string;
		alias: string;
		status: string;
		created_at: string;
		updated_at: string;
	};
};

const PostingTable = () => {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Posting[]>([]);

	const fetchPosting = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			console.log("session", session);

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{
				status: string;
				message: string;
				data: Posting[];
			}>("https://api.wowdev.com.ng/api/v1/posting", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const fetchedData = response.data.data;

			console.log("Posting Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				user_id: item.user_id,
				device_id: item.device_id,
				state_id: item.state_id,
				district_id: item.district_id,
				pod_id: item.pod_id,
				sites: item.sites,
				is_active: item.is_active,
				created_at: item.created_at,
				updated_at: item.updated_at,
				state: item.state,
				district: item.district,
				pod: item.pod,
				user: item.user,
				device: item.device,
			}));

			console.log("Mapped Data:", mappedData);
			setTableData(mappedData);
		} catch (error) {
			console.error("Error fetching posting data:", error);
			toast.error("Failed to fetch posting data. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPosting();
	}, []);

	const columns: ColumnDef<Posting>[] = [
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
			accessorKey: "device.serial_number",
			header: "Serial Number",
			cell: ({ row }) => {
				const serial = row.original.device.serial_number;
				return <span className="text-xs text-black">{serial}</span>;
			},
		},
		{
			accessorKey: "user.first_name",
			header: "Staff Name",
			cell: ({ row }) => {
				const staffName = `${row.original.user.first_name} ${row.original.user.last_name}`;
				return (
					<span className="text-xs text-dark-1 capitalize">{staffName}</span>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date",
			cell: ({ row }) => {
				const date = parseISO(row.original.created_at); // Convert to Date object
				return (
					<span className="text-xs text-primary-6">
						{isValid(date) ? format(date, "do MMM. yyyy") : "Invalid Date"}
					</span>
				); // Format if valid
			},
		},
		{
			accessorKey: "state.name",
			header: "State",
			cell: ({ row }) => {
				const state = row.original.state.name;
				return <span className="text-xs text-primary-6">{state}</span>;
			},
		},
		{
			accessorKey: "district.name",
			header: "District",
			cell: ({ row }) => {
				const district = row.original.district.name;
				return <span className="text-xs text-primary-6">{district}</span>;
			},
		},
		{
			accessorKey: "sites",
			header: "Sites",
			cell: ({ row }) => {
				const sites = row.original.sites;
				const siteNames = sites.map((site) => site.name).join(", ");
				return <span className="text-xs text-primary-6">{siteNames}</span>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const actions = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/posting-management/${actions.device_id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View
							</Button>
						</Link>
					</div>
				);
			},
		},
	];

	const handleDelete = () => {
		// Get the selected row IDs
		const selectedRowIds = Object.keys(rowSelection).filter(
			(key) => rowSelection[key]
		);

		// Filter the data to remove the selected rows
		const filteredData = tableData.filter(
			(row: { id: string }) => !selectedRowIds.includes(row.id)
		);

		// Update the table data
		setTableData(filteredData);

		// Clear the row selection after deletion
		setRowSelection({});
	};

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<PostingDataTable columns={columns} data={tableData} />
			)}
		</>
	);
};

export default PostingTable;
