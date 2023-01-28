import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const maxRetries = 20;
  const [img, setImg] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  const [doMeButton, setDoMeButton] = useState('in Concept Art Mode');

  const [artist, setArtist] = useState('');
  const [medium, setMedium] = useState('');
  const [vibe, setVibe] = useState('');
  const [descriptors, setDescriptors] = useState('');

  // combined inputs
  const [finalInput, setFinalInput] = useState('');

  const onChangeArtist = (e) => {
    console.log(e.target.value);
    setArtist(e.target.value);
  };

  const onChangeMedium = (e) => {
    console.log(e.target.value);
    setMedium(e.target.value);
  };

  const onChangeVibe = (e) => {
    console.log(e.target.value);
    setVibe(e.target.value);
  };

  const onChangeDescriptors = (e) => {
    console.log(e.target.value);
    setDescriptors(e.target.value);
  };

  const generateAction = async () => {

    setFinalInput(`A photo of self ${doMeButton} by ${artist}, medium: ${medium}. Self is ${vibe}, ${descriptors}.`)

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    // Set loading has started
    setIsGenerating(true);


    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ finalInput }),
    });

    const data = await response.json();

    if (response.status === 503) {
      console.log('Model is loading still :(.')
      setIsGenerating(false);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }

    // Set final prompt here
    console.log(`Final prompt: ${finalInput}`)
    setFinalPrompt(finalInput);
    setDoMeButton('in Concept Art Mode');
    setArtist('');
    setMedium('');
    setVibe('');
    setDescriptors('');

    setImg(data.image);
    setIsGenerating(false);
  }

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>Self picture generator x buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Self picture generator</h1>
          </div>

          <div className="header-subtitle">
            <h2>
              How would you do me?
            </h2>
          </div>


          <div className="options-button">
            <button
              className="select-button"
              onClick={() => {
                setDoMeButton("in Digital Art Mode");
              }}

            >Digital Art Mode</button>
            <button
              className="select-button"
              onClick={() => {
                setDoMeButton("in Cartoon Mode");
              }}
            > Cartoon Mode</button>
            <button className="select-button"
              onClick={() => {
                setDoMeButton("in Fantasy Mode");
              }}
            > Fantasy Mode
            </button>
          </div>


          <div className="input-container">
            <div className="input-box">
              <input type="text" placeholder="Artist"
                onChange={onChangeArtist}
              />
              <input type="text" placeholder="Medium"
                onChange={onChangeMedium}
              />
            </div>
            <div className="input-box">
              <input type="text" placeholder="Vibe"
                onChange={onChangeVibe}
              />
              <input type="text" placeholder="Descriptors"
                onChange={onChangeDescriptors}
              />
            </div>
          </div>


          <div className="prompt-container">
            {/* <input className="prompt-box" value={input} onChange={onChange} /> */}
            <div className="prompt-buttons">
              {/* Tweak classNames to change classes */}
              <a
                className={
                  isGenerating ? 'generate-button loading' : 'generate-button'
                }
                onClick={generateAction}
              >
                {/* Tweak to show a loading indicator */}
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
