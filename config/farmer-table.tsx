"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	RowSelectionState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	IconCloudDownload,
	IconFileExport,
	IconFileImport,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Farmer } from "./farmer-columns";
import { Group } from "./group-columns";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
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

export function FarmerDataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [featuredImage, setFeaturedImage] = useState<File | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [isImportModalOpen, setImportModalOpen] = useState(false);
	const [tableData, setTableData] = useState<TData[]>(data);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [isAddingFarmer, setIsAddingFarmer] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isImporting, setIsImporting] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [gender, setGender] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [oafId, setOafId] = useState<string>("");
	const [otherName, setOtherName] = useState<string>("");
	const [dob, setDob] = useState<string>("");
	const [states, setStates] = useState<State[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [pods, setPods] = useState<Pod[]>([]);
	const [sites, setSites] = useState<Site[]>([]);

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

	const fetchGroups = async (groupId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/group/site/${groupId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setGroups(response.data.data);
			console.log("Group data", response.data.data);
		} catch (error) {
			console.error("Error fetching Groups:", error);
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

	const handleExport = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;
			if (!accessToken) throw new Error("No access token");

			let allFarmers: Farmer[] = [];
			let currentPage = 1;
			let hasMorePages = true;

			// Fetch all pages sequentially
			while (hasMorePages) {
				const response = await axios.get<{
					data: Farmer[];
					pagination: {
						current_page: number;
						total: number;
						last_page: number;
						next_page_url: string | null;
					};
				}>("https://api.wowdev.com.ng/api/v1/farmer", {
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
					params: {
						page: currentPage,
						per_page: 30000, // Use larger page size to reduce requests
					},
				});

				const fetchedData = response.data.data;
				allFarmers = [...allFarmers, ...fetchedData];

				// Check if there are more pages
				hasMorePages = currentPage < response.data.pagination.last_page;
				currentPage++;

				// Safety break to prevent infinite loops
				if (currentPage > 30000) break;
			}

			console.log(`Total farmers fetched: ${allFarmers.length}`);

			// Filter farmers to only include those with facial biometrics
			const farmersWithFacialBio = allFarmers.filter(
				(farmer) =>
					farmer.facial_bio !== null &&
					farmer.facial_bio !== "" &&
					farmer.facial_bio !== undefined
			);

			console.log(`Farmers with facial bio: ${farmersWithFacialBio.length}`);

			// If no farmers with facial biometrics found
			if (farmersWithFacialBio.length === 0) {
				toast.info("No farmers with facial biometrics found to export");
				return;
			}

			// Define the columns you want to export (based on your visible table columns)
			const exportColumns = [
				{ key: "oaf_id", header: "OAF-ID" },
				{ key: "first_name", header: "First Name" },
				{ key: "last_name", header: "Last Name" },
				{ key: "group.name", header: "Group Name" },
				{ key: "site.name", header: "Site Name" },
				{ key: "pod.name", header: "Pod Name" },
				{ key: "created_at", header: "Date Joined" },
				{ key: "biometricStatus", header: "Biometric Status" },
			];

			// Transform data to only include the columns we want
			const exportData = farmersWithFacialBio.map((farmer) => {
				const exportRow: any = {};

				exportColumns.forEach((col) => {
					if (col.key === "biometricStatus") {
						// Calculate biometric status for export
						const { facial_bio, finger_bio } = farmer;
						exportRow[col.header] =
							facial_bio && finger_bio
								? "Both"
								: facial_bio
								? "Facial"
								: finger_bio
								? "Fingerprint"
								: "None";
					} else if (col.key.includes(".")) {
						// Handle nested properties like group.name, site.name, etc.
						const keys = col.key.split(".");
						let value: any = farmer;
						for (const key of keys) {
							value = value?.[key];
							if (value === undefined) break;
						}
						exportRow[col.header] = value || "N/A";
					} else {
						// Handle direct properties
						exportRow[col.header] = (farmer as any)[col.key] || "N/A";
					}
				});

				return exportRow;
			});

			// Convert filtered data to worksheet
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(
				workbook,
				worksheet,
				"Farmers with Facial Bio"
			);

			// Generate and download the file
			const binaryString = XLSX.write(workbook, {
				bookType: "xlsx",
				type: "binary",
			});
			const blob = new Blob([s2ab(binaryString)], {
				type: "application/octet-stream",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "farmers_with_facial_biometrics.xlsx";
			link.click();
			URL.revokeObjectURL(url);

			toast.success(
				`Exported ${farmersWithFacialBio.length} farmers with facial biometrics`
			);
		} catch (error) {
			console.error("Error exporting farmers with facial biometrics:", error);
			toast.error("Failed to export farmers with facial biometrics");
		} finally {
			setIsLoading(false);
		}
	};

	const s2ab = (s: string) => {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
		return buf;
	};

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

	useEffect(() => {
		if (selectedSiteId) {
			fetchGroups(selectedSiteId);
			setSelectedGroupId(null);
		}
	}, [selectedSiteId]);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

	const openImportModal = () => setImportModalOpen(true);
	const closeImportModal = () => setImportModalOpen(false);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setFeaturedImage(file);

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(null);
		}
	};

	useEffect(() => {
		setTableData(data);
	}, [data]);

	const handleAddFarmer = async () => {
		setIsAddingFarmer(true);
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const formData = new FormData();
			formData.append("first_name", name.split(" ")[0]);
			formData.append("last_name", name.split(" ")[1] || "");
			formData.append("other_name", otherName);
			formData.append("gender", gender);
			formData.append("oaf_id", oafId);
			formData.append("dob", dob);
			formData.append("phone_number", phoneNumber);
			formData.append("email", email);
			formData.append("group_id", selectedGroupId || "");
			formData.append("site_id", selectedSiteId || "");
			formData.append("pod_id", selectedPodId || "");
			formData.append("district_id", selectedDistrictId || "");
			formData.append("state_id", selectedStateId || "");

			if (featuredImage) {
				formData.append("pic", featuredImage);
			}

			const response = await axios.post(
				"https://api.wowdev.com.ng/api/v1/farmer",
				formData,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("Farmer added successfully:", response.data);

			toast.success("Farmer added successfully");

			closeModal();
		} catch (error) {
			console.error("Error adding farmer:", error);
		} finally {
			setIsAddingFarmer(false);
		}
	};

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		globalFilterFn: "includesString",
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	const handleImportFileChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.name.endsWith(".csv")) {
			toast.error("Please upload a CSV file");
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size should not exceed 5MB");
			return;
		}

		setSelectedFile(file);
		setUploadProgress(0);
	};

	useEffect(() => {
		fetchStates();
	}, []);

	const handleImportSubmit = async () => {
		if (!selectedFile) return;
		if (!selectedStateId) {
			toast.error("Please select a state");
			return;
		}

		setIsImporting(true);
		setUploadProgress(0);

		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				throw new Error("No access token found");
			}

			const formData = new FormData();
			formData.append("csv_file", selectedFile);
			formData.append("state_id", selectedStateId);

			const response = await axios.post(
				"https://api.wowdev.com.ng/api/v1/farmer/import/data/extended",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${accessToken}`,
					},
					onUploadProgress: (progressEvent) => {
						if (progressEvent.total) {
							const progress = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
							setUploadProgress(progress);
						}
					},
				}
			);

			toast.success("Farmers imported successfully!");

			closeImportModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response && error.response.data) {
					toast.error(error?.response?.data?.message);
					console.log("Error response:", error.response.data);
				} else {
					toast.error("An error occurred.");
					console.log("Error response: An error occurred.");
				}
			} else {
				toast.error("Something went wrong. Please try again.");
				console.log("Unexpected error:", error);
			}
		} finally {
			setIsImporting(false);
			setUploadProgress(0);
		}
	};

	return (
		<div className="rounded-lg border-[1px] py-0">
			<Modal isOpen={isModalOpen} onClose={closeModal} title="Add Farmer">
				<div className="bg-white py-1 rounded-lg w-[600px] transition-transform ease-in-out max-h[70vh] add-farmer overflow-y-auto">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						{/* Basic Information Section */}
						<div>
							<p className="text-sm text-dark-1">Basic Information</p>
							<div className="flex flex-col gap-2 mt-4">
								<div className="flex flex-row gap-3 justify-between items-center">
									<div>
										<p className="text-xs text-primary-6 font-inter">
											First Name
										</p>
										<Input
											type="text"
											className="focus:border-none mt-2"
											value={name.split(" ")[0] || ""}
											onChange={(e) => setName(e.target.value)}
										/>
									</div>
									<div>
										<p className="text-xs text-primary-6 font-inter">
											Last Name
										</p>
										<Input
											type="text"
											className="focus:border-none mt-2"
											value={name.split(" ")[1] || ""}
											onChange={(e) =>
												setName(`${name.split(" ")[0]} ${e.target.value}`)
											}
										/>
									</div>
								</div>
								<div className="flex flex-row gap-3 justify-between items-center w-full">
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Other Name
										</p>
										<Input
											type="text"
											className="focus:border-none mt-2"
											value={otherName}
											onChange={(e) => setOtherName(e.target.value)}
										/>
									</div>
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Gender
										</p>
										<Select onValueChange={(value) => setGender(value)}>
											<SelectTrigger className="w-full mt-2">
												<SelectValue placeholder="Select Gender" />
											</SelectTrigger>
											<SelectContent className="z-200 post bg-white">
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="flex flex-row gap-3 justify-between items-center">
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											OAF-ID
										</p>
										<Input
											type="text"
											className="focus:border-none mt-2"
											value={oafId}
											onChange={(e) => setOafId(e.target.value)}
										/>
									</div>
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Date of Birth
										</p>
										<Input
											type="date"
											className="focus:border-none mt-2"
											value={dob}
											onChange={(e) => setDob(e.target.value)}
										/>
									</div>
								</div>
								<div className="flex flex-row gap-3 justify-between items-center">
									<div>
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Phone Number
										</p>
										<Input
											type="text"
											className="focus:border-none mt-2"
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
										/>
									</div>
									<div>
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Email
										</p>
										<Input
											type="email"
											className="focus:border-none mt-2"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
								</div>
							</div>
						</div>

						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />

						{/* Location Section */}
						<div className="mt-4">
							<p className="text-sm text-dark-1">Location</p>
							<div className="flex flex-col gap-2 mt-2">
								<div className="flex flex-row items-center justify-between gap-5">
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											State
										</p>
										<Select
											onValueChange={(value) => setSelectedStateId(value)}>
											<SelectTrigger className="w-full mt-2">
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
											District
										</p>
										<Select
											onValueChange={(value) => setSelectedDistrictId(value)}>
											<SelectTrigger className="w-full mt-2">
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
								<div className="flex flex-row items-center justify-between gap-5 mt-1">
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											POD/Sector
										</p>
										<Select onValueChange={(value) => setSelectedPodId(value)}>
											<SelectTrigger className="w-full mt-2">
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
									</div>
									<div className="w-[50%] lg:w-full">
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Site
										</p>
										<Select onValueChange={(value) => setSelectedSiteId(value)}>
											<SelectTrigger className="w-full mt-2">
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
								</div>
								<div className="flex flex-col gap-2">
									<div>
										<p className="text-xs text-primary-6 mt-2 font-inter">
											Group
										</p>
										<Select
											onValueChange={(value) => setSelectedGroupId(value)}>
											<SelectTrigger className="w-full mt-2">
												<SelectValue placeholder="Select Group" />
											</SelectTrigger>
											<SelectContent className="z-200 post bg-white">
												{groups.map((group) => (
													<SelectItem key={group.id} value={group.id}>
														{group.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</div>

						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />

						{/* Image Upload Section */}
						<div>
							<p className="text-xs text-primary-6 font-inter">Upload Image</p>
							<div className="flex flex-col justify-center items-center gap-3 p-3 border-dashed border rounded-lg mt-3 mb-4">
								<IconCloudDownload size={14} />
								<p className="text-xs font-inter text-[#4B5563]">
									Choose a file
								</p>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									id="fileInput"
									onChange={handleFileChange}
								/>
								<Button
									className="border text-xs p-2"
									onClick={() => document.getElementById("fileInput")?.click()}>
									Browse File
								</Button>
								{previewImage && (
									<div className="mt-2 flex flex-row justify-start items-center gap-3">
										<Image
											src={previewImage}
											width={100}
											height={100}
											alt="Preview"
											className="w-[200px] h-[200px] object-cover rounded-md"
										/>
										<Button
											onClick={() => {
												setFeaturedImage(null);
												setPreviewImage(null);
											}}
											className="border text-xs p-2">
											Remove
										</Button>
									</div>
								)}
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeModal}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={handleAddFarmer}
								disabled={isAddingFarmer}>
								{isAddingFarmer ? "Adding..." : "Add"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>
			<Modal
				isOpen={isImportModalOpen}
				onClose={closeImportModal}
				title="Import Farmer">
				<div className="bg-white py-1 rounded-lg import-farmer transition-transform ease-in-out max-h-[70vh] overflow-y-auto">
					<div className="flex flex-row items-center justify-end gap-4 p-4">
						<Link href="/temp.xlsx">
							<Button className="bg-primary-1 text-white">
								<IconCloudDownload />
								Download Template
							</Button>
						</Link>
					</div>
					<div className="mt-3 border-[1px] border-dashed border-[#E2E4E9] pt-4 px-4">
						{/* State Selection */}
						<div className="w-full mb-4">
							<p className="text-xs text-primary-6 mt-2 font-inter">State</p>
							<Select
								value={selectedStateId || ""}
								onValueChange={(value) => setSelectedStateId(value)}>
								<SelectTrigger className="w-full mt-2">
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

						{/* File Upload Section */}
						<div className="flex flex-col justify-center items-center gap-3 p-6 border-dashed border-2 border-gray-300 rounded-lg mb-4">
							{!selectedFile ? (
								<>
									<IconCloudDownload size={40} className="text-primary-1" />
									<p className="text-sm font-medium text-gray-700">
										Select a CSV file to upload
									</p>
									<p className="text-xs text-gray-500 mb-2">
										or drag and drop it here
									</p>
									<input
										type="file"
										accept=".csv"
										className="hidden"
										id="csvFileInput"
										onChange={handleImportFileChange}
									/>
									<Button
										className="bg-primary-1 text-white text-xs"
										onClick={() =>
											document.getElementById("csvFileInput")?.click()
										}>
										Browse File
									</Button>
								</>
							) : (
								<div className="w-full">
									{uploadProgress > 0 && uploadProgress < 100 ? (
										<div className="flex flex-col items-center">
											<div className="relative w-20 h-20">
												<svg className="w-full h-full" viewBox="0 0 100 100">
													<circle
														className="text-gray-200"
														strokeWidth="8"
														stroke="currentColor"
														fill="transparent"
														r="36"
														cx="50"
														cy="50"
													/>
													<circle
														className="text-primary-1"
														strokeWidth="8"
														strokeDasharray={`${uploadProgress * 2.16} 216`}
														strokeLinecap="round"
														stroke="currentColor"
														fill="transparent"
														r="36"
														cx="50"
														cy="50"
													/>
												</svg>
												<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
													<span className="text-xs font-medium">
														{Math.round(uploadProgress)}%
													</span>
												</div>
											</div>
											<p className="text-xs mt-2 text-gray-600">
												Uploading {selectedFile.name}...
											</p>
										</div>
									) : (
										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center gap-3">
												<div className="bg-primary-1/10 p-2 rounded-full">
													<IconFileImport
														className="text-primary-1"
														size={20}
													/>
												</div>
												<div>
													<p className="text-sm font-medium text-gray-800">
														{selectedFile.name}
													</p>
													<p className="text-xs text-gray-500">
														{(selectedFile.size / 1024).toFixed(1)} KB
													</p>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setSelectedFile(null);
													setUploadProgress(0);
												}}>
												<IconTrash size={16} color="red" />
											</Button>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Instructions Section */}
						<div className="mb-6">
							<h3 className="text-sm font-medium text-gray-800 mb-2">
								Import Instructions
							</h3>
							<ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
								<li>CSV file must include required columns</li>
								<li>First row should contain headers</li>
								<li>Maximum file size: 5MB</li>
								<li>Only CSV files are accepted</li>
							</ul>
						</div>

						{/* Modal Footer */}
						<div className="flex flex-row justify-end items-center gap-3 font-inter pt-4 mb-4 mt-4">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeImportModal}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={handleImportSubmit}
								disabled={!selectedFile || !selectedStateId || isImporting}>
								{isImporting ? "Importing..." : "Import"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>
			<div
				className="bg-white flex flex-row border-b-[1px] border-[#E2E4E9] justify-between items-center p-3"
				style={{
					borderTopLeftRadius: "0.5rem",
					borderTopRightRadius: "0.5rem",
				}}>
				<div>
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src="/images/staffm.png"
							alt="staff management"
							height={20}
							width={20}
						/>
						<p className="text-sm text-dark-1 font-medium font-inter">
							Farmer Management
						</p>
					</div>

					<p className="text-xs text-primary-6 mt-3">
						Helping farmers plan, organize, and manage their farms efficiently
						to increase productivity and profitability.
					</p>
				</div>
				<div className="flex flex-row justify-start items-center gap-3 font-inter">
					<Button
						className="border-[#E8E8E8] border-[1px]"
						onClick={handleExport}
						disabled={isLoading}>
						<IconFileExport /> {isLoading ? "Exporting..." : "Export"}
					</Button>
					<Button
						className="border-[#E8E8E8] border-[1px]"
						onClick={openImportModal}>
						<IconFileImport /> Import
					</Button>
					<Button
						className="bg-primary-1 text-white font-inter"
						onClick={openModal}>
						<IconPlus /> Add Farmer
					</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-primary-3">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} className="bg-primary-3 text-xs">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody className="bg-white">
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-left text-xs text-primary-6">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
