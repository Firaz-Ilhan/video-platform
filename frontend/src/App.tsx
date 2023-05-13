import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import {Header} from './component/header/Header'
import {Video} from './component/video/Video'
import {Login} from './component/auth/Login'
import {Register} from './component/auth/Register'
import {UploadVideo} from './component/upload/UploadVideo'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Video />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/video-upload" element={<UploadVideo />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
