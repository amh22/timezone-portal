import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, Provider, web3 } from '@project-serum/anchor'
import MiddleEllipsis from 'react-middle-ellipsis'
import idl from './idl.json'
import kp from './keypair.json'
import { useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address)

// Set our network to devnet.
const network = clusterApiUrl('devnet')

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: 'processed',
}

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

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't be initialized.
    if (gifList === null) {
      return (
        <div className='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    }
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className='connected-container'>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendGif()
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 'auto',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex' }}>
                <input
                  type='text'
                  placeholder='Enter gif link!'
                  value={inputValue}
                  onChange={onInputChange}
                  style={{ color: '#24292e', width: '350px', margin: '20px 20px' }}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <button type='submit' className='cta-button submit-gif-button'>
                  Submit
                </button>
              </div>
            </div>
          </form>
          <div className='gif-grid'>
            {/* We use index as the key instead, also, the src is now item.gifLink */}
            {gifList.map((item, index) => (
              <div className='gif-item' key={index}>
                <div>
                  <img src={item.gifLink} alt={item.gifLink} />
                </div>
                <div style={{ width: '300px', color: 'white' }}>
                  <p>Submitted by:</p>
                  <MiddleEllipsis>
                    <span>{item.userAddress.toString()}</span>
                  </MiddleEllipsis>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  const onInputChange = (event) => {
    const { value } = event.target
    setInputValue(value)
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new Provider(connection, window.solana, opts.preflightCommitment)
    return provider
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider()
      const program = new Program(idl, programID, provider)
      console.log('ping')
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      })
      console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString())
      await getGifList()
    } catch (error) {
      console.log('Error creating BaseAccount account:', error)
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No gif link given!')
      return
    }
    console.log('Gif link:', inputValue)
    try {
      const provider = getProvider()
      const program = new Program(idl, programID, provider)

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      console.log('GIF successfully sent to program', inputValue)

      await getGifList()
      setInputValue('')
    } catch (error) {
      console.log('Error sending GIF:', error)
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

  const getGifList = async () => {
    try {
      const provider = getProvider()
      const program = new Program(idl, programID, provider)
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey)

      console.log('Got the account', account)
      setGifList(account.gifList)
    } catch (error) {
      console.log('Error in getGifList: ', error)
      setGifList(null)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...')
      getGifList()
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
          <p className='sub-text'>A collection of Arcade Game GIF's in the metaverse ✨</p>
          <p className='sub-text'>Add your favourite to the collection!</p>
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
