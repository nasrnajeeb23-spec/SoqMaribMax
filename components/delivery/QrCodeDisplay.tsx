import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
    code: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ code }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, code, { width: 100 }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [code]);

    return <canvas ref={canvasRef} />;
};

export default QrCodeDisplay;