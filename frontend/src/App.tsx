import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './AmplifyConfig'
import './App.css'
import { Confirmation } from './component/auth/Confirmation'
import { Login } from './component/auth/Login'
import { Register } from './component/auth/Register'
import { Header } from './component/header/Header'
import { Profile } from './component/profile/Profile'
import { UploadVideo } from './component/upload/UploadVideo'
import { Video } from './component/video/Video'
 
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/video-upload" element={<UploadVideo />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
