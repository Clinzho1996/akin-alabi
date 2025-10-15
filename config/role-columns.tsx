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
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RoleDataTable } from "./role-table";

// This type is used to define the shape of our data.
export type Staff = {
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

interface ApiResponse {
	status: string;
	message: string;
	data: Staff[];
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface EditData {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	role: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RoleTable = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isStatusModalOpen, setStatusModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Staff | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Staff[]>([]);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		id: "",
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		role: "staff",
	});

	const openEditModal = (row: Row<Staff>) => {
		const staff = row.original;
		setEditData({
			id: staff.id,
			first_name: staff.first_name,
			last_name: staff.last_name,
			email: staff.email,
			phone: staff.phone || "",
			role: staff.role,
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const openStatusModal = (row: Row<Staff>) => {
		setSelectedRow(row.original);
		setStatusModalOpen(true);
	};

	const closeStatusModal = () => {
		setStatusModalOpen(false);
	};

	const handleEditStaff = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/user/${editData.id}`,
				{
					first_name: editData.first_name,
					last_name: editData.last_name,
					email: editData.email,
					phone: editData.phone,
					role: editData.role,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Staff updated successfully.");
				fetchStaff();
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating staff:", error);
			toast.error("Failed to update staff. Please try again.");
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
				console.error("No access token or staff selected.");
				return;
			}

			const endpoint = selectedRow.is_active
				? `${BASE_URL}/user/suspend/${selectedRow.id}`
				: `${BASE_URL}/user/reactivate/${selectedRow.id}`;

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
				fetchStaff();
				closeStatusModal();
			}
		} catch (error) {
			console.error("Error toggling staff status:", error);
			toast.error("Failed to update staff status. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<Staff>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const fetchStaff = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			const accessToken = session?.accessToken;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(`${BASE_URL}/user`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setTableData(response.data.data);
				console.log("Staff Data:", response.data.data);
			}
		} catch (error) {
			console.error("Error fetching staff data:", error);
			toast.error("Failed to fetch staff data.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStaff();
	}, []);

	const deleteStaff = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/user/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setTableData((prevData) => prevData.filter((staff) => staff.id !== id));
				toast.success("Staff deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting staff:", error);
			toast.error("Failed to delete staff. Please try again.");
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

	const getFullName = (staff: Staff) => {
		return `${staff.first_name} ${staff.last_name}`;
	};

	const columns: ColumnDef<Staff>[] = [
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
			accessorKey: "staff_code",
			header: "Staff ID",
			cell: ({ row }) => {
				const staffCode = row.original.staff_code;
				return <span className="text-xs text-primary-6">{staffCode}</span>;
			},
		},
		{
			accessorKey: "first_name",
			header: "Full Name",
			cell: ({ row }) => {
				const staff = row.original;
				const fullName = getFullName(staff);
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src={"/images/avatar.png"}
							alt={fullName}
							width={30}
							height={30}
							className="w-8 h-8 rounded-full object-cover"
						/>
						<span className="text-xs text-primary-6 capitalize">
							{fullName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => {
				const email = row.original.email;
				return <span className="text-xs text-primary-6">{email}</span>;
			},
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const role = row.original.role;
				return (
					<span className="text-xs text-primary-6 capitalize">
						{role.replace("_", " ")}
					</span>
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
						{isActive ? "Active" : "Suspended"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const staff = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-3">
						<Button
							className="border border-[#E8E8E8]"
							onClick={() => openEditModal(row)}>
							Edit
						</Button>

						<Button
							className={`border border-[#E8E8E8] ${
								staff.is_active
									? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
									: "bg-green-100 text-green-800 hover:bg-green-200"
							}`}
							onClick={() => openStatusModal(row)}>
							{staff.is_active ? (
								<IconUserPause size={16} />
							) : (
								<IconRefresh size={16} />
							)}
							{staff.is_active ? " Suspend" : " Reactivate"}
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
					<RoleDataTable
						columns={columns}
						data={tableData}
						onRefresh={fetchStaff}
					/>
					{tableData.length === 0 && !isLoading && (
						<div className="text-center p-8 text-gray-500">
							No staff members found.
						</div>
					)}
				</>
			)}

			{/* Edit Staff Modal */}
			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Staff">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out w-[650px] form-big">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">First Name *</p>
										<Input
											type="text"
											placeholder="Enter First Name"
											className="focus:border-none"
											value={editData.first_name}
											onChange={(e) =>
												setEditData({ ...editData, first_name: e.target.value })
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Last Name *</p>
										<Input
											type="text"
											placeholder="Enter Last Name"
											className="focus:border-none"
											value={editData.last_name}
											onChange={(e) =>
												setEditData({ ...editData, last_name: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Email Address *</p>
										<Input
											type="email"
											placeholder="Enter email address"
											className="focus:border-none"
											value={editData.email}
											onChange={(e) =>
												setEditData({ ...editData, email: e.target.value })
											}
										/>
									</div>

									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Role *</p>
										<Select
											value={editData.role}
											onValueChange={(value) =>
												setEditData({ ...editData, role: value })
											}>
											<SelectTrigger className="w-full focus:border-none">
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
											<SelectContent className="bg-white z-10 select">
												<SelectItem value="super_admin">Super Admin</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
												<SelectItem value="staff">Staff</SelectItem>
												<SelectItem value="field_officer">
													Field Officer
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Phone</p>
										<Input
											type="text"
											placeholder="Enter phone number"
											className="focus:border-none"
											value={editData.phone}
											onChange={(e) =>
												setEditData({ ...editData, phone: e.target.value })
											}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs px-4 py-2"
								onClick={closeEditModal}>
								Cancel
							</Button>
							<Button
								className="bg-secondary-1 text-white font-inter text-xs px-4 py-2"
								onClick={handleEditStaff}
								disabled={isLoading}>
								{isLoading ? "Updating Staff..." : "Update Staff"}
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
						{selectedRow?.is_active ? "suspend" : "reactivate"}{" "}
						{selectedRow ? getFullName(selectedRow) : "this staff member"}?
					</p>
					<p className="text-sm text-primary-6">
						{selectedRow?.is_active
							? "This will prevent the staff member from accessing the system."
							: "This will allow the staff member to access the system again."}
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
								: `Yes, ${selectedRow?.is_active ? "Suspend" : "Reactivate"}`}
						</Button>
					</div>
				</Modal>
			)}

			{/* Delete Staff Modal */}
			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete{" "}
						{selectedRow ? getFullName(selectedRow) : "this staff member"}?
					</p>
					<p className="text-sm text-primary-6">
						This action cannot be undone and will permanently remove the staff
						member from the system.
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
									await deleteStaff(selectedRow.id);
									closeDeleteModal();
								}
							}}>
							Yes, Delete Staff
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default RoleTable;
