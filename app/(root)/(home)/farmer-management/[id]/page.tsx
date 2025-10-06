"use client";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Farmer } from "@/config/farmer-columns";
import {
	IconArrowBack,
	IconCircleCheckFilled,
	IconCircleXFilled,
	IconFaceId,
	IconFingerprint,
	IconSettings,
	IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ApiResponse {
	data: Farmer; // Adjust to match your API structure
}

function FarmerDetails() {
	const { id } = useParams();
	const { data: session } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [userData, setUserData] = useState<Farmer | null>(null);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [isModalOpen, setModalOpen] = useState(false);

	const openDeleteModal = () => {
		setDeleteModalOpen(true);
	};

	const openModal = () => {
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};
	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	const fetchFarmer = useCallback(async () => {
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
				`https://api.wowdev.com.ng/api/v1/farmer/${id}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("data", response?.data?.data);
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
	}, [id]);

	const resetFarmerBiometrics = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;

			console.log("access token", accessToken);
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.post<Farmer>(
				`https://api.wowdev.com.ng/api/v1/farmer/reset-biometric/${id}`,
				{},
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				console.log("biometric reset successfully");

				await fetchFarmer();
				toast.success("Biometrics data reset successfully");
				closeModal();
			}
			setIsLoading(false);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error resetting biometrics",
					error.response?.data || error.message
				);

				toast.error(error?.response?.data.message);
			} else {
				console.log("Unexpected error:", error);
			}
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchFarmer();
	}, [fetchFarmer]);

	const handleDelete = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(
				`https://api.wowdev.com.ng/api/v1/farmer/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				toast.success("Farmer deleted successfully.");
				router.push("/farmer-management");
			}
		} catch (error) {
			console.error("Error deleting farmer:", error);
		}
	};

	const formatDate = (rawDate?: string | Date) => {
		if (!rawDate) return "Unknown"; // Handle undefined case
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<section className="bg-[#F6F8F9] min-h-screen flex flex-col">
			<Modal onClose={closeModal} isOpen={isModalOpen}>
				<p className="mt-4">
					Are you sure you want to reset {""}
					{userData?.first_name}&apos;s biometric data?
				</p>

				<p className="text-sm text-primary-6">This can&apos;t be undone</p>
				<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
					<Button
						className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
						onClick={closeDeleteModal}>
						Cancel
					</Button>
					<Button
						className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
						onClick={resetFarmerBiometrics}>
						{isLoading ? "Restting..." : "Yes, Confirm"}
					</Button>
				</div>
			</Modal>
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/farmer-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Farmer Information
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage farmer data, including contact information, roles,
							and performance records.
						</p>
					</div>
				</div>
				<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
					<Link href="/settings">
						<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
							<IconSettings size={18} />
						</div>
					</Link>
					{session?.user && (
						<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
							<div className="flex justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
								{session.user.image ? (
									<Image
										src={session.user.image}
										alt="profile"
										className="object-cover w-full h-full lg:w-[35px] lg:h-[35px]"
										width={30}
										height={30}
									/>
								) : (
									<div className="flex items-center justify-center w-full h-full bg-dark-3">
										<h2 className="text-white font-bold text-lg">
											{getNameInitials({ name: session?.user?.name || "" })}
										</h2>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="p-5 bg-white border-[1px] border-[#E2E4E9] m-4 rounded-lg">
				<div className="flex flex-row justify-start items-start gap-20 ">
					<div>
						{userData?.pic ? (
							<Image
								src={userData?.pic}
								alt="profile"
								className="rounded-full object-cover w-12 h-12"
								width={50}
								height={50}
							/>
						) : (
							<Image
								src="/images/avat.png"
								width={50}
								height={50}
								alt="avatar"
								className="rounded-full"
							/>
						)}
						<div className="py-4 border-b-[1px] border-[#E2E4E9]">
							<p className="text-[16px] text-dark-1 font-medium font-inter mt-2 capitalize">
								{userData?.first_name} {userData?.last_name}
							</p>
							<p className="text-sm text-[#6B7280B7] font-inter">
								Captured by:{" "}
								<span className="text-dark-1">OneAcreFund Staff</span>
							</p>
						</div>
						<div className="py-4 w-full border-b-[1px] border-[#E2E4E9]">
							<h2 className="text-sm text-[#6B7280B7] font-inter">Status</h2>
							<p
								className={`status-inner mt-4 ${
									userData?.finger_bio && userData?.facial_bio ? "green" : "red"
								}`}>
								{userData?.finger_bio && userData?.facial_bio
									? "Captured"
									: "Not Captured"}
							</p>
						</div>

						<div className="py-4 w-full  border-b-[1px] border-[#E2E4E9]">
							<div
								className="flex flex-row justify-start gap-1 items-center cursor-pointer"
								onClick={openDeleteModal}>
								<IconTrash color="red" size={16} />
								<p className="text-sm text-red">Delete</p>
							</div>
							<p className="text-sm text-[#6B7280B7] font-inter mt-2">
								Date captured{" "}
								<span className="text-dark-1">
									{formatDate(userData?.created_at)}
								</span>
							</p>
						</div>
						<div className="py-4">
							<div
								className="flex flex-row justify-start gap-1 items-center border p-2 rounded-lg w-fit cursor-pointer"
								onClick={openModal}>
								<IconFingerprint color="#6B7280" size={16} />
								<p className="text-sm text-[#6B7280]">Reset biometric data</p>
							</div>
						</div>
					</div>
					<div className="bg-[#F6F8FA] border-[1px] border-[#E2E4E9] w-[500px] rounded-lg">
						<div className="p-3 w-full">
							<h2 className="text-sm text-[#6B7280B7] font-inter">
								Basic Information
							</h2>
							<p className="text-sm text-dark-1 font-inter mt-2">
								Manage user profile
							</p>
						</div>
						<hr />

						<div className="bg-white p-3 rounded-lg mt-2 mx-1 mb-1 shadow-md flex flex-col gap-2">
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										First Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
										{userData?.first_name}
									</p>
								</div>
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Last Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
										{userData?.last_name}
									</p>
								</div>
							</div>
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Other Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
										{userData?.other_name}
									</p>
								</div>
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Date of Birth
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2 capitalize">
										{formatDate(userData?.dob)}
									</p>
								</div>
							</div>
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Email Address
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.email}
									</p>
								</div>
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Phone Number
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.phone_number}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white p-3 rounded-lg mt-2 mx-1 mb-1 shadow-md flex flex-col gap-2">
							<div className="p-2 border-b-[1px] border-[#E2E4E9]">
								<h2 className="text-sm text-[#6B7280B7] font-inter">
									Biometric Captured
								</h2>

								{/* Face ID Section */}
								{/* Face ID Section */}
								<div className="flex flex-row justify-between items-center border shadow-md rounded-lg p-2 mt-3">
									<div className="flex flex-row justify-start items-center gap-2">
										<IconFaceId color="#2B7F68" size={18} />
										<p className="text-xs text-dark-1 font-inter">Face ID</p>
									</div>

									{userData?.facial_bio ? (
										<IconCircleCheckFilled
											className="text-green-500"
											color="#2B7F68"
										/>
									) : (
										<IconCircleXFilled
											className="text-red-500"
											color="#F04F4A"
										/>
									)}
								</div>

								{/* Fingerprint Section */}
								<div className="flex flex-row justify-between items-center border shadow-md rounded-lg p-2 mt-3">
									<div className="flex flex-row justify-start items-center gap-2">
										<IconFingerprint color="#2B7F68" size={18} />
										<p className="text-xs text-dark-1 font-inter">
											Fingerprint
										</p>
									</div>

									{userData?.finger_bio ? (
										<IconCircleCheckFilled
											className="text-green-500"
											color="#2B7F68"
										/>
									) : (
										<IconCircleXFilled
											className="text-red-500"
											color="#F04F4A"
										/>
									)}
								</div>
							</div>
							<div className="flex flex-row justify-start gap-20 items-center p-2">
								<div>
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										OAFID (One Acre Fund Identification Number)
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.oaf_id}
									</p>
								</div>
							</div>
						</div>

						<p className="text-sm text-dark-1 font-inter mt-2 p-2 font-medium">
							Location
						</p>
						<div className="bg-white p-3 rounded-lg mt-2 mx-1 mb-1 shadow-md flex flex-col gap-2">
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">State</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">Niger</p>
								</div>
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										District Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.district?.name}
									</p>
								</div>
							</div>
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">POD</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.pod.name}
									</p>
								</div>
								<div className="w-[50%] lg:w-full">
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Site Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.site?.name}
									</p>
								</div>
							</div>
							<div className="flex flex-row justify-start gap-20 items-center p-2 border-b-[1px] border-[#E2E4E9]">
								<div>
									<h2 className="text-sm text-[#6B7280B7] font-inter">
										Group Name
									</h2>
									<p className="text-sm text-dark-1 font-inter mt-2">
										{userData?.group?.name}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p className="mt-4">
						Are you sure you want to delete {userData?.first_name}&apos;s
						account?
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
							onClick={handleDelete}>
							<IconTrash />
							Yes, Delete
						</Button>
					</div>
				</Modal>
			)}
		</section>
	);
}

export default FarmerDetails;
