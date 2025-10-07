"use client";

import { ColumnDef } from "@tanstack/react-table";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BenefitDataTable } from "./ben-benefit-table";

// This type is used to define the shape of our data.
export type EndUser = {
	id: string;
	_id: string;
	createdAt: string;
	public_id?: string;
	full_name: string | null;
	profile_pic?: string | null;
	email: string;
	status: string;
	date_of_birth: string | null;
	gender: string | null;
	created_at: string;
	verified: boolean;
	role: string;
	pic?: string | null;
	type?: string;
};

interface ApiResponse {
	status: boolean;
	message: string;
	data: EndUser[];
	overview: {
		total: number;
		disable: number;
		active: number;
	};
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
	filters: Record<string, unknown>;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface EditData {
	id: string;
	full_name: string;
	email: string;
	gender: string;
	date_of_birth: string;
}

const BenefitTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<EndUser[]>([]);

	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 1,
	});

	const fetchUsers = async (page = 1, limit = 50) => {
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
				`https://api.medbankr.ai/api/v1/administrator/user?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === true) {
				const formattedData = response.data.data.map((user) => ({
					id: user._id,
					_id: user._id,
					createdAt: user.createdAt,
					public_id: user.public_id,
					pic: user.profile_pic,
					full_name: user.full_name,
					email: user.email,
					status: user.status,
					date_of_birth: user.date_of_birth,
					gender: user.gender,
					created_at: user.createdAt,
					verified: user.verified,
					role: user.role,
					type: user.type,
				}));

				setTableData(formattedData);

				if (response.data.pagination) {
					setPagination(response.data.pagination);
				}

				console.log("Users Data:", formattedData);
				console.log("Pagination:", response.data.pagination);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(1, 50);
	}, []);

	const formatDate = (rawDate: string | Date | null) => {
		if (!rawDate) return "N/A";

		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const loadMoreUsers = () => {
		if (pagination.page < pagination.pages) {
			fetchUsers(pagination.page + 1, pagination.limit);
		}
	};

	const columns: ColumnDef<EndUser>[] = [
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
			accessorKey: "full_name",
			header: "Name of Benefit",
			cell: ({ row }) => {
				const name = row.getValue<string | null>("full_name") || "N/A";

				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<span className="text-xs text-primary-6 capitalize">{name}</span>
					</div>
				);
			},
		},

		{
			accessorKey: "type",
			header: "Benefit Type",
			cell: ({ row }) => {
				const type = row.getValue<string>("type") || "Monetary";
				return (
					<span className="text-xs text-primary-6 capitalize">{type}</span>
				);
			},
		},

		{
			accessorKey: "created_at",
			header: "Date",
			cell: ({ row }) => {
				const date = row.getValue<string>("created_at");
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
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
					<BenefitDataTable columns={columns} data={tableData} />
					{pagination.page < pagination.pages && (
						<div className="mt-4 flex justify-center">
							<Button
								onClick={loadMoreUsers}
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

export default BenefitTable;
