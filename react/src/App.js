import { useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'

// DUMMY DATA
const TEST_GIFS = [
  'https://media.giphy.com/media/uYe2emzPgDfj2/giphy.gif',
  'https://media.giphy.com/media/PNDOALYdDQ7xS/giphy.gif',
  'https://media.giphy.com/media/KItn9NmhcvyIE/giphy.gif',
  'https://media.giphy.com/media/cyMqOH8rjgDHG/giphy.gif',
  'https://media.giphy.com/media/T03UViLimDX88FTEue/giphy.gif',
  'https://media.giphy.com/media/LjULRGiyt1KpO/giphy.gif',
]

// Constants
const TWITTER_HANDLE = 'andrewmhenry22'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [gifList, setGifList] = useState([])

  /* This function holds the logic for deciding if a Phantom Wallet is connected or not */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!')

          /* The solana object gives us a function that will allow us to connect directly with the user's wallet! */
          const response = await solana.connect({ onlyIfTrusted: true })
          console.log('Connected with Public Key:', response.publicKey.toString())

          /* Set the user's publicKey in state to be used later! */
          setWalletAddress(response.publicKey.toString())
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻')
      }
    } catch (error) {
      console.error(error)
    }
  }

  /* Connect to the User's wallet on BUTTON CLICK. WON'T SHOW / BE USED IF THEY ARE ALREADY CONNECTED */
  const connectWallet = async () => {
    const { solana } = window

    if (solana) {
      const response = await solana.connect()
      console.log('Connected with Public Key:', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }

  /* The UI for when the user has OR has nit connected their wallet to our app yet. */
  const renderNotConnectedContainer = () => (
    <button className='cta-button connect-wallet-button' onClick={connectWallet}>
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => (
    <div className='connected-container'>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendGif()
        }}
      >
        <input type='text' placeholder='Enter gif link!' value={inputValue} onChange={onInputChange} />
        <button type='submit' className='cta-button submit-gif-button'>
          Submit
        </button>
      </form>
      <div className='gif-grid'>
        {gifList.map((gif) => (
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )

  const onInputChange = (event) => {
    const { value } = event.target
    setInputValue(value)
  }

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue)
    } else {
      console.log('Empty input. Try again.')
    }
  }

  /* When our component first mounts, let's check to see if we have a connectednPhantom Wallet */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...')

      // Call Solana program here.

      // Set state
      setGifList(TEST_GIFS)
    }
  }, [walletAddress])

  return (
    <div className='App'>
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className='header-container'>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div className='gif-item-header' style={{ display: 'flex', width: '70px', padding: '20px 25px' }}>
              <img src='https://media.giphy.com/media/KY2ZMhnCxP008/giphy.gif' alt='Space Invader' />
            </div>
            <div>
              <p className='header'>Arcadia</p>
            </div>
            <div className='gif-item-header' style={{ display: 'flex', width: '70px', padding: '0px 25px' }}>
              <img src='https://media.giphy.com/media/KY2ZMhnCxP008/giphy.gif' alt='Space Invader' />
            </div>
          </div>
          <p className='sub-text'>View your GIF collection in the metaverse ✨</p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className='footer-container'>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>
              <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
            </div>
            <div>
              <a
                className='footer-text'
                href={TWITTER_LINK}
                target='_blank'
                rel='noreferrer'
              >{`built by @${TWITTER_HANDLE}`}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
