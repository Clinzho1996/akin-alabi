"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EventDataTable } from "./event-table";

// This type is used to define the shape of our data.
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
	benefits: {
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
	}[];
};

interface ApiResponse {
	status: string;
	message: string;
	data: Event[];
	pagination: {
		current_page: number;
		next_page_url: string | null;
		prev_page_url: string | null;
		total: number;
		per_page: number;
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
	location: string;
	start_date: string;
	end_date: string;
	start_time: string;
	end_time: string;
	benefit_ids: string[]; // Changed from benefits to benefit_ids
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EventTable = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Event[]>([]);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isCloseEventModalOpen, setCloseEventModalOpen] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		id: "",
		name: "",
		location: "",
		start_date: "",
		end_date: "",
		start_time: "",
		end_time: "",
		benefit_ids: [], // Changed from benefits to benefit_ids
	});
	const [newBenefit, setNewBenefit] = useState("");
	const [availableBenefits, setAvailableBenefits] = useState<any[]>([]); // Store available benefits
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10, // Changed from 50 to 10 for standard pagination
		total: 0,
		pages: 1,
		hasNextPage: false,
		hasPrevPage: false,
	});

	// Fetch available benefits for selection
	const fetchAvailableBenefits = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) return;

			const response = await axios.get(`${BASE_URL}/benefit`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setAvailableBenefits(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching benefits:", error);
		}
	};

	const openEditModal = (row: Row<Event>) => {
		const event = row.original;
		setEditData({
			id: event.id,
			name: event.name,
			location: event.location,
			start_date: event.start_date,
			end_date: event.end_date,
			start_time: event.start_time.slice(0, 5),
			end_time: event.end_time.slice(0, 5),
			benefit_ids: event.benefits.map((benefit) => benefit.id), // Store benefit IDs instead of names
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const openCloseEventModal = (row: Row<Event>) => {
		setSelectedRow(row.original);
		setCloseEventModalOpen(true);
	};

	const closeCloseEventModal = () => {
		setCloseEventModalOpen(false);
	};

	const handleEditEvent = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/event/${editData.id}`,
				{
					name: editData.name,
					location: editData.location,
					start_date: editData.start_date,
					end_date: editData.end_date,
					start_time: editData.start_time,
					end_time: editData.end_time,
					benefit_ids: editData.benefit_ids, // Send benefit IDs array
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (response.data.status === "success") {
				toast.success("Event updated successfully.");
				fetchEvents(pagination.page, pagination.limit);
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating event:", error);
			toast.error("Failed to update event. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCloseEvent = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken || !selectedRow) {
				console.error("No access token or event selected.");
				return;
			}

			const response = await axios.patch(
				`${BASE_URL}/event/close/${selectedRow.id}`,
				{},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (response.data.status === "success") {
				toast.success("Event closed successfully.");
				fetchEvents(pagination.page, pagination.limit);
				closeCloseEventModal();
			}
		} catch (error) {
			console.error("Error closing event:", error);
			toast.error("Failed to close event. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<Event>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const fetchEvents = async (page = 1, limit = 10) => {
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
				`${BASE_URL}/event?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			console.log("Events API Response:", response.data);

			if (response.data.status === "success") {
				setTableData(response.data.data);

				if (response.data.pagination) {
					const paginationData = response.data.pagination;
					const totalPages = Math.ceil(
						paginationData.total / paginationData.per_page,
					);

					setPagination({
						page: paginationData.current_page,
						limit: paginationData.per_page,
						total: paginationData.total,
						pages: totalPages,
						hasNextPage: !!paginationData.next_page_url,
						hasPrevPage: !!paginationData.prev_page_url,
					});
				}
			}
		} catch (error) {
			console.error("Error fetching events data:", error);
			toast.error("Failed to fetch events.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents(1, 10);
		fetchAvailableBenefits(); // Fetch available benefits when component mounts
	}, []);

	const deleteEvent = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/event/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				// Refresh current page instead of filtering locally
				fetchEvents(pagination.page, pagination.limit);
				toast.success("Event deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting event:", error);
			toast.error("Failed to delete event. Please try again.");
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

	const formatTime = (timeString: string) => {
		if (!timeString) return "N/A";
		return timeString.slice(0, 5);
	};

	const getTotalBeneficiaries = (event: Event) => {
		return Math.floor(Math.random() * 100) + 1;
	};

	const getTotalAmount = (event: Event) => {
		const monetaryBenefits = event.benefits.filter(
			(benefit) => benefit.type === "monetary",
		);
		let total = 0;

		monetaryBenefits.forEach((benefit) => {
			const amountMatch = benefit.name.match(/\d+/);
			if (amountMatch) {
				total += parseInt(amountMatch[0]);
			}
		});

		return total > 0 ? `NGN ${total.toLocaleString()}` : "No monetary benefits";
	};

	const addBenefit = (benefitId: string) => {
		if (!editData.benefit_ids.includes(benefitId)) {
			setEditData({
				...editData,
				benefit_ids: [...editData.benefit_ids, benefitId],
			});
		}
	};

	const removeBenefit = (benefitIdToRemove: string) => {
		setEditData({
			...editData,
			benefit_ids: editData.benefit_ids.filter(
				(benefitId) => benefitId !== benefitIdToRemove,
			),
		});
	};

	const getBenefitName = (benefitId: string) => {
		const benefit = availableBenefits.find((b) => b.id === benefitId);
		return benefit ? benefit.name : "Unknown Benefit";
	};

	const handlePaginationChange = (pageIndex: number, pageSize: number) => {
		// Convert 0-based index to 1-based for API
		console.log("Pagination change:", pageIndex + 1, pageSize);
		fetchEvents(pageIndex + 1, pageSize);
	};

	const columns: ColumnDef<Event>[] = [
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
			header: "Event ID",
			cell: ({ row }) => {
				const eventId = row.original.id;
				return (
					<span className="text-xs text-primary-6">
						{eventId.slice(0, 8)}...
					</span>
				);
			},
		},
		{
			accessorKey: "name",
			header: "Event Name",
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
			id: "location",
			header: "Location",
			cell: ({ row }) => {
				const location = row.original.location;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<span className="text-xs text-primary-6 capitalize">
							{location}
						</span>
					</div>
				);
			},
		},
		{
			id: "amount",
			header: "Amount / Package",
			cell: ({ row }) => {
				const amount = getTotalAmount(row.original);
				return <span className="text-xs text-primary-6">{amount}</span>;
			},
		},
		{
			accessorKey: "start_date",
			header: "Date",
			cell: ({ row }) => {
				const startDate = row.original.start_date;
				const endDate = row.original.end_date;
				return (
					<span className="text-xs text-primary-6">
						{formatDate(startDate)} - {formatDate(endDate)}
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
						{isActive ? "Active" : "Closed"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const event = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-3">
						<Link href={`/event-management/${event.id}`}>
							<Button className="border border-[#E8E8E8]">View</Button>{" "}
						</Link>

						<Button
							className="border border-[#E8E8E8]"
							onClick={() => openEditModal(row)}>
							Edit
						</Button>

						{event.is_active && (
							<Button
								className="border border-[#E8E8E8] bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
								onClick={() => openCloseEventModal(row)}>
								Close
							</Button>
						)}

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
					<EventDataTable
						columns={columns}
						data={tableData}
						onRefresh={() => fetchEvents(pagination.page, pagination.limit)}
						onPaginationChange={handlePaginationChange}
						totalItems={pagination.total}
						currentPage={pagination.page - 1}
						totalPages={pagination.pages}
						pageSize={pagination.limit}
						hasNextPage={pagination.hasNextPage}
						hasPrevPage={pagination.hasPrevPage}
					/>
				</>
			)}

			{/* Edit Event Modal */}
			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Event">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out w-[650px] form-big">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Event Name</p>
										<Input
											type="text"
											placeholder="Enter Event Name"
											className="focus:border-none"
											value={editData.name}
											onChange={(e) =>
												setEditData({ ...editData, name: e.target.value })
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Location</p>
										<Input
											type="text"
											placeholder="Enter Location"
											className="focus:border-none"
											value={editData.location}
											onChange={(e) =>
												setEditData({ ...editData, location: e.target.value })
											}
										/>
									</div>
								</div>
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Date</p>
										<Input
											type="date"
											className="focus:border-none"
											value={editData.start_date}
											onChange={(e) =>
												setEditData({ ...editData, start_date: e.target.value })
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Date</p>
										<Input
											type="date"
											className="focus:border-none"
											value={editData.end_date}
											onChange={(e) =>
												setEditData({ ...editData, end_date: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Time</p>
										<Input
											type="time"
											className="focus:border-none"
											value={editData.start_time}
											onChange={(e) =>
												setEditData({ ...editData, start_time: e.target.value })
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Time</p>
										<Input
											type="time"
											className="focus:border-none"
											value={editData.end_time}
											onChange={(e) =>
												setEditData({ ...editData, end_time: e.target.value })
											}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">
											Benefits (optional)
										</p>
										<div className="flex gap-2">
											<select
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												value={newBenefit}
												onChange={(e) => {
													if (e.target.value) {
														addBenefit(e.target.value);
														setNewBenefit("");
													}
												}}>
												<option value="">Select a benefit</option>
												{availableBenefits.map((benefit) => (
													<option key={benefit.id} value={benefit.id}>
														{benefit.name} ({benefit.type})
													</option>
												))}
											</select>
										</div>
										<div className="flex flex-wrap gap-2 mt-2">
											{editData.benefit_ids.map((benefitId, index) => (
												<div
													key={index}
													className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
													<span className="text-xs">
														{getBenefitName(benefitId)}
													</span>
													<button
														type="button"
														onClick={() => removeBenefit(benefitId)}
														className="text-red-500 hover:text-red-700">
														×
													</button>
												</div>
											))}
										</div>
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
								onClick={handleEditEvent}
								disabled={isLoading}>
								{isLoading ? "Updating Event..." : "Update Event"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{/* Close Event Modal */}
			{isCloseEventModalOpen && (
				<Modal onClose={closeCloseEventModal} isOpen={isCloseEventModalOpen}>
					<p>Are you sure you want to close the event "{selectedRow?.name}"?</p>
					<p className="text-sm text-primary-6">
						This will mark the event as completed and prevent further
						attendance.
					</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeCloseEventModal}>
							Cancel
						</Button>
						<Button
							className="bg-yellow-700 text-white font-inter text-xs"
							onClick={handleCloseEvent}
							disabled={isLoading}>
							{isLoading ? "Closing Event..." : "Yes, Close Event"}
						</Button>
					</div>
				</Modal>
			)}

			{/* Delete Event Modal */}
			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete the event "{selectedRow?.name}"?
					</p>
					<p className="text-sm text-primary-6">
						This action cannot be undone and will remove all event data.
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
									await deleteEvent(selectedRow.id);
									closeDeleteModal();
								}
							}}>
							Yes, Delete Event
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default EventTable;
