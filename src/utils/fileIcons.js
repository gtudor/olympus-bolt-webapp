import { 
  faFile,
  faFileImage,
  faFileVideo,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileAudio,
  faFileCode,
  faFileArchive,
  faFileAlt,
  faFileCsv
} from '@fortawesome/free-solid-svg-icons';

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Images (including HEIC)
    heic: faFileImage,
    jpg: faFileImage,
    jpeg: faFileImage,
    png: faFileImage,
    gif: faFileImage,
    svg: faFileImage,
    webp: faFileImage,
    
    // Videos
    mp4: faFileVideo,
    mov: faFileVideo,
    avi: faFileVideo,
    mkv: faFileVideo,
    webm: faFileVideo,
    
    // Documents
    pdf: faFilePdf,
    doc: faFileWord,
    docx: faFileWord,
    xls: faFileExcel,
    xlsx: faFileExcel,
    ppt: faFilePowerpoint,
    pptx: faFilePowerpoint,
    txt: faFileAlt,
    rtf: faFileAlt,
    csv: faFileCsv,
    
    // Audio
    mp3: faFileAudio,
    wav: faFileAudio,
    ogg: faFileAudio,
    
    // Code
    js: faFileCode,
    jsx: faFileCode,
    ts: faFileCode,
    tsx: faFileCode,
    html: faFileCode,
    css: faFileCode,
    json: faFileCode,
    py: faFileCode,
    java: faFileCode,
    cpp: faFileCode,
    
    // Archives
    zip: faFileArchive,
    rar: faFileArchive,
    '7z': faFileArchive,
    tar: faFileArchive,
    gz: faFileArchive
  };

  return iconMap[extension] || faFile;
};

export const getFileColor = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const colorMap = {
    // Images (including HEIC)
    heic: 'text-pink-500',
    jpg: 'text-pink-500',
    jpeg: 'text-pink-500',
    png: 'text-pink-500',
    gif: 'text-pink-500',
    svg: 'text-pink-500',
    webp: 'text-pink-500',
    
    // Videos
    mp4: 'text-purple-500',
    mov: 'text-purple-500',
    avi: 'text-purple-500',
    mkv: 'text-purple-500',
    webm: 'text-purple-500',
    
    // Documents
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    xls: 'text-green-500',
    xlsx: 'text-green-500',
    ppt: 'text-orange-500',
    pptx: 'text-orange-500',
    txt: 'text-gray-500',
    rtf: 'text-gray-500',
    csv: 'text-green-400',
    
    // Audio
    mp3: 'text-yellow-500',
    wav: 'text-yellow-500',
    ogg: 'text-yellow-500',
    
    // Code
    js: 'text-yellow-400',
    jsx: 'text-blue-400',
    ts: 'text-blue-600',
    tsx: 'text-blue-600',
    html: 'text-orange-600',
    css: 'text-blue-500',
    json: 'text-gray-600',
    py: 'text-green-600',
    java: 'text-red-400',
    cpp: 'text-blue-700',
    
    // Archives
    zip: 'text-gray-500',
    rar: 'text-gray-500',
    '7z': 'text-gray-500',
    tar: 'text-gray-500',
    gz: 'text-gray-500'
  };

  return colorMap[extension] || 'text-gray-600';
};
