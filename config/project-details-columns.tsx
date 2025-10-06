"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { format, isValid, parseISO } from "date-fns";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ProjectDetailsDataTable } from "./project-details-table";

// This type is used to define the shape of our data.
export type Farmer = {
	id: string;
	first_name: string;
	last_name: string;
	created_at: string | null;
	validated: boolean;
};

type ProjectDetails = {
	id: string;
	name: string;
	user_id: string;
	start_date: string;
	end_date: string;
	status: string;
	groups: string[];
	created_at: string | null;
	updated_at: string | null;
	user: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		picture: string | null;
		staff_code: string;
		role: string;
		is_active: boolean;
		last_logged_in: string | null;
		created_at: string;
		updated_at: string;
	};
} & Farmer[];

const ProjectDetailsTable = () => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
		null
	);
	const [farmers, setFarmers] = useState<Farmer[]>([]);
	const columns: ColumnDef<Farmer>[] = [
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
			accessorKey: "first_name",
			header: "First Name",
			cell: ({ row }) => {
				return (
					<span className="text-xs text-primary-6 capitalize">
						{row.original.first_name}
					</span>
				);
			},
		},
		{
			accessorKey: "last_name",
			header: "Last Name",
			cell: ({ row }) => {
				return (
					<span className="text-xs text-primary-6 capitalize">
						{row.original.last_name}
					</span>
				);
			},
		},
		{
			accessorKey: "validated",
			header: "Status",
			cell: ({ row }) => {
				return (
					<span
						className={`text-xs capitalize px-2 py-1 rounded-full ${
							row.original.validated ? "status green" : "status yellow"
						}`}>
						{row.original.validated ? "Validated" : "Pending"}
					</span>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date Added",
			cell: ({ row }) => {
				const createdAt = row.original.created_at;
				if (!createdAt) {
					return <span className="text-xs text-primary-6">N/A</span>;
				}

				const date = parseISO(createdAt);
				return (
					<span className="text-xs text-primary-6">
						{isValid(date) ? format(date, "do MMM. yyyy") : "Invalid Date"}
					</span>
				);
			},
		},
	];

	const fetchProjectDetails = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			// Fetch project details
			const projectResponse = await axios.get<{
				status: string;
				message: string;
				data: ProjectDetails;
			}>(`https://api.wowdev.com.ng/api/v1/project/farmers/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			setProjectDetails(projectResponse.data.data);

			console.log("Project Details:", projectResponse.data.data);

			setFarmers(projectResponse.data.data || []);
		} catch (error) {
			console.error("Error fetching project data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchProjectDetails();
		}
	}, [id]);

	if (isLoading) {
		return <div>Loading project details...</div>;
	}

	if (!projectDetails) {
		return <div>Project not found</div>;
	}

	return (
		<div className="p-4">
			<ProjectDetailsDataTable columns={columns} data={farmers} />
		</div>
	);
};

export default ProjectDetailsTable;
