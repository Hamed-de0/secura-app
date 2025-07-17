import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
      <h1>Welcome to Secura ISMS Dashboard</h1>
      <p>Let’s manage your ISO 27001 assets, risks, and policies.</p>
    </div>
    </>
  )
}

export default App
