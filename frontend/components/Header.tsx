import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full">
      <div className="flex-1">
        {/* Empty div to balance the layout */}
      </div>
      <div className="flex justify-center flex-1">
        <img
          src="/aptos3.png"
          alt="Aptosverse Logo"
          className="h-32 w-auto" // Adjust size as needed
        />
      </div>
      <div className="flex justify-end flex-1">
        <WalletSelector />
      </div>
    </div>
  );
}