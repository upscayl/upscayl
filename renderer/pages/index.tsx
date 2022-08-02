import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'

const IndexPage = () => {
  useEffect(() => {
    const handleMessage = (_event:any, args:any) => console.log(args)

    // add a listener to 'message' channel
    global.ipcRenderer.addListener('filename', handleMessage)

    return () => {
      global.ipcRenderer.removeListener('filename', handleMessage)
    }
  }, [])

  const filePick = () => {
    global.ipcRenderer.send('file')
  }

  return (
    <Layout title="Home | Next.js + TypeScript + Electron Example">
      <h1>Hello Next.js 👋</h1>
      <button onClick={filePick}>Choose File</button>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </Layout>
  )
}

export default IndexPage
