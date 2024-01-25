import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');

  const handleTranslate = async () => {
    try {
      // Your existing code to detect language
      const apiKey = process.env.REACT_APP_AZURE_API_KEY;
      console.log("API-key: ", apiKey);
      const region = 'norwayeast';
      const endpoint = `https://api.cognitive.microsofttranslator.com/`;
      const headers = {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      };
  
      const language = await detectLanguage(apiKey, endpoint, inputText, headers);
  
      // Check if a local translation file exists
      const localFilePath = `/wkt/${language === 'fi' ? 'fi-en' : 'en-fi'}/${inputText}`;
      try {
        const localFileContent = await axios.get(localFilePath);
        const sanitizedContent = sanitizeLinks(localFileContent.data);
        setTranslation(sanitizedContent);
        return;
      } catch (localFileError) {
        // Local file not found, proceed with Azure Translations API
      }
  
      if (language === 'fi') {
        const translatedText = await translateText(apiKey, endpoint, inputText, 'en', headers);
        setTranslation(translatedText);
      } else if (language === 'en') {
        const translatedText = await translateText(apiKey, endpoint, inputText, 'fi', headers);
        setTranslation(translatedText);
      } else {
        setTranslation('Błąd: Wprowadzony tekst nie jest ani po angielsku, ani po fińsku.');
      }
    } catch (error) {
      console.error('Błąd tłumaczenia:', error);
      setTranslation('Wystąpił błąd podczas tłumaczenia.');
    }
  };

  const sanitizeLinks = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
  
    // Traverse through the links and replace them with plain text
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const textNode = doc.createTextNode(link.textContent);
      link.parentNode.replaceChild(textNode, link);
    });
  
    return doc.body.innerHTML;
  };

  const detectLanguage = async (apiKey, endpoint, text, headers) => {
    try {
      const response = await axios.post(
        `${endpoint}/detect?api-version=3.0`,
        [{ text }],
        {
          headers: {
            ...headers,
            'Content-type': 'application/json',
          },
        }
      );
  
      return response.data[0].language;
    } catch (error) {
      throw error;
    }
  };

  const translateText = async (apiKey, endpoint, text, targetLanguage, headers) => {
    try {
      const response = await axios.post(
        `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`,
        [{ text }],
        {
          headers: {
            ...headers,
            'Content-type': 'application/json',
          },
        }
      );
  
      return response.data[0].translations[0].text;
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>slownik</h1>
      </header>
      <main>
        <label>
          Wprowadź frazę:
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </label>
        <button onClick={handleTranslate}>Tłumacz</button>
        <div>
          <strong>Wynik:</strong>
          <div dangerouslySetInnerHTML={{ __html: translation }} />
        </div>
      </main>
    </div>
  );
}

export default App;
