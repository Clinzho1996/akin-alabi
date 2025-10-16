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
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EndUserDataTable } from "./end-user-table";

// This type is used to define the shape of our data.
export type EndUser = {
	id: string;
	membership_code: string;
	first_name: string;
	last_name: string;
	middle_name: string | null;
	dob: string;
	gender: string;
	email: string;
	phone: string;
	residential_address: string;
	residential_state: string;
	residential_lga: string;
	residential_city: string;
	state_of_origin: string;
	lga_of_origin: string;
	nationality: string;
	identity_type: string;
	identity_number: string;
	association: string | null;
	education_level: string | null;
	employment_status: string;
	occupation: string;
	pic: string | null;
	finger_bio: string | null;
	facial_bio: string | null;
	finger_bio_encoding: string | null;
	facial_bio_encoding: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

interface ApiResponse {
	status: string;
	message: string;
	data: EndUser[];
	pagination?: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
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
	gender: string;
	dob: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const EndUserTable = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<EndUser | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<EndUser[]>([]);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		id: "",
		first_name: "",
		last_name: "",
		email: "",
		gender: "male",
		dob: "",
	});
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 1,
	});

	const openEditModal = (row: Row<EndUser>) => {
		const user = row.original;
		setEditData({
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			gender: user.gender,
			dob: user.dob ? user.dob.split("T")[0] : "",
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const handleEditUser = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/beneficiary/${editData.id}`,
				{
					first_name: editData.first_name,
					last_name: editData.last_name,
					email: editData.email,
					gender: editData.gender,
					dob: editData.dob,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("User updated successfully.");
				fetchUsers();
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Failed to update user. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<EndUser>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

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

			const response = await axios.get<ApiResponse>(`${BASE_URL}/beneficiary`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				const formattedData = response.data.data.map((user) => ({
					...user,
					id: user.id,
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

	const deleteUser = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/beneficiary`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				data: { id },
			});

			if (response.data.status === "success") {
				setTableData((prevData) => prevData.filter((user) => user.id !== id));
				toast.success("User deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Failed to delete user. Please try again.");
		}
	};

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

	const getFullName = (user: EndUser) => {
		return `${user.first_name} ${
			user.middle_name ? user.middle_name + " " : ""
		}${user.last_name}`.trim();
	};

	const getStatus = (user: EndUser) => {
		return user.is_active ? "active" : "inactive";
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
			accessorKey: "membership_code",
			header: "User ID",
			cell: ({ row }) => {
				const membershipCode = row.getValue<string>("membership_code") || "N/A";
				return <span className="text-xs text-primary-6">{membershipCode}</span>;
			},
		},
		{
			accessorKey: "first_name",
			header: "Full Name",
			cell: ({ row }) => {
				const user = row.original;
				const fullName = getFullName(user);
				const pic = user.pic;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src={pic || "/images/avatar.png"}
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
				const email = row.getValue<string>("email");
				return <span className="text-xs text-primary-6">{email}</span>;
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
				const user = row.original;
				const status = getStatus(user);
				return (
					<div className={`status ${status === "active" ? "green" : "red"}`}>
						{status}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Joined Date",
			cell: ({ row }) => {
				const date = row.getValue<string>("created_at");
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const user = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-3">
						<Link href={`/beneficiary-management/${user.id}`}>
							<Button className="border border-[#E8E8E8]">View Details</Button>
						</Link>

						<Button
							className="border border-[#E8E8E8]"
							onClick={() => openEditModal(row)}>
							Edit
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
					<EndUserDataTable columns={columns} data={tableData} />
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

			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit User">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out form modal">
						<div className="mt-3 pt-2">
							<div className="flex flex-col gap-2">
								<p className="text-xs text-primary-6">First Name</p>
								<Input
									type="text"
									placeholder="Enter First Name"
									className="focus:border-none mt-2"
									value={editData.first_name}
									onChange={(e) =>
										setEditData({ ...editData, first_name: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Last Name</p>
								<Input
									type="text"
									placeholder="Enter Last Name"
									className="focus:border-none mt-2"
									value={editData.last_name}
									onChange={(e) =>
										setEditData({ ...editData, last_name: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Email Address</p>
								<Input
									type="email"
									placeholder="Enter Email Address"
									className="focus:border-none mt-2"
									value={editData.email}
									onChange={(e) =>
										setEditData({ ...editData, email: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Date of Birth</p>
								<Input
									type="date"
									placeholder="Enter Date of Birth"
									className="focus:border-none mt-2"
									value={editData.dob}
									onChange={(e) =>
										setEditData({ ...editData, dob: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Gender</p>
								<Select
									value={editData.gender}
									onValueChange={(value) =>
										setEditData({ ...editData, gender: value })
									}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent className="bg-white z-10 select text-gray-300">
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
							<div className="flex flex-row justify-end items-center gap-3 font-inter">
								<Button
									className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
									onClick={closeEditModal}>
									Cancel
								</Button>
								<Button
									className="bg-primary-1 text-white font-inter text-xs"
									onClick={handleEditUser}
									disabled={isLoading}>
									{isLoading ? "Updating User..." : "Update User"}
								</Button>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete{" "}
						{selectedRow ? getFullName(selectedRow) : "this user"}'s account?
					</p>
					<p className="text-sm text-primary-6">This can't be undone</p>
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
									await deleteUser(selectedRow.id);
									closeDeleteModal();
								}
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default EndUserTable;
