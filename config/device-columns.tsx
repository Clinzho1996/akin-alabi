"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DeviceDataTable } from "./device-table";

export type Device = {
	alias: string;
	created_at: string;
	serial_number: string;
	id: string;
	serialNumber: string;

	state: string;
	deviceAlias: string;
	dateJoined: string;
	status: string;
};

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface State {
	id: string;
	name: string;
}

interface District {
	id: string;
	name: string;
	stateId: string;
}

interface Pod {
	id: string;
	name: string;
	districtId: string;
}

interface Site {
	id: string;
	name: string;
	podId: string;
}

interface Staff {
	id: string;
	name: string;
	role: string;
	siteId: string;
	first_name: string;
	last_name: string;
}
interface ApiResponse {
	data: Device;
}

const DeviceTable = () => {
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Device[]>([]);
	const [userData, setUserData] = useState<Device | null>(null);
	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

	const openModal = (row: any) => {
		setSelectedRow(row.original);
		setModalOpen(true);
	};

	const openEditModal = (row: any) => {
		setSelectedRow(row.original);
		setEditModalOpen(true);
	};

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const [states, setStates] = useState<State[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [pods, setPods] = useState<Pod[]>([]);
	const [sites, setSites] = useState<Site[]>([]);
	const [staffs, setStaffs] = useState<Staff[]>([]);

	const fetchStates = async () => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				"https://api.wowdev.com.ng/api/v1/state",
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setStates(response.data.data);

			console.log("States fetched:", response.data);
		} catch (error) {
			console.error("Error fetching states:", error);
		}
	};

	const fetchDistricts = async (stateId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/district/state/${stateId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setDistricts(response.data.data);

			console.log("Districts fetched:", response.data);
		} catch (error) {
			console.error("Error fetching districts:", error);
		}
	};

	const fetchStaffs = async () => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/user`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setStaffs(response.data.data);

			console.log("Staffs fetched:", response.data);
		} catch (error) {
			console.error("Error fetching staffs:", error);
		}
	};

	const fetchPods = async (districtId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/pod/district/${districtId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setPods(response.data.data);
		} catch (error) {
			console.error("Error fetching PODs:", error);
		}
	};

	const fetchSites = async (podId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/site/pod/${podId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setSites(response.data.data);
		} catch (error) {
			console.error("Error fetching sites:", error);
		}
	};

	useEffect(() => {
		fetchStates();
		fetchStaffs();
	}, []);

	useEffect(() => {
		if (selectedStateId) {
			fetchDistricts(selectedStateId);
			setSelectedDistrictId(null);
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedStateId]);

	useEffect(() => {
		if (selectedDistrictId) {
			fetchPods(selectedDistrictId);
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedDistrictId]);

	useEffect(() => {
		if (selectedPodId) {
			fetchSites(selectedPodId);
			setSelectedSiteId(null);
		}
	}, [selectedPodId]);

	const fetchDevice = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.wowdev.com.ng/api/v1/device/${selectedRow.id}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("device data", response?.data?.data);
			setUserData(response?.data?.data);
			setIsLoading(false);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error fetching post:",
					error.response?.data || error.message
				);
			} else {
				console.log("Unexpected error:", error);
			}
		} finally {
			setIsLoading(false);
		}
	}, [selectedRow?.id]);

	useEffect(() => {
		fetchDevice();
	}, [fetchDevice]);

	const fetchDevices = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			console.log("session", session);

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{
				status: string;
				message: string;
				data: Device[];
			}>("https://api.wowdev.com.ng/api/v1/device", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const fetchedData = response.data.data;

			console.log("Device Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				serialNumber: item.serial_number || "N/A",
				dateJoined: item.created_at,
				deviceAlias: item.alias,
				alias: item.alias,
				created_at: item.created_at,
				state: item.state,
				serial_number: item.serial_number,
				status: item.status || "not posted",
			}));

			console.log("Mapped Data:", mappedData);
			setTableData(mappedData);
		} catch (error) {
			console.error("Error fetching device data:", error);
			toast.error("Failed to fetch devices. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDevices();
	}, []);

	const deleteDevice = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(
				`https://api.wowdev.com.ng/api/v1/device/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				setTableData((prevData) =>
					prevData.filter((device) => device.id !== id)
				);
				await fetchDevices();
				closeDeleteModal();
				toast.success("Device deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting device:", error);
			toast.error("Failed to delete device. Please try again.");
		}
	};

	const handlePost = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);

		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			// Validate required fields
			if (
				!selectedStaffId ||
				!selectedStateId ||
				!selectedDistrictId ||
				!selectedPodId ||
				!selectedSiteId
			) {
				alert("Please fill all required fields.");
				return;
			}

			// Construct payload
			const payload = {
				user_id: selectedStaffId,
				device_id: selectedRow.id,
				state_id: selectedStateId,
				district_id: selectedDistrictId,
				pod_id: selectedPodId,
				sites: [selectedSiteId], // Ensure sites is an array
			};

			// Send POST request
			const response = await axios.post(
				`https://api.wowdev.com.ng/api/v1/posting`,
				payload,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			if (response.status === 200) {
				console.log("Device posted successfully");
				toast.success("Device posted successfully");
				closeModal();
				fetchDevices(); // Refresh device data
			}
		} catch (error) {
			console.error("Error posting device:", error);
			alert("An error occurred while posting the device.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnpost = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.post(
				`https://api.wowdev.com.ng/api/v1/posting/unpost/${selectedRow.id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				// Handle success
				console.log("Device unposted successfully");
				toast.success("Device unposted successfully");
				closeEditModal();
				fetchDevices();
			}
		} catch (error) {
			console.error("Error unposting device:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (rawDate: string | Date) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};

		// Ensure rawDate is valid
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;

		// Check if parsedDate is valid
		if (isNaN(parsedDate.getTime())) {
			console.error("Invalid date:", rawDate);
			return "Invalid Date"; // Or return an empty string
		}

		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const columns: ColumnDef<Device>[] = [
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
			accessorKey: "serialNumber",
			header: "Serial Number",
			cell: ({ row }) => {
				const serial = row.getValue<string>("serialNumber");

				return <span className="text-xs text-black">{serial}</span>;
			},
		},
		{
			accessorKey: "deviceAlias",
			header: "Device Alias",
			cell: ({ row }) => {
				const deviceAlias = row.getValue<string>("deviceAlias");

				return <span className="text-xs text-primary-6">{deviceAlias}</span>;
			},
		},
		{
			accessorKey: "dateJoined",
			header: "Date Joined",
			cell: ({ row }) => {
				const rawDate = row.original.dateJoined;
				const date = new Date(rawDate); //

				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			accessorKey: "status",
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
				const status = row.getValue<string>("status");
				return (
					<div className={`status ${status === "posted" ? "green" : "red"}`}>
						{status}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const actions = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/device-management/${actions.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View
							</Button>
						</Link>
						{actions.status === "unposted" ? (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openModal(row)}>
								Post
							</Button>
						) : null}

						{actions.status === "posted" ? (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openEditModal(row)}>
								Unpost
							</Button>
						) : null}

						<Button
							className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
							onClick={() => openDeleteModal(row)}>
							<IconTrash />
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
				<DeviceDataTable columns={columns} data={tableData} />
			)}

			{isEditModalOpen && (
				<Modal onClose={closeEditModal} isOpen={isEditModalOpen}>
					<p className="mt-4">
						Are you sure you want to unpost {userData?.alias} device ?
					</p>

					<p className="text-sm text-primary-6">This can&apos;t be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete gap-1"
							onClick={handleUnpost}>
							{isLoading ? "Unposting..." : "Yes, Unpost"}
						</Button>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p className="mt-4">
						Are you sure you want to delete {userData?.alias} device ?
					</p>

					<p className="text-sm text-primary-6">This can&apos;t be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete gap-1"
							onClick={() => deleteDevice(selectedRow.id)}>
							{isLoading ? "Deleting..." : "Yes, Delete"}
						</Button>
					</div>
				</Modal>
			)}

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title="Post Device"
				className="w-[500px]">
				<div className="bg-white py-5 rounded-lg transition-transform ease-in-out ">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						<p className="text-sm text-dark-1 font-inter">Basic Information</p>
						<div className="flex flex-col gap-2 mt-4">
							<p className="text-xs text-primary-6 font-inter">Staff Name</p>
							<Select onValueChange={(value) => setSelectedStaffId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Staff" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white">
									{staffs.map((staff) => (
										<SelectItem key={staff.id} value={staff.id}>
											{staff.first_name} {staff.last_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div className="flex flex-row items-center justify-between gap-5">
								<div className="w-[50%] lg:w-full">
									<p className="text-xs text-primary-6 mt-2 font-inter">
										State
									</p>
									<Select onValueChange={(value) => setSelectedStateId(value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select State" />
										</SelectTrigger>
										<SelectContent className="z-200 post bg-white">
											{states.map((state) => (
												<SelectItem key={state.id} value={state.id}>
													{state.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="w-[50%] lg:w-full">
									<p className="text-xs text-primary-6 mt-2 font-inter">
										District Name
									</p>
									<Select
										onValueChange={(value) => setSelectedDistrictId(value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select District" />
										</SelectTrigger>
										<SelectContent className="z-200 post bg-white">
											{districts.map((district) => (
												<SelectItem key={district.id} value={district.id}>
													{district.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<p className="text-xs text-primary-6 mt-2 font-inter">POD</p>
							<Select onValueChange={(value) => setSelectedPodId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select POD" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white">
									{pods.map((pod) => (
										<SelectItem key={pod.id} value={pod.id}>
											{pod.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<p className="text-xs text-primary-6 mt-2 font-inter">
								Site Name
							</p>
							<Select onValueChange={(value) => setSelectedSiteId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Site" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white">
									{sites.map((site) => (
										<SelectItem key={site.id} value={site.id}>
											{site.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeModal}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={handlePost}
								disabled={isLoading}>
								{isLoading ? "Posting..." : "Post"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default DeviceTable;
