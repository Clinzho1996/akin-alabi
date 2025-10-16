import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Benefit {
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
}

interface EventData {
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
	attendances: any[];
}

interface ApiResponse {
	status: string;
	message: string;
	data: EventData;
}

interface EditEventData {
	name: string;
	start_date: string;
	start_time: string;
	end_date: string;
	end_time: string;
	location: string;
	is_active: boolean;
}

function Overview() {
	const { id } = useParams();
	const router = useRouter();
	const [eventData, setEventData] = useState<EventData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Edit form state
	const [editForm, setEditForm] = useState<EditEventData>({
		name: "",
		start_date: "",
		start_time: "",
		end_date: "",
		end_time: "",
		location: "",
		is_active: true,
	});

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
				// Pre-populate edit form with current data
				setEditForm({
					name: response.data.data.name,
					start_date: response.data.data.start_date,
					start_time: response.data.data.start_time,
					end_date: response.data.data.end_date,
					end_time: response.data.data.end_time,
					location: response.data.data.location,
					is_active: response.data.data.is_active,
				});
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
		if (id) {
			fetchEventData();
		}
	}, [id]);

	const openEditModal = () => {
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const openDeleteModal = () => {
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const handleEditEvent = async () => {
		try {
			setIsSubmitting(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				toast.error("No access token found. Please log in again.");
				return;
			}

			if (!id) {
				toast.error("No event ID provided.");
				return;
			}

			// Validate required fields
			if (
				!editForm.name ||
				!editForm.start_date ||
				!editForm.end_date ||
				!editForm.location
			) {
				toast.error("Please fill in all required fields.");
				return;
			}

			const response = await axios.put(`${BASE_URL}/event/${id}`, editForm, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				toast.success("Event updated successfully!");
				closeEditModal();
				// Refresh the event data
				fetchEventData();
			}
		} catch (error) {
			console.error("Error updating event:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to update event. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteEvent = async () => {
		try {
			setIsSubmitting(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				toast.error("No access token found. Please log in again.");
				return;
			}

			if (!id) {
				toast.error("No event ID provided.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/event/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				toast.success("Event deleted successfully!");
				closeDeleteModal();
				// Redirect to events list or handle navigation as needed
				router.push("/event-management");
			}
		} catch (error) {
			console.error("Error deleting event:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to delete event. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString)
			.toLocaleDateString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.replace(/\//g, " - ");
	};

	const getTotalBenefits = () => {
		if (!eventData?.benefits) return "No benefits";
		return eventData.benefits.length > 0
			? eventData.benefits.map((benefit) => benefit.name).join(", ")
			: "No benefits";
	};

	if (isLoading) {
		return (
			<div className="border rounded-lg p-2">
				<div className="border bg-[#F6F8FA] p-2 rounded-lg">
					<div className="flex justify-center items-center p-6">
						<p className="text-sm text-dark-1">Loading event data...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!eventData) {
		return (
			<div className="border rounded-lg p-2">
				<div className="border bg-[#F6F8FA] p-2 rounded-lg">
					<div className="flex justify-center items-center p-6">
						<p className="text-sm text-dark-1">No event data found.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Edit Event Modal */}
			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Event">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out w-[650px] form-big">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								{/* Event Name */}
								<div className="w-full flex flex-col gap-2">
									<p className="text-xs text-primary-6">Event Name *</p>
									<Input
										type="text"
										placeholder="Enter Event Name"
										className="focus:border-none"
										value={editForm.name}
										onChange={(e) =>
											setEditForm({
												...editForm,
												name: e.target.value,
											})
										}
									/>
								</div>

								{/* Location */}
								<div className="w-full flex flex-col gap-2">
									<p className="text-xs text-primary-6">Location *</p>
									<Input
										type="text"
										placeholder="Enter Location"
										className="focus:border-none"
										value={editForm.location}
										onChange={(e) =>
											setEditForm({
												...editForm,
												location: e.target.value,
											})
										}
									/>
								</div>

								{/* Start Date & End Date */}
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Date *</p>
										<Input
											type="date"
											className="focus:border-none"
											value={editForm.start_date}
											onChange={(e) =>
												setEditForm({
													...editForm,
													start_date: e.target.value,
												})
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Date *</p>
										<Input
											type="date"
											className="focus:border-none"
											value={editForm.end_date}
											onChange={(e) =>
												setEditForm({
													...editForm,
													end_date: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{/* Start Time & End Time */}
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Time</p>
										<Input
											type="time"
											className="focus:border-none"
											value={editForm.start_time}
											onChange={(e) =>
												setEditForm({
													...editForm,
													start_time: e.target.value,
												})
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Time</p>
										<Input
											type="time"
											className="focus:border-none"
											value={editForm.end_time}
											onChange={(e) =>
												setEditForm({
													...editForm,
													end_time: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{/* Status */}
								<div className="w-full flex flex-col gap-2">
									<p className="text-xs text-primary-6">Status</p>
									<Select
										value={editForm.is_active ? "active" : "inactive"}
										onValueChange={(value) =>
											setEditForm({
												...editForm,
												is_active: value === "active",
											})
										}>
										<SelectTrigger className="w-full focus:border-none">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent className="bg-white z-10 select">
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="inactive">Inactive</SelectItem>
										</SelectContent>
									</Select>
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
								disabled={isSubmitting}>
								{isSubmitting ? "Updating Event..." : "Update Event"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{/* Delete Confirmation Modal */}
			{isDeleteModalOpen && (
				<Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
					<p>Are you sure you want to delete "{eventData?.name}"?</p>
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
							onClick={handleDeleteEvent}>
							{isSubmitting ? "Deleting..." : "Delete, Event"}
						</Button>
					</div>
				</Modal>
			)}

			<div className="border rounded-lg p-2">
				<div className="border bg-[#F6F8FA] p-2 rounded-lg">
					<div>
						<div className="flex flex-row justify-between items-center p-3">
							<p>Basic Information</p>
							<div className="flex flex-row justify-end items-center gap-2">
								<Button
									className="border bg-white hover:bg-gray-50"
									onClick={openDeleteModal}>
									<IconTrash />
								</Button>
								<Button
									className="border bg-secondary-1 text-white "
									onClick={openEditModal}>
									Edit Event
								</Button>
							</div>
						</div>

						<div className="bg-white p-6 shadow-lg rounded-lg mt-1">
							<div className="flex flex-col gap-5">
								<div className="flex flex-row justify-start gap-5 items-start">
									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Event Name</p>
										<p className="text-sm text-dark-1">{eventData.name}</p>
									</div>

									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Location</p>
										<p className="text-sm text-dark-1">{eventData.location}</p>
									</div>
								</div>

								<div className="flex flex-row justify-start gap-5 items-start">
									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Benefits</p>
										<p className="text-sm text-dark-1">{getTotalBenefits()}</p>
									</div>

									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Start Date</p>
										<p className="text-sm text-dark-1">
											{formatDate(eventData.start_date)}
										</p>
									</div>

									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">End Date</p>
										<p className="text-sm text-dark-1">
											{formatDate(eventData.end_date)}
										</p>
									</div>
								</div>

								{/* Additional event details */}
								<div className="flex flex-row justify-start gap-5 items-start">
									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Start Time</p>
										<p className="text-sm text-dark-1">
											{eventData.start_time}
										</p>
									</div>

									<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">End Time</p>
										<p className="text-sm text-dark-1">{eventData.end_time}</p>
									</div>
								</div>

								<div className="flex flex-row justify-start gap-5 items-start">
									<div className="flex flex-row justify-between items-center gap-2 w-full border rounded-lg p-3">
										<p className="text-xs text-[#6B7280]">Status</p>
										<p className="text-sm text-dark-1">
											{eventData.is_active ? "Active" : "Inactive"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Overview;
