/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import axios from 'axios';

export default function App() {
  const [mainUpload, setMainUpload] = useState(null);
  const [mainData, setMainData] = useState(null);

  // compUpload/compData is the file data from the uploaded comparison file.
  const [compUpload, setCompUpload] = useState(null);
  const [compData, setCompData] = useState(null);
  const [result, setResult] = useState(false);
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  /**
   * @function CompareData compares the file data between the comparison and main files.
   */
  function compareData() {
    let bool = false;
    for (let i = 0; i < compData.length; i += 1) {
      /**
       * iterates over each entry stored in the @compData array and checks to see if the values
       * exist in the @mainData .
       */
      if (mainData.includes(compData[i])) {
        bool = true;
      } else {
        bool = false;
        break;
      }
    }
    setResult(bool);
  }

  // Executes the compareData function when all data is finished processing.
  useEffect(() => {
    if (compData && mainData) {
      compareData();
    }
  }, [compData, mainData]);

  async function uploadFile(type) {
    /**
     * There should be several rules to account for when dealing with PDF uploading:
     * fileData should only be in PDF format.
     * There should be a maximum uploading size of 100mb
     * fileData can contain multiple files (for future implementation)
     */
    if ((type === 'main' && !mainUpload) || (type === 'comp' && !compUpload)) {
      console.error('Upload content is empty: please upload a document first.');
    } else {
      // create a new form when file data is uploaded successfully.
      const formData = new FormData();

      // conditionals for each type.
      if (type === 'main') {
        formData.append('fileUpload', mainUpload, mainUpload.name);
        await axios.post('/upload/main', formData, { contentType: 'multipart/form-data' });
      } else {
        formData.append('fileUpload', compUpload, compUpload.name);
        await axios.post('/upload/comp', formData, { contentType: 'multipart/form-data' });
      }
    }

    /**
     * @method getDocument @param options
     * is a pdfjs method that opens PDF files and extracts the information from the PDF file
     * which could then be used for data collection or DOM manipulation.
     * @url option determines the url (which is local in this app)
     * of where the method will extract information from.
     */
    pdfjs.getDocument({ url: type === 'main' ? '/main' : '/comp' }).promise.then((doc) => {
      // doc = document information
      // getPage gets the selected page from the PDF and extracts the data from it.
      doc.getPage(1).then((pageData) => {
        const canvas = type === 'main' ? document.getElementById('pdf-canvas-main') : document.getElementById('pdf-canvas-comp');
        const context = canvas.getContext('2d');
        const vport = pageData.getViewport({ scale: 1 });
        canvas.width = vport.width;
        canvas.height = vport.height;

        pageData.render({
          // renders context from canvas to match the page data.
          canvasContext: context,
          viewport: vport,
        });

        // getTextContent extracts text-based information from the PDF data.
        pageData.getTextContent()
          .then((data) => {
            const textContent = [];
            data.items.forEach((text) => {
              textContent.push(text.str);
            });
            // snatch snatches the entries and separates them from the initial data pool.
            const snatch = []; let point1 = -1;
            // storage is a temporary array that stores the separated data of each snatch.
            let storage = [];
            for (let i = 0, j = 0; i < textContent.length; i += 1) {
              /**
               * Conditional that checks to see if the first point is found
               * and to find entry names.
               */
              if (point1 >= 0 && textContent[i].toLowerCase().match(/[a-z]/g)) {
                snatch.push(storage.join(''));
                // reset all values for the next cycle.
                point1 = -1;
                j = i;
                i -= 1;
                storage = [];
                // index j = start of entry
                // if element i equals element j, that's start of a new entry point.
              } else if (textContent[i] === textContent[j]) {
                point1 = i;
                storage.push(textContent[i]);
              } else {
                // continue pushing values since it belongs inside the selected entry.
                storage.push(textContent[i]);
              }
            }
            if (type === 'main') {
              setMainData(snatch.join(''));
            } else {
              setCompData(snatch);
            }
          });
      });
    });
  }

  return (
    <div id="main-container">
      <h1>QA Automator</h1>
      {mainUpload && (
        <h3>{mainUpload.name}</h3>
      )}
      <canvas id="pdf-canvas-main" style={{ maxWidth: '700px' }} />
      <canvas id="pdf-canvas-comp" style={{ maxWidth: '700px' }} />
      <input type="file" onChange={(e) => setMainUpload(e.target.files[0])} />
      <button type="submit" onClick={() => uploadFile('main')}>Submit main PDF</button>
      <input type="file" onChange={(e) => setCompUpload(e.target.files[0])} />
      <button type="submit" onClick={() => uploadFile('comp')}>Submit comparison PDF</button>
      {/* Outputs the comparison boolean result */}
      <h2>{mainUpload && compData && result ? 'TRUE' : 'FALSE'}</h2>
    </div>
  );
}
