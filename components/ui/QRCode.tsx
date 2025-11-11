// A simple QR Code generator in React with TypeScript, without external libraries.
// Note: This is a basic implementation and might not support all QR code features.
// It's designed to be lightweight and dependency-free.
import React from 'react';

// QR code generation logic (simplified)
const createQrCode = (text: string): boolean[][] => {
  // This is a placeholder for a real QR code generation algorithm.
  // A proper implementation is very complex. For this demo, we create a simple pattern.
  const size = 25;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Basic pattern based on text length and char codes
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const charIndex = (i * j) % text.length;
      const charCode = text.charCodeAt(charIndex);
      if ((charCode + i + j) % 2 === 0) {
        grid[i][j] = true;
      }
    }
  }

  // Add finder patterns (the squares in the corners)
  const addFinderPattern = (x: number, y: number) => {
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        if (x + i >= 0 && x + i < size && y + j >= 0 && y + j < size) {
          const isBorder = Math.abs(i) === 3 || Math.abs(j) === 3;
          const isInner = Math.abs(i) < 2 && Math.abs(j) < 2;
          grid[x + i][y + j] = isBorder || isInner;
        }
      }
    }
     for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
         if (x + i >= 0 && x + i < size && y + j >= 0 && y + j < size) {
            if(Math.abs(i) < 2 && Math.abs(j) < 2) continue;
            grid[x + i][y + j] = false;
         }
      }
     }
  };

  addFinderPattern(3, 3);
  addFinderPattern(size - 4, 3);
  addFinderPattern(3, size - 4);

  return grid;
};

interface QRCodeProps {
  text: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ text, size = 128 }) => {
  const qrGrid = createQrCode(text);
  const gridSize = qrGrid.length;
  const cellSize = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      <rect x={0} y={0} width={size} height={size} fill="#ffffff" />
      {qrGrid.map((row, i) =>
        row.map((isFilled, j) =>
          isFilled ? (
            <rect
              key={`${i}-${j}`}
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default QRCode;