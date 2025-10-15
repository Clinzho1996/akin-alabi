"use client";

import { ColumnDef } from "@tanstack/react-table";

import Loader from "@/components/Loader";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BenefitDataTable } from "./ben-benefit-table";

// This type is used to define the shape of our data.
export type Benefit = {
	benefit_name: string;
	event_name: string;
};

interface ApiResponse {
	status: string;
	message: string;
	data: Benefit[];
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const BenefitTable = () => {
	const params = useParams();
	const beneficiaryId = params.id as string;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Benefit[]>([]);

	const fetchBenefits = async (page = 1, limit = 50) => {
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
				`${BASE_URL}/beneficiary/benefit/history/${beneficiaryId}`,
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

				console.log("Benefits Data:", response.data.data);
			}
		} catch (error) {
			console.error("Error fetching benefits data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBenefits(1, 50);
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

	const getBenefitType = (benefitName: string) => {
		// You can customize this logic based on your benefit types
		const monetaryBenefits = ["cash", "money", "grant", "stipend"];
		const materialBenefits = ["phone", "food", "clothing", "equipment"];
		const serviceBenefits = ["training", "counseling", "medical", "education"];

		const lowerName = benefitName.toLowerCase();

		if (monetaryBenefits.some((term) => lowerName.includes(term))) {
			return "Monetary";
		} else if (materialBenefits.some((term) => lowerName.includes(term))) {
			return "Material";
		} else if (serviceBenefits.some((term) => lowerName.includes(term))) {
			return "Service";
		} else {
			return "Other";
		}
	};

	const columns: ColumnDef<Benefit>[] = [
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
			accessorKey: "benefit_name",
			header: "Name of Benefit",
			cell: ({ row }) => {
				const benefitName = row.getValue<string>("benefit_name") || "N/A";
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<span className="text-xs text-primary-6 capitalize">
							{benefitName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "event_name",
			header: "Event Name",
			cell: ({ row }) => {
				const eventName = row.getValue<string>("event_name") || "N/A";
				return (
					<span className="text-xs text-primary-6 capitalize">{eventName}</span>
				);
			},
		},
		{
			accessorKey: "benefit_name",
			header: "Benefit Type",
			cell: ({ row }) => {
				const benefitName = row.getValue<string>("benefit_name");
				const benefitType = getBenefitType(benefitName);
				return (
					<span className="text-xs text-primary-6 capitalize">
						{benefitType}
					</span>
				);
			},
		},
		{
			id: "date",
			header: "Date",
			cell: () => {
				// Since the API response doesn't include dates, you might want to:
				// 1. Use current date as placeholder
				// 2. Fetch additional data if available
				// 3. Remove this column if not needed
				return (
					<span className="text-xs text-primary-6">
						{formatDate(new Date())}
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
					<BenefitDataTable columns={columns} data={tableData} />
					{tableData.length === 0 && !isLoading && (
						<div className="text-center p-8 text-gray-500">
							No benefits found.
						</div>
					)}
				</>
			)}
		</>
	);
};

export default BenefitTable;
