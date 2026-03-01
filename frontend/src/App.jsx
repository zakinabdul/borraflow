import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path='/editor' element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App