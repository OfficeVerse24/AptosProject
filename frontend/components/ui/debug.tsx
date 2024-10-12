import React, { useState } from 'react';

const PaymentStatus: React.FC = () => {
    // State variables to manage input values and message
    const [fileName, setFileName] = useState<string>('No file selected');
    const [place, setPlace] = useState<string>('Unknown place');
    const [link, setLink] = useState<string>('No link');
    const [message, setMessage] = useState<string>('');

    // Function to handle file input change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]?.name || 'No file selected';
        setFileName(selectedFile);
    };

    // Function to display the message based on inputs
    const displayMessage = () => {
        const newMessage = `${fileName} paid successfully in ${place}. TXID: ${link}.`;
        setMessage(newMessage);
    };

    return (
        <div>
            <h2>Payment Status</h2>
            
            {/* File input controlled by state */}
            <input 
                type="file" 
                onChange={handleFileChange}
            />
            <input 
                type="text" 
                value={place} 
                onChange={(e) => setPlace(e.target.value)} 
                placeholder="Enter place on the map" 
            />
            <input 
                type="text" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                placeholder="Enter gateway link" 
            />
            <button onClick={displayMessage}>Submit</button>

            {/* Display the message */}
            <p>{message}</p>
        </div>
    );
};

export default PaymentStatus;
