"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconCircleFilled, IconEye, IconUser } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DuplicateDataTable } from "./duplicate-table";

// This type is used to define the shape of our data.
export type Farmer = {
	id: string;
	oaf_id: string;
	first_name: string;
	last_name: string;
	other_name: string | null;
	gender: string | null;
	email: string | null;
	phone_number: string | null;
	dob: string | null;
	state_id: string;
	district_id: string;
	pod_id: string;
	site_id: string;
	group_id: string;
	pic: string | null;
	finger_bio: string | null;
	facial_bio: string | null;
	created_at: string;
	updated_at: string;
	group: {
		id: string;
		state_id: string;
		district_id: string;
		pod_id: string;
		site_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	site: {
		id: string;
		state_id: string;
		district_id: string;
		pod_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	pod: {
		id: string;
		state_id: string;
		district_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	district: {
		id: string;
		state_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	state: {
		id: string;
		name: string;
	};
	biometricStatus?: string;
};

// Type for potential duplicates
export type PotentialDuplicate = {
	farmer1: Farmer;
	farmer2: Farmer;
	similarity: number;
};

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const FarmerDuplicateTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<PotentialDuplicate[]>([]);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalItems: 0,
		lastPage: 1,
		pageSize: 10,
		hasNextPage: false,
		hasPrevPage: false,
	});
	const [isKeepModalOpen, setKeepModalOpen] = useState(false);
	const [selectedDuplicate, setSelectedDuplicate] =
		useState<PotentialDuplicate | null>(null);
	const [keepOption, setKeepOption] = useState<"old" | "new" | null>(null);
	const [selectedStatus, setSelectedStatus] = useState<string>("View All");

	const fetchPotentialDuplicates = async (
		page: number = 1,
		pageSize: number = 10
	) => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{
				status: string;
				potential_duplicates: {
					current_page: number;
					data: PotentialDuplicate[];
				};
			}>("https://api.wowdev.com.ng/api/v1/farmer/potential/duplicates", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				params: {
					page,
					per_page: pageSize,
				},
			});

			const fetchedData = response.data.potential_duplicates.data;

			// Add biometric status to each farmer
			const processedData = fetchedData.map((duplicate) => {
				// Process farmer1
				const farmer1 = {
					...duplicate.farmer1,
					biometricStatus:
						duplicate.farmer1.finger_bio && duplicate.farmer1.facial_bio
							? "both"
							: duplicate.farmer1.facial_bio
							? "facial"
							: duplicate.farmer1.finger_bio
							? "fingerprint"
							: "none",
				};

				// Process farmer2
				const farmer2 = {
					...duplicate.farmer2,
					biometricStatus:
						duplicate.farmer2.finger_bio && duplicate.farmer2.facial_bio
							? "both"
							: duplicate.farmer2.facial_bio
							? "facial"
							: duplicate.farmer2.finger_bio
							? "fingerprint"
							: "none",
				};

				return {
					farmer1,
					farmer2,
					similarity: duplicate.similarity,
				};
			});

			setTableData(processedData);
			setPagination((prev) => ({
				...prev,
				currentPage: page,
				totalItems: processedData.length * 2,
				lastPage: Math.ceil(processedData.length / pageSize),
				pageSize,
				hasNextPage: page < Math.ceil(processedData.length / pageSize),
				hasPrevPage: page > 1,
			}));
		} catch (error) {
			console.error("Error fetching potential duplicates:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPotentialDuplicates();
	}, []);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= pagination.lastPage) {
			setPagination((prev) => ({ ...prev, currentPage: newPage }));
			fetchPotentialDuplicates(newPage, pagination.pageSize);
		}
	};

	const handlePageSizeChange = (newSize: number) => {
		setPagination((prev) => ({
			...prev,
			pageSize: newSize,
			currentPage: 1,
		}));
		fetchPotentialDuplicates(1, newSize);
	};

	const formatDate = (rawDate: string | Date) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const handleKeepFarmer = (
		duplicate: PotentialDuplicate,
		option: "old" | "new"
	) => {
		setSelectedDuplicate(duplicate);
		setKeepOption(option);
		setKeepModalOpen(true);
	};

	const confirmKeepFarmer = async () => {
		if (!selectedDuplicate || !keepOption) return;

		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const endpoint =
				keepOption === "old"
					? "https://api.wowdev.com.ng/api/v1/farmer/keep/old/data"
					: "https://api.wowdev.com.ng/api/v1/farmer/keep/new/data";

			const payload = {
				farmer1_id: selectedDuplicate.farmer1.id,
				farmer2_id: selectedDuplicate.farmer2.id,
			};

			const response = await axios.post(endpoint, payload, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.status === 200) {
				toast.success(
					`Kept ${keepOption === "old" ? "old" : "new"} farmer successfully.`
				);
				setTableData((prevData) =>
					prevData.filter(
						(duplicate) =>
							duplicate.farmer1.id !== selectedDuplicate.farmer1.id &&
							duplicate.farmer2.id !== selectedDuplicate.farmer2.id
					)
				);
			}
		} catch (error) {
			console.error("Error resolving duplicate:", error);
			toast.error("Failed to resolve duplicate");
		} finally {
			setKeepModalOpen(false);
			setSelectedDuplicate(null);
			setKeepOption(null);
		}
	};

	const handleStatusFilter = (status: string) => {
		setSelectedStatus(status);
		// Filter logic would be implemented here based on your API
	};

	const StatusBadge = ({ status }: { status: string }) => {
		const getStatusColor = () => {
			switch (status) {
				case "both":
					return "status green";
				case "facial":
					return "status blue";
				case "fingerprint":
					return "status yellow";
				case "none":
					return "status red";
				default:
					return "status green";
			}
		};

		const getStatusText = () => {
			switch (status) {
				case "both":
					return "Both";
				case "facial":
					return "Facial";
				case "fingerprint":
					return "Fingerprint";
				case "none":
					return "None";
				default:
					return status;
			}
		};

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
				{getStatusText()}
			</span>
		);
	};

	const columns: ColumnDef<PotentialDuplicate>[] = [
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
			id: "id",
			header: "ID",
			cell: ({ row }) => {
				// show both farmer IDs side by side
				return (
					<div className="flex flex-col text-xs font-medium gap-3">
						<p className="flex flex-row justify-start items-center gap-3">
							<span className="flex flex-row justify-start items-center status green gap-2 ">
								<IconCircleFilled size={6} /> New
							</span>{" "}
							{row.original.farmer1.oaf_id}
						</p>
						<p className="flex flex-row justify-start items-center gap-3">
							<span className="flex flex-row justify-start items-center status yellow gap-2 w-fit">
								<IconCircleFilled size={6} /> Old
							</span>{" "}
							{row.original.farmer2.oaf_id}
						</p>
					</div>
				);
			},
		},
		{
			id: "name",
			header: "First & Last Name",
			cell: ({ row }) => {
				return (
					<div className="flex flex-col text-xs font-medium gap-3">
						<p>
							{row.original.farmer1.first_name} {row.original.farmer1.last_name}
						</p>
						<p>
							{row.original.farmer2.first_name} {row.original.farmer2.last_name}
						</p>
					</div>
				);
			},
		},
		{
			id: "group",
			header: "Group Name",
			cell: ({ row }) => (
				<div className="flex flex-col text-xs gap-3">
					<p>{row.original.farmer1.group?.name || "N/A"}</p>
					<p>{row.original.farmer2.group?.name || "N/A"}</p>
				</div>
			),
		},
		{
			id: "site",
			header: "Site Name",
			cell: ({ row }) => (
				<div className="flex flex-col text-xs gap-3">
					<p>{row.original.farmer1.site?.name || "N/A"}</p>
					<p>{row.original.farmer2.site?.name || "N/A"}</p>
				</div>
			),
		},
		{
			id: "sector",
			header: "Sector",
			cell: ({ row }) => (
				<div className="flex flex-col text-xs gap-3">
					<p>{row.original.farmer1.pod?.name || "N/A"}</p>
					<p>{row.original.farmer2.pod?.name || "N/A"}</p>
				</div>
			),
		},
		{
			id: "date_joined",
			header: "Date Joined",
			cell: ({ row }) => (
				<div className="flex flex-col text-xs gap-3">
					<p>{formatDate(row.original.farmer1.created_at)}</p>
					<p>{formatDate(row.original.farmer2.created_at)}</p>
				</div>
			),
		},
		{
			id: "status",
			header: "Biometric Captured",
			cell: ({ row }) => (
				<div className="flex flex-col text-xs gap-3">
					<StatusBadge
						status={row.original.farmer1.biometricStatus || "none"}
					/>
					<StatusBadge
						status={row.original.farmer2.biometricStatus || "none"}
					/>
				</div>
			),
		},
		{
			id: "similarity",
			header: "Similarity",
			cell: ({ row }) => {
				const similarity = row.original.similarity;
				return (
					<div className="text-left">
						<div className=" bg-blue-100 rounded-full flex items-center justify-start mx-auto">
							<span className="text-lg font-bold text-blue-800">
								{Math.round(similarity * 100)}%
							</span>
						</div>
						<p className="text-xs text-gray-600">Match</p>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const duplicate = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 p-2 bg-white border-[1px] border-[#E8E8E8]">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-white">
							<Link href={`/farmer-management/${duplicate.farmer1.id}`}>
								<DropdownMenuItem className="action cursor-pointer hover:bg-secondary-3">
									<IconEye />
									<p className="text-xs ml-2">View Old</p>
								</DropdownMenuItem>
							</Link>
							<Link href={`/farmer-management/${duplicate.farmer2.id}`}>
								<DropdownMenuItem className="action cursor-pointer hover:bg-secondary-3">
									<IconEye />
									<p className="text-xs ml-2">View New</p>
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem
								onClick={() => handleKeepFarmer(duplicate, "old")}
								className="action cursor-pointer hover:bg-secondary-3">
								<IconUser />
								<p className="text-xs">Keep Old</p>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleKeepFarmer(duplicate, "new")}
								className="action cursor-pointer hover:bg-secondary-3">
								<IconUser />
								<p className="text-xs">Keep New</p>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<DuplicateDataTable
					columns={columns}
					data={tableData}
					selectedStatus={selectedStatus}
					onStatusFilter={handleStatusFilter}
				/>
			)}

			{/* Pagination Controls */}
			<div className="flex items-center justify-between px-2 py-4">
				<div className="flex items-center space-x-2 gap-3">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={`${pagination.pageSize}`}
						onValueChange={(value) => handlePageSizeChange(Number(value))}>
						<SelectTrigger className="h-8 w-[70px] bg-white border border-[#E8E8E8]">
							<SelectValue placeholder={pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top" className="z-200 post bg-white">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8 gap-3">
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {pagination.currentPage} of {pagination.lastPage}
					</div>
					<div className="flex items-center space-x-2 gap-2">
						<Button
							variant="outline"
							className="h-8 w-8 p-0 bg-white"
							onClick={() => handlePageChange(pagination.currentPage - 1)}
							disabled={!pagination.hasPrevPage}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0 bg-white"
							onClick={() => handlePageChange(pagination.currentPage + 1)}
							disabled={!pagination.hasNextPage}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Keep Farmer Modal */}
			{isKeepModalOpen && selectedDuplicate && keepOption && (
				<Modal
					isOpen={isKeepModalOpen}
					onClose={() => setKeepModalOpen(false)}
					title={`Keep ${keepOption === "old" ? "Old" : "New"} Farmer`}>
					<div className="bg-white py-4 rounded-lg">
						<p className="mb-4">
							Are you sure you want to keep the {keepOption} farmer and remove
							the other?
						</p>
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div className="p-3 border rounded-md">
								<h4 className="font-semibold">
									{keepOption === "old" ? "Keeping" : "Removing"}
								</h4>
								<p>
									{selectedDuplicate.farmer1.first_name}{" "}
									{selectedDuplicate.farmer1.last_name}
								</p>
								<p className="text-sm text-gray-600">
									{selectedDuplicate.farmer1.oaf_id}
								</p>
							</div>
							<div className="p-3 border rounded-md">
								<h4 className="font-semibold">
									{keepOption === "new" ? "Keeping" : "Removing"}
								</h4>
								<p>
									{selectedDuplicate.farmer2.first_name}{" "}
									{selectedDuplicate.farmer2.last_name}
								</p>
								<p className="text-sm text-gray-600">
									{selectedDuplicate.farmer2.oaf_id}
								</p>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={() => setKeepModalOpen(false)}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={confirmKeepFarmer}>
								Confirm
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};

export default FarmerDuplicateTable;
