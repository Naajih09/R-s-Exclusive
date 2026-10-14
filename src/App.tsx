import { storeConfig } from './config/store'

function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
        {storeConfig.storeName}
      </h1>
    </main>
  )
}

export default App
