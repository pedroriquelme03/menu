import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Table } from '../../types';
import { Download, QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  table: Table;
  onClose: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ table, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrUrl = `${window.location.origin}/table/${table.token}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
    }
  }, [qrUrl]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-mesa-${table.number}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code Mesa ${table.number}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container { 
                max-width: 300px; 
                margin: 0 auto; 
                padding: 20px;
                border: 2px solid #333;
                border-radius: 10px;
              }
              .table-info { 
                margin-bottom: 20px; 
                font-size: 18px;
                font-weight: bold;
              }
              .qr-code { 
                margin: 20px 0; 
              }
              .instructions { 
                font-size: 14px; 
                color: #666;
                margin-top: 20px;
              }
              @media print {
                body { margin: 0; }
                .qr-container { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="table-info">
                Mesa ${table.number} - ${table.capacity} lugares
              </div>
              <div class="qr-code">
                <img src="${canvasRef.current?.toDataURL()}" alt="QR Code Mesa ${table.number}" style="width: 200px; height: 200px;" />
              </div>
              <div class="instructions">
                Escaneie este QR code para acessar o cardápio e fazer pedidos
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              QR Code Mesa {table.number}
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">URL da Mesa</p>
              <p className="text-xs text-gray-500 break-all bg-white p-2 rounded border">
                {qrUrl}
              </p>
            </div>
            
            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-200 rounded-lg"
                width="256"
                height="256"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Capacidade: {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Token: {table.token}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Imprimir
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
