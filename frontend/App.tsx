import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WebUploader } from "@irys/web-upload";
import { WebAptos } from "@irys/web-upload-aptos";

// Radix UI Components
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import AdUploader from "@/components/AdUpload";

function App() {
  const { connected } = useWallet();
  const wallet = useWallet();
  const [irysStatus, setIrysStatus] = useState("Not connected");

  const connectIrys = async () => {
    console.log("connect irys called");
    console.log({wallet})
    try {
      const irysUploader = await WebUploader(WebAptos).withProvider(wallet);
      console.log({irysUploader})

      setIrysStatus(`Connected to Irys: ${irysUploader.address.substring(0, 6)}...${irysUploader.address.substring(irysUploader.address.length - 6, irysUploader.address.length)}`);
    } catch (error) {
      console.error("Error connecting to Irys:", error);
    }
  };

  return (
    <div style={{
      backgroundImage: `url(/aptos2.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>
      <Header />
      <div className="flex items-center justify-center flex-col">
        <Card className="mt-6">
          <CardHeader>
            {connected ? (
              <CardTitle>
                <div className="flex flex-col items-center justify-center w-full">
                  <button 
                    onClick={connectIrys}
                    className="upload-button bg-blue-600 rounded hover:bg-blue-700"
                    style={{
                      padding: '10px 20px',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      marginTop: '10px'
                    }}
                  >
                    {irysStatus === "Not connected" ? "Connect Irys" : irysStatus}
                  </button>
                  <AdUploader />
                </div>
              </CardTitle>
            ) : (
              <CardTitle style={{ fontSize: "14px" }}>To get started, connect a wallet</CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default App;