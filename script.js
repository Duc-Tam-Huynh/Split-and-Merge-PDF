const splitDropArea = document.getElementById("split-drop-area");
const splitFileInput = document.getElementById("split-file");
const splitFileList = document.getElementById("split-file-list");
let selectedSplitFile = null;

// Handle drag-and-drop
splitDropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  splitDropArea.classList.add("active");
});

splitDropArea.addEventListener("dragleave", () => {
  splitDropArea.classList.remove("active");
});

splitDropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  splitDropArea.classList.remove("active");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    addSplitFile(file);
  } else {
    alert("Please drop a valid PDF file.");
  }
});

// Handle click to open file picker
splitDropArea.addEventListener("click", () => {
  splitFileInput.click();
});

// Handle file selection via file picker
splitFileInput.addEventListener("change", () => {
  const file = splitFileInput.files[0];
  if (file && file.type === "application/pdf") {
    addSplitFile(file);
  } else {
    alert("Please select a valid PDF file.");
  }
});

// Add the selected file to the list
function addSplitFile(file) {
  if (selectedSplitFile) {
    alert("Only one file can be selected for splitting. Please remove the current file first.");
    return;
  }

  selectedSplitFile = file;

  const listItem = document.createElement("li");
  listItem.textContent = file.name;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.onclick = () => removeSplitFile(listItem);

  listItem.appendChild(removeButton);
  splitFileList.appendChild(listItem);
}

// Remove the selected file
function removeSplitFile(listItem) {
  selectedSplitFile = null;
  listItem.remove();
}

// Split the selected PDF file
async function splitPDF() {
  if (!selectedSplitFile) {
    alert("Please select a file to split.");
    return;
  }

  const splitRange = document.getElementById("split-range").value.trim();
  if (!splitRange) {
    alert("Please enter a page number or range to split.");
    return;
  }

  const arrayBuffer = await selectedSplitFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();

  let startPage, endPage;

  if (splitRange.includes("-")) {
    const [start, end] = splitRange.split("-").map(Number);
    if (isNaN(start) || isNaN(end) || start < 1 || end > pageCount || start > end) {
      alert("Invalid range. Please enter a valid range (e.g., 1-3).");
      return;
    }
    startPage = start - 1;
    endPage = end - 1;
  } else {
    startPage = endPage = parseInt(splitRange) - 1;
    if (isNaN(startPage) || startPage < 0 || startPage >= pageCount) {
      alert("Invalid page number. Please enter a valid page number.");
      return;
    }
  }

  const extractedPDF = await PDFLib.PDFDocument.create();
  const pages = await extractedPDF.copyPages(pdfDoc, Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
  pages.forEach((page) => extractedPDF.addPage(page));

  const extractedBlob = new Blob([await extractedPDF.save()], { type: "application/pdf" });
  downloadBlob(extractedBlob, "split_part.pdf");

  const output = document.getElementById("output");
  output.innerHTML = `
    <h3>Split PDF:</h3>
    <iframe src="${URL.createObjectURL(extractedBlob)}" width="100%" height="500px"></iframe>
  `;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}








const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("merge-files");
const fileList = document.getElementById("file-list");
let selectedFiles = [];

// Handle drag-and-drop
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
  const files = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf");
  addFiles(files);
});

// Handle click to open file picker
dropArea.addEventListener("click", () => {
  fileInput.click();
});

// Handle file selection via file picker
fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files).filter(file => file.type === "application/pdf");
  addFiles(files);
});

// Add files to the list
function addFiles(files) {
  files.forEach(file => {
    if (!selectedFiles.some(f => f.name === file.name)) {
      selectedFiles.push(file);

      const listItem = document.createElement("li");
      listItem.textContent = file.name;

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.style.marginLeft = "10px";
      removeButton.onclick = () => removeFile(file.name, listItem);

      listItem.appendChild(removeButton);
      fileList.appendChild(listItem);
    }
  });
}

// Remove file from the list
function removeFile(fileName, listItem) {
  selectedFiles = selectedFiles.filter(file => file.name !== fileName);
  listItem.remove();
}

// Merge PDFs
async function mergePDFs() {
  if (selectedFiles.length === 0) {
    alert("Please add files to merge.");
    return;
  }

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (const file of selectedFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = await pdfDoc.copyPages(loadedPdf, Array.from({ length: loadedPdf.getPageCount() }, (_, i) => i));
    pages.forEach((page) => pdfDoc.addPage(page));
  }

  const mergedBlob = new Blob([await pdfDoc.save()], { type: "application/pdf" });
  downloadBlob(mergedBlob, "merged.pdf");

  // Display the merged PDF in the browser
  const output = document.getElementById("output");
  output.innerHTML = `
    <h3>Merged PDF:</h3>
    <iframe src="${URL.createObjectURL(mergedBlob)}" width="100%" height="500px"></iframe>
  `;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
