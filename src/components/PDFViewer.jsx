import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faDownload } from '@fortawesome/free-solid-svg-icons';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.2) {
      setScale(scale - 0.1);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center space-x-4 p-4">
        <button
          onClick={zoomOut}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Zoom Out
        </button>
        <button
          onClick={zoomIn}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Zoom In
        </button>
        <span className="text-white">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          onClick={handleDownload}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
          title="Download PDF"
        >
          <FontAwesomeIcon icon={faDownload} />
        </button>
      </div>
      <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
