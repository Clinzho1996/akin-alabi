import RegistrationForm from "@/components/BeneficiaryForm";
import HeaderBox from "@/components/HeaderBox";

function EditPage() {
	return (
		<div className="w-full overflow-x-hidden">
			<HeaderBox />
			<div className="mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
				<h2 className="text-black font-medium">Edit Beneficiary Details</h2>
				<p className="text-sm text-[#6C7278] font-normal ">
					Capture personal details, biometrics, and assign programs.
				</p>
			</div>
			<RegistrationForm />
		</div>
	);
}

export default EditPage;
