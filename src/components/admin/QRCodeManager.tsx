import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Download, QrCode, X } from 'lucide-react';

export const QRCodeManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state } = useRestaurant();
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    // Gerar QR codes para todas as mesas
    state.tables.forEach(table => {
      const canvas = canvasRefs.current[table.id];
      if (canvas) {
        const qrUrl = `${window.location.origin}/table/${table.token}`;
        QRCode.toCanvas(canvas, qrUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
      }
    });
  }, [state.tables]);

  const handleDownloadAll = () => {
    // Criar um ZIP com todos os QR codes
    const zip = new JSZip();
    
    state.tables.forEach(table => {
      const canvas = canvasRefs.current[table.id];
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        const base64Data = dataUrl.split(',')[1];
        zip.file(`qr-mesa-${table.number}.png`, base64Data, { base64: true });
      }
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'qr-codes-mesas.zip';
      link.click();
    });
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let html = `
        <html>
          <head>
            <title>QR Codes - Todas as Mesas</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                background: white;
              }
              .qr-grid { 
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                max-width: 1200px;
                margin: 0 auto;
              }
              .qr-item { 
                border: 2px solid #333;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                page-break-inside: avoid;
              }
              .table-info { 
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
              }
              .qr-code { 
                margin: 15px 0;
              }
              .instructions { 
                font-size: 12px;
                color: #666;
                margin-top: 10px;
              }
              @media print {
                body { margin: 0; }
                .qr-item { border: 1px solid #333; }
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center; margin-bottom: 30px;">QR Codes - Todas as Mesas</h1>
            <div class="qr-grid">
      `;

      state.tables.forEach(table => {
        const canvas = canvasRefs.current[table.id];
        if (canvas) {
          html += `
            <div class="qr-item">
              <div class="table-info">
                Mesa ${table.number} - ${table.capacity} lugares
              </div>
              <div class="qr-code">
                <img src="${canvas.toDataURL()}" alt="QR Code Mesa ${table.number}" style="width: 150px; height: 150px;" />
              </div>
              <div class="instructions">
                Escaneie para acessar o cardápio
              </div>
            </div>
          `;
        }
      });

      html += `
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Gerenciador de QR Codes
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Todos (ZIP)
            </button>
            <button
              onClick={handlePrintAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Imprimir Todos
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.tables.map((table) => (
              <div
                key={table.id}
                className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200"
              >
                <div className="mb-3">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="font-bold text-gray-600 text-lg">{table.number}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                  </p>
                </div>

                <div className="flex justify-center mb-3">
                  <canvas
                    ref={(el) => { canvasRefs.current[table.id] = el; }}
                    className="border border-gray-300 rounded-lg bg-white"
                    width="200"
                    height="200"
                  />
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  <p className="break-all bg-white p-2 rounded border text-xs">
                    {`${window.location.origin}/table/${table.token}`}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Token: {table.token.slice(-8)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
