import React, { useState, ChangeEvent, FormEvent } from "react";
import { WebUploader } from "@irys/web-upload";
import { WebAptos } from "@irys/web-upload-aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
//import { useQueryClient } from "@tanstack/react-query";
import { aptosClient } from "@/utils/aptosClient";
import { toast } from "@/components/ui/use-toast";
import { executePayAd } from "@/entry-functions/payAd";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";

//const MODULE_ADDRESS = "0x8d92d545efc47314646b41e78605061f67268812cc97fd3265a6d0ccc0a5f364";
//const MODULE_NAME = "aptosverse";

const AdUploader: React.FC = () => {
  const wallet = useWallet();
  //const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata,] = useState({
    NumberOfDays: "",
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [showSuccessPopup] = useState<boolean>(false);
  const [showErrorPopup] = useState<boolean>(false);
  const [, setData] = useState<CommittedTransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const { account, signAndSubmitTransaction } = useWallet();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /*const handleMetadataChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMetadata((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };*/

  const getIrysUploader = async () => {
    const irysUploader = await WebUploader(WebAptos)
      .withProvider(wallet)
      .devnet()
      .withRpc("testnet");

    return irysUploader;
  };

  const uploadAd = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setUploading(true);

    const imageSize = selectedImage.size;
    const metadataSize = new Blob([JSON.stringify(metadata)]).size;
    const totalSize = imageSize + metadataSize;
    const totalSizeKiB = totalSize / 1024;
    const contentType = selectedImage.type;
    const tags = [
      { name: "Content-Type", value: contentType },
      ...Object.entries(metadata).map(([key, value]) => ({ name: key, value })),
    ];

    try {
      const irysUploader = await getIrysUploader();
      console.log(`Connected to Irys from ${irysUploader.address}`);
      console.log("Uploading ad");

      if (totalSizeKiB >= 1000) {
        const price = await irysUploader.getPrice(totalSize);
        await irysUploader.fund(price);
      }

      const response = await irysUploader.uploadFile(selectedImage, { tags });
      setUploadUrl(`https://gateway.irys.xyz/${response.id}`);
      
      toast({
        title: "Upload Successful",
        description: "Ad uploaded successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading file", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the ad.",
        variant: "default",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePayAd = async () => {
    
    
    if (!account || !account.address) {
      toast({
        title: "No Account Found",
        description: "Please connect a valid wallet.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);

    try {
      const transaction = await signAndSubmitTransaction(
        executePayAd({ amount: parseInt(amount) })
      );
      const result = await aptosClient().waitForTransaction({transactionHash: transaction.hash});
      setData(result);
      window.parent.postMessage(uploadUrl, "https://aptosverse.vercel.app/")
      toast({
        title: "Payment Successful",
        description: `Successfully paid for ${amount} tokens.`,
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment Failed",
        description: `Failed to pay for ${amount} tokens.`,
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={uploadAd} className="flex flex-col items-center w-full max-w-md p-4 mx-auto space-y-4 bg-white rounded shadow">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {previewUrl && <img src={previewUrl} alt="Ad Preview" className="w-full max-w-xs mt-4 rounded" />}

      <button
        type="submit"
        className="mt-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Ad"}
      </button>

      {uploadUrl && (
        <>
          <p className="mt-4 text-center text-green-500">
            File uploaded successfully! View at: <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="underline">{uploadUrl.substring(0, 25)}...{uploadUrl.substring(uploadUrl.length - 10, uploadUrl.length)}</a>
          </p>
          <input
            type="number"
            name="NumberOfDays"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Number of Days"
            className="w-full p-2 mt-2 border border-gray-300 rounded"
            min="1"
          />
          <button
            type="button"
            onClick={handlePayAd}
            className="mt-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay AD"}
          </button>
        </>
      )}

      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded shadow">
            Please enter the Number Of Days!
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded shadow">
            AD chosen paid successfully for {metadata.NumberOfDays} days!
          </div>
        </div>
      )}
    </form>
  );
};

export default AdUploader;
