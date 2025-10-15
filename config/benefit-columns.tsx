"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconRefresh, IconTrash, IconUserPause } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BenefitDataTable } from "./benefit-table";

// This type is used to define the shape of our data.
export type Benefit = {
	id: string;
	name: string;
	type: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

interface ApiResponse {
	status: string;
	message: string;
	data: Benefit[];
	pagination: {
		prev_page_url: string | null;
		next_page_url: string | null;
		current_page: number;
		total: number;
	};
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface EditData {
	id: string;
	name: string;
	type: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const BenefitTable = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Benefit | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Benefit[]>([]);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isStatusModalOpen, setStatusModalOpen] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		id: "",
		name: "",
		type: "material",
	});
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 1,
	});

	const openEditModal = (row: Row<Benefit>) => {
		const benefit = row.original;
		setEditData({
			id: benefit.id,
			name: benefit.name,
			type: benefit.type,
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const openStatusModal = (row: Row<Benefit>) => {
		setSelectedRow(row.original);
		setStatusModalOpen(true);
	};

	const closeStatusModal = () => {
		setStatusModalOpen(false);
	};

	const handleEditBenefit = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.put(
				`${BASE_URL}/benefit/${editData.id}`,
				{
					name: editData.name,
					type: editData.type,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Benefit updated successfully.");
				fetchBenefits();
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating benefit:", error);
			toast.error("Failed to update benefit. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleStatus = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken || !selectedRow) {
				console.error("No access token or benefit selected.");
				return;
			}

			const endpoint = selectedRow.is_active
				? `${BASE_URL}/benefit/deactivate/${selectedRow.id}`
				: `${BASE_URL}/benefit/activate/${selectedRow.id}`;

			const response = await axios.patch(
				endpoint,
				{},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success(response.data.message);
				fetchBenefits();
				closeStatusModal();
			}
		} catch (error) {
			console.error("Error toggling benefit status:", error);
			toast.error("Failed to update benefit status. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<Benefit>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

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
				`${BASE_URL}/benefit?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				setTableData(response.data.data);

				if (response.data.pagination) {
					const paginationData = response.data.pagination;
					setPagination({
						page: paginationData.current_page,
						limit: 50, // You might want to get this from API if available
						total: paginationData.total,
						pages: Math.ceil(paginationData.total / 50), // Adjust based on your limit
					});
				}

				console.log("Benefits Data:", response.data.data);
				console.log("Pagination:", response.data.pagination);
			}
		} catch (error) {
			console.error("Error fetching benefits data:", error);
			toast.error("Failed to fetch benefits.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBenefits(1, 50);
	}, []);

	const deleteBenefit = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/benefit/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setTableData((prevData) =>
					prevData.filter((benefit) => benefit.id !== id)
				);
				toast.success("Benefit deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting benefit:", error);
			toast.error("Failed to delete benefit. Please try again.");
		}
	};

	const formatDate = (rawDate: string | Date | null) => {
		if (!rawDate) return "N/A";

		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const loadMoreBenefits = () => {
		if (pagination.page < pagination.pages) {
			fetchBenefits(pagination.page + 1, pagination.limit);
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
			accessorKey: "id",
			header: "Benefit ID",
			cell: ({ row }) => {
				const benefitId = row.original.id;
				return (
					<span className="text-xs text-primary-6">
						{benefitId.slice(0, 8)}...
					</span>
				);
			},
		},
		{
			accessorKey: "name",
			header: "Name of Benefit",
			cell: ({ row }) => {
				const name = row.original.name;
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
				const type = row.original.type;
				return (
					<span className="text-xs text-primary-6 capitalize">{type}</span>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date Created",
			cell: ({ row }) => {
				const date = row.original.created_at;
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			accessorKey: "is_active",
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
				const isActive = row.original.is_active;
				return (
					<div className={`status ${isActive ? "green" : "red"}`}>
						{isActive ? "Active" : "Inactive"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const benefit = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-3">
						<Button
							className="border border-[#E8E8E8]"
							onClick={() => openEditModal(row)}>
							Edit
						</Button>

						<Button
							className={`border border-[#E8E8E8] ${
								benefit.is_active
									? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
									: "bg-green-100 text-green-800 hover:bg-green-200"
							}`}
							onClick={() => openStatusModal(row)}>
							{benefit.is_active ? (
								<IconUserPause size={16} />
							) : (
								<IconRefresh size={16} />
							)}
							{benefit.is_active ? " Deactivate" : " Reactivate"}
						</Button>

						<Button
							className="border border-[#E8E8E8]"
							onClick={() => openDeleteModal(row)}>
							<IconTrash color="#6B7280" />
						</Button>
					</div>
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
					<BenefitDataTable
						columns={columns}
						data={tableData}
						onRefresh={fetchBenefits}
					/>
					{tableData.length === 0 && !isLoading && (
						<div className="text-center p-8 text-gray-500">
							No benefits found.
						</div>
					)}
					{pagination.page < pagination.pages && (
						<div className="mt-4 flex justify-center">
							<Button
								onClick={loadMoreBenefits}
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

			{/* Edit Benefit Modal */}
			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Update Benefit">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out form modal-small w-[500px]">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col sm:flex-row gap-2 w-full bg-white shadow-lg p-3 rounded-lg">
								<div className="w-full">
									<p className="text-xs text-primary-6">Benefit Name</p>
									<Input
										type="text"
										placeholder="Enter Benefit Name"
										className="focus:border-none mt-2"
										value={editData.name}
										onChange={(e) =>
											setEditData({ ...editData, name: e.target.value })
										}
									/>
								</div>

								<div className="w-full">
									<p className="text-xs text-primary-6 mt-2">Benefit Type</p>
									<Select
										value={editData.type}
										onValueChange={(value) =>
											setEditData({ ...editData, type: value })
										}>
										<SelectTrigger className="w-full option select">
											<SelectValue placeholder="Select benefit type" />
										</SelectTrigger>
										<SelectContent className="bg-white z-10 select text-gray-300">
											<SelectItem value="monetary">Monetary</SelectItem>
											<SelectItem value="material">Material</SelectItem>
											<SelectItem value="service">Service</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeEditModal}>
								Cancel
							</Button>
							<Button
								className="bg-secondary-1 text-white font-inter text-xs"
								onClick={handleEditBenefit}
								disabled={isLoading}>
								{isLoading ? "Updating Benefit..." : "Update Benefit"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{/* Status Toggle Modal */}
			{isStatusModalOpen && (
				<Modal onClose={closeStatusModal} isOpen={isStatusModalOpen}>
					<p>
						Are you sure you want to{" "}
						{selectedRow?.is_active ? "deactivate" : "reactivate"} the benefit "
						{selectedRow?.name}"?
					</p>
					<p className="text-sm text-primary-6">
						{selectedRow?.is_active
							? "This will make the benefit unavailable for new events."
							: "This will make the benefit available for new events."}
					</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeStatusModal}>
							Cancel
						</Button>
						<Button
							className={`${
								selectedRow?.is_active
									? "bg-yellow-700 text-white"
									: "bg-secondary-1 text-white"
							} font-inter text-xs`}
							onClick={handleToggleStatus}
							disabled={isLoading}>
							{isLoading
								? "Updating..."
								: `Yes, ${
										selectedRow?.is_active ? "Deactivate" : "Reactivate"
								  }`}
						</Button>
					</div>
				</Modal>
			)}

			{/* Delete Benefit Modal */}
			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete the benefit "{selectedRow?.name}"?
					</p>
					<p className="text-sm text-primary-6">
						This action cannot be undone and will remove the benefit from all
						associated events.
					</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={async () => {
								if (selectedRow) {
									await deleteBenefit(selectedRow.id);
									closeDeleteModal();
								}
							}}>
							Yes, Delete Benefit
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default BenefitTable;
