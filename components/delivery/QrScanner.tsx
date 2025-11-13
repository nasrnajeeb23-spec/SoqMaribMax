import React, { useState } from 'react';

interface QrScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onScan(code);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-4">مسح رمز الاستلام</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    لأغراض العرض، يرجى إدخال الرمز الموجود في QR Code يدوياً.
                </p>
                <div className="w-48 h-48 border-4 border-dashed border-[var(--color-primary)] rounded-lg mx-auto flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="SM-PICKUP-..."
                        className="w-full p-2 border border-[var(--color-border)] rounded-md text-center font-mono"
                        required
                    />
                    <div className="flex justify-center gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300">إغلاق</button>
                        <button type="submit" className="bg-green-500 text-white font-bold py-2 px-6 rounded-md hover:bg-green-600">تأكيد</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QrScanner;