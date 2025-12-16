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
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AttendanceDataTable } from "./attendance-table";

// Constants
const BASE_URL = "https://akin.wowdev.com.ng/api/v1";

// Types based on the actual API response
export type User = {
	id: string;
	first_name: string;
	last_name: string;
	staff_code: string;
	email: string;
	phone: string;
	role: string;
	is_active: boolean;
	last_logged_in: string | null;
	created_at: string;
	updated_at: string;
};

export type Beneficiary = {
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
	residential_state: string | null;
	residential_lga: string | null;
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
	facial_bio: string;
	finger_bio_encoding: string | null;
	facial_bio_encoding: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type Attendance = {
	id: string;
	user_id: string;
	event_id: string;
	beneficiary_id: string;
	benefit_id: string | null;
	time_in: string;
	time_out: string | null;
	created_at: string;
	updated_at: string;
	user: User;
	beneficiary: Beneficiary;
	benefit: any | null;
};

export type Benefit = {
	id: string;
	name: string;
	type: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	pivot: {
		event_id: string;
		benefit_id: string;
	};
};

export type Event = {
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
	benefits: Benefit[];
	attendances: Attendance[];
};

interface ApiResponse {
	status: string;
	message: string;
	data: Event;
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
	membership_code: string;
	gender: string;
}

const AttendanceTable = () => {
	const { id } = useParams() as { id: string };
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Attendance | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [eventData, setEventData] = useState<Event | null>(null);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		id: "",
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		membership_code: "",
		gender: "male",
	});

	const openEditModal = (row: Row<Attendance>) => {
		const attendance = row.original;
		const beneficiary = attendance.beneficiary;

		setEditData({
			id: attendance.id,
			first_name: beneficiary.first_name || "",
			last_name: beneficiary.last_name || "",
			email: beneficiary.email || "",
			phone: beneficiary.phone || "",
			membership_code: beneficiary.membership_code || "",
			gender: beneficiary.gender || "male",
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const handleEditAttendance = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("Authentication required");
				return;
			}

			// Update the beneficiary record
			const response = await axios.put(
				`${BASE_URL}/beneficiary/${editData.id}`,
				{
					first_name: editData.first_name,
					last_name: editData.last_name,
					email: editData.email,
					phone: editData.phone,
					membership_code: editData.membership_code,
					gender: editData.gender,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				toast.success("Attendance record updated successfully.");
				fetchEventData(); // Refresh data
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating attendance:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to update attendance record. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<Attendance>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const fetchEventData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				return;
			}

			if (!id) {
				console.error("No event ID provided.");
				toast.error("No event ID provided.");
				return;
			}

			const response = await axios.get<ApiResponse>(`${BASE_URL}/event/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setEventData(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching event data:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to fetch event data. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchEventData();
	}, []);

	const deleteAttendance = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/attendance/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.status === 200) {
				setEventData((prev) =>
					prev
						? {
								...prev,
								attendances: prev.attendances.filter((att) => att.id !== id),
						  }
						: null
				);
				toast.success("Attendance record deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting attendance:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to delete attendance record. Please try again"
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
	};

	const formatTime = (timeString: string | null) => {
		if (!timeString) return "N/A";

		try {
			// Handle both formats: "2025-10-29 01:15:45" and "09:00:00"
			if (timeString.includes(" ")) {
				// Format: "2025-10-29 01:15:45"
				const date = new Date(timeString.replace(" ", "T") + "Z");
				return date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
					timeZone: "UTC",
				});
			} else {
				// Format: "09:00:00"
				const [hours, minutes] = timeString.split(":");
				const hour = parseInt(hours, 10);
				const ampm = hour >= 12 ? "PM" : "AM";
				const hour12 = hour % 12 || 12;
				return `${hour12}:${minutes} ${ampm}`;
			}
		} catch (error) {
			return timeString;
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getAttendanceStatus = (timeOut: string | null) => {
		return timeOut ? "Checked Out" : "Present";
	};

	const columns: ColumnDef<Attendance>[] = [
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
			accessorKey: "beneficiary.membership_code",
			header: "Membership Code",
			cell: ({ row }) => {
				const code = row.original.beneficiary?.membership_code || "N/A";
				return <span className="text-xs text-primary-6">{code}</span>;
			},
		},
		{
			id: "full_name",
			header: "Full Name",
			cell: ({ row }) => {
				const beneficiary = row.original.beneficiary;
				const fullName = `${beneficiary?.first_name} ${beneficiary?.last_name}`;
				const pic = beneficiary?.pic;
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
			accessorKey: "beneficiary.email",
			header: "Email",
			cell: ({ row }) => {
				const email = row.original.beneficiary?.email || "N/A";
				return <span className="text-xs text-primary-6">{email}</span>;
			},
		},
		{
			id: "operator",
			header: "Field Officer",
			cell: ({ row }) => {
				const user = row.original.user;
				const officerName = `${user.first_name} ${user.last_name}`;
				const staffCode = user.staff_code;
				return (
					<span className="text-xs text-black capitalize flex gap-1">
						<p className="text-primary-6">({staffCode})</p>
						{officerName}
					</span>
				);
			},
		},
		{
			id: "time_in_out",
			header: "Time In + Out",
			cell: ({ row }) => {
				const timeIn = formatTime(row.original.time_in);
				const timeOut = formatTime(row.original.time_out);
				return (
					<span className="text-xs text-black">
						{timeIn} - {timeOut}
					</span>
				);
			},
		},
		{
			id: "status",
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
				const status = getAttendanceStatus(row.original.time_out);
				return (
					<div className={`status ${status === "Present" ? "green" : "blue"}`}>
						{status}
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
					<AttendanceDataTable
						columns={columns}
						data={eventData?.attendances || []}
					/>
				</>
			)}

			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Beneficiary Information">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out w-[650px] form-big">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">First Name</p>
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
										<p className="text-xs text-primary-6">Last Name</p>
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
										<p className="text-xs text-primary-6">Membership Code</p>
										<Input
											type="text"
											placeholder="Enter membership code"
											className="focus:border-none"
											value={editData.membership_code}
											onChange={(e) =>
												setEditData({
													...editData,
													membership_code: e.target.value,
												})
											}
										/>
									</div>

									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Gender</p>
										<Select
											value={editData.gender}
											onValueChange={(value) =>
												setEditData({ ...editData, gender: value })
											}>
											<SelectTrigger className="w-full focus:border-none ">
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent className="bg-white z-10 select">
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Email Address</p>
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
										<p className="text-xs text-primary-6">Phone Number</p>
										<Input
											type="tel"
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
								onClick={handleEditAttendance}
								disabled={isLoading}>
								{isLoading ? "Updating..." : "Update Record"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete attendance record for{" "}
						{selectedRow?.beneficiary?.first_name}{" "}
						{selectedRow?.beneficiary?.last_name}?
					</p>
					<p className="text-sm text-primary-6">This action cannot be undone</p>
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
									await deleteAttendance(selectedRow.id);
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

export default AttendanceTable;
